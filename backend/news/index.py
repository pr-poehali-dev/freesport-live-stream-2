import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Управление новостями
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
            SELECT id, title, excerpt, content, image_url, published_date 
            FROM news 
            ORDER BY published_date DESC
        ''')
        rows = cur.fetchall()
        news_items = []
        for row in rows:
            news_items.append({
                'id': row[0],
                'title': row[1],
                'excerpt': row[2],
                'content': row[3],
                'image_url': row[4],
                'published_date': str(row[5]) if row[5] else None
            })
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'news': news_items}),
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        title = body_data.get('title')
        excerpt = body_data.get('excerpt')
        content = body_data.get('content', '')
        image_url = body_data.get('image_url', '')
        published_date = body_data.get('published_date')
        
        cur.execute('''
            INSERT INTO news (title, excerpt, content, image_url, published_date)
            VALUES (%s, %s, %s, %s, %s)
            RETURNING id
        ''', (title, excerpt, content, image_url, published_date))
        
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
        news_id = body_data.get('id')
        title = body_data.get('title')
        excerpt = body_data.get('excerpt')
        content = body_data.get('content', '')
        image_url = body_data.get('image_url', '')
        published_date = body_data.get('published_date')
        
        cur.execute('''
            UPDATE news 
            SET title = %s, excerpt = %s, content = %s, 
                image_url = %s, published_date = %s, updated_at = CURRENT_TIMESTAMP
            WHERE id = %s
        ''', (title, excerpt, content, image_url, published_date, news_id))
        
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
        news_id = body_data.get('id')
        
        cur.execute('DELETE FROM news WHERE id = %s', (news_id,))
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
