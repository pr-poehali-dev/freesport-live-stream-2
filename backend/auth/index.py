import json
import os
import bcrypt
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Аутентификация администратора
    Args: event - httpMethod, body с password
    Returns: HTTP response с токеном или ошибкой
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type, X-Auth-Token',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    if method == 'POST':
        body_data = json.loads(event.get('body', '{}'))
        password = body_data.get('password', '')
        
        print(f"Login attempt with password length: {len(password)}")
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute('SELECT password_hash FROM admin LIMIT 1')
        result = cur.fetchone()
        
        print(f"DB result: {result is not None}")
        
        if result:
            stored_hash = result[0]
            print(f"Stored hash: {stored_hash[:20]}...")
            
            try:
                password_matches = bcrypt.checkpw(password.encode('utf-8'), stored_hash.encode('utf-8'))
                print(f"Password matches: {password_matches}")
                
                if password_matches:
                    cur.close()
                    conn.close()
                    return {
                        'statusCode': 200,
                        'headers': {
                            'Content-Type': 'application/json',
                            'Access-Control-Allow-Origin': '*'
                        },
                        'body': json.dumps({'success': True, 'token': 'admin-authenticated'}),
                        'isBase64Encoded': False
                    }
            except Exception as e:
                print(f"Bcrypt error: {str(e)}")
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Неверный пароль'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }