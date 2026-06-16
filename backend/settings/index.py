"""Настройки сайта: получение и обновление (только creator)."""
import json, os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def get_user_by_token(conn, token: str):
    if not token or ':' not in token:
        return None
    try:
        uid = int(token.split(':')[0])
    except Exception:
        return None
    with conn.cursor() as cur:
        cur.execute("SELECT id, username, role FROM users WHERE id = %s", (uid,))
        row = cur.fetchone()
        if row:
            return {'id': row[0], 'username': row[1], 'role': row[2]}
    return None

def handler(event: dict, context) -> dict:
    if event.get('httpMethod') == 'OPTIONS':
        return {'statusCode': 200, 'headers': CORS, 'body': ''}

    method = event.get('httpMethod', 'GET')
    body = {}
    if event.get('body'):
        try:
            body = json.loads(event['body'])
        except Exception:
            pass

    headers_in = event.get('headers', {}) or {}
    token = headers_in.get('X-Session-Token') or headers_in.get('x-session-token', '')

    conn = get_conn()
    try:
        # GET — все настройки
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute("SELECT key, value FROM site_settings")
                rows = cur.fetchall()
            settings = {r[0]: r[1] for r in rows}
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps(settings)}

        # PUT — обновить настройки (только creator)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] != 'creator':
                return {'statusCode': 403, 'headers': CORS, 'body': json.dumps({'error': 'Нет доступа'})}
            with conn.cursor() as cur:
                for key, value in body.items():
                    cur.execute(
                        "INSERT INTO site_settings (key, value) VALUES (%s, %s) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                        (key, str(value))
                    )
                conn.commit()
            return {'statusCode': 200, 'headers': CORS, 'body': json.dumps({'ok': True})}

        return {'statusCode': 404, 'headers': CORS, 'body': json.dumps({'error': 'Not found'})}
    finally:
        conn.close()
