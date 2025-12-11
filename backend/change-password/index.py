import json
import os
import hashlib
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Изменение пароля администратора
    Args: event - httpMethod, body с old_password и new_password
    Returns: HTTP response с результатом
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
        old_password = body_data.get('old_password', '')
        new_password = body_data.get('new_password', '')
        
        if not new_password or len(new_password) < 6:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'success': False, 'error': 'Новый пароль должен быть не менее 6 символов'}),
                'isBase64Encoded': False
            }
        
        conn = psycopg2.connect(os.environ['DATABASE_URL'])
        cur = conn.cursor()
        
        cur.execute('SELECT password_hash FROM admin LIMIT 1')
        result = cur.fetchone()
        
        if result:
            stored_hash = result[0]
            old_hash = hashlib.sha256(old_password.encode('utf-8')).hexdigest()
            if old_hash == stored_hash:
                new_hash = hashlib.sha256(new_password.encode('utf-8')).hexdigest()
                cur.execute("UPDATE admin SET password_hash = '" + new_hash + "', updated_at = CURRENT_TIMESTAMP")
                conn.commit()
                cur.close()
                conn.close()
                
                return {
                    'statusCode': 200,
                    'headers': {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': '*'
                    },
                    'body': json.dumps({'success': True, 'message': 'Пароль успешно изменен'}),
                    'isBase64Encoded': False
                }
        
        cur.close()
        conn.close()
        
        return {
            'statusCode': 401,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'success': False, 'error': 'Неверный текущий пароль'}),
            'isBase64Encoded': False
        }
    
    return {
        'statusCode': 405,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'body': json.dumps({'error': 'Method not allowed'}),
        'isBase64Encoded': False
    }