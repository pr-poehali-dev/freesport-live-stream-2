import json
import os
import psycopg2
import urllib.request
import urllib.error
from typing import Dict, Any, Optional

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление трансляциями и получение прямых ссылок на стримы
    Args: event - httpMethod GET/POST/PUT/DELETE, queryParams для get-stream
    Returns: HTTP response с данными или результатом
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = psycopg2.connect(os.environ['DATABASE_URL'])
    cur = conn.cursor()
    
    if method == 'GET':
        params = event.get('queryStringParameters') or {}
        action = params.get('action')
        
        if action == 'get-stream':
            channel = params.get('channel', '')
            platform = params.get('platform', 'kick').lower()
            
            if not channel:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Channel parameter required'}),
                    'isBase64Encoded': False
                }
            
            stream_url: Optional[str] = None
            
            if platform == 'kick':
                stream_url = get_kick_stream(channel)
            elif platform == 'twitch':
                stream_url = get_twitch_stream(channel)
            elif platform == 'vk':
                stream_url = get_vk_stream(channel)
            else:
                return {
                    'statusCode': 400,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Unsupported platform'}),
                    'isBase64Encoded': False
                }
            
            if not stream_url:
                return {
                    'statusCode': 404,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'error': 'Stream not found or offline'}),
                    'isBase64Encoded': False
                }
            
            return {
                'statusCode': 200,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({
                    'stream_url': stream_url,
                    'channel': channel,
                    'platform': platform
                }),
                'isBase64Encoded': False
            }
        
        cur.execute('''
            SELECT id, title, video_url, is_live, scheduled_time, scheduled_date 
            FROM broadcasts 
            ORDER BY scheduled_date DESC, scheduled_time DESC
        ''')
        rows = cur.fetchall()
        broadcasts = []
        for row in rows:
            broadcasts.append({
                'id': row[0],
                'title': row[1],
                'video_url': row[2],
                'is_live': row[3],
                'scheduled_time': str(row[4]) if row[4] else None,
                'scheduled_date': str(row[5]) if row[5] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'broadcasts': broadcasts}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title')
        video_url = body_data.get('video_url')
        is_live = body_data.get('is_live', False)
        scheduled_time = body_data.get('scheduled_time')
        scheduled_date = body_data.get('scheduled_date')
        
        cur.execute('''
            INSERT INTO broadcasts (title, video_url, is_live, scheduled_time, scheduled_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (title, video_url, is_live, scheduled_time, scheduled_date))
        
        new_id = cur.fetchone()[0]
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 201,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True, 'id': new_id}),
            'isBase64Encoded': False
        }
    
    if method == 'PUT':
        body_data = json.loads(event.get('body', '{}'))
        broadcast_id = body_data.get('id')
        title = body_data.get('title')
        video_url = body_data.get('video_url')
        is_live = body_data.get('is_live', False)
        scheduled_time = body_data.get('scheduled_time')
        scheduled_date = body_data.get('scheduled_date')
        
        cur.execute('''
            UPDATE broadcasts 
            SET title = %s, video_url = %s, is_live = %s, 
                scheduled_time = %s, scheduled_date = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (title, video_url, is_live, scheduled_time, scheduled_date, broadcast_id))
        
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    if method == 'DELETE':
        body_data = json.loads(event.get('body', '{}'))
        broadcast_id = body_data.get('id')
        
        cur.execute('DELETE FROM broadcasts WHERE id = %s', (broadcast_id,))
        conn.commit()
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': True}),
            'isBase64Encoded': False
        }
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }


def get_kick_stream(channel: str) -> Optional[str]:
    '''Получает HLS ссылку на стрим Kick через API v2'''
    try:
        url = f'https://kick.com/api/v2/channels/{channel}/livestream'
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'application/json',
            'Referer': f'https://kick.com/{channel}'
        })
        
        with urllib.request.urlopen(req, timeout=10) as response:
            result = json.loads(response.read().decode())
            
            data = result.get('data')
            
            print(f'[Kick] Livestream data for {channel}: {data}')
            
            if not data:
                print(f'[Kick] Channel offline: {channel}')
                return None
            
            playback_url = data.get('playback_url')
            
            print(f'[Kick] playback_url: {playback_url}')
            
            if playback_url:
                return playback_url
            
            print(f'[Kick] No playback URL')
            return None
        
    except Exception as e:
        print(f'[Kick] Error for {channel}: {str(e)}')
        return None


def get_twitch_stream(channel: str) -> Optional[str]:
    '''Получает информацию о стриме Twitch (возвращает embed URL)'''
    try:
        url = f'https://www.twitch.tv/{channel}'
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode()
            
            if 'isLiveBroadcast' in html or '"isLive":true' in html:
                return f'https://player.twitch.tv/?channel={channel}&parent=localhost&muted=false'
        
        return None
    except Exception:
        return None


def get_vk_stream(video_id: str) -> Optional[str]:
    '''Получает HLS ссылку на видео/стрим VK через API'''
    try:
        oid, vid = video_id.split('_')
        
        url = f'https://vk.com/video{video_id}'
        req = urllib.request.Request(url, headers={
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/html,application/xhtml+xml,application/xml',
            'Accept-Language': 'ru-RU,ru;q=0.9,en;q=0.8',
            'Referer': 'https://vk.com/'
        })
        
        with urllib.request.urlopen(req, timeout=10) as response:
            html = response.read().decode()
            
            import re
            m3u8_match = re.search(r'"url(\d+)":"([^"]+\\.m3u8[^"]*)"', html)
            
            if m3u8_match:
                m3u8_url = m3u8_match.group(2).replace('\\/', '/')
                print(f'[VK] Found m3u8 URL: {m3u8_url}')
                return m3u8_url
            
            mp4_match = re.search(r'"url(\d+)":"([^"]+\\.mp4[^"]*)"', html)
            if mp4_match:
                mp4_url = mp4_match.group(2).replace('\\/', '/')
                print(f'[VK] Found mp4 URL: {mp4_url}')
                return mp4_url
            
            print(f'[VK] No video URL found for {video_id}')
            return None
        
    except Exception as e:
        print(f'[VK] Error for {video_id}: {str(e)}')
        return None