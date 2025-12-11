import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление трансляциями
    Args: event - httpMethod GET/POST/PUT/DELETE
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
