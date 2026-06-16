"""Новости сервера: list, create, update, delete через action + id в body/query."""
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

def resp(code: int, data):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}

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

    qs = event.get('queryStringParameters') or {}
    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Session-Token') or headers_in.get('x-session-token', '')

    conn = get_conn()
    try:
        # GET → список новостей
        if method == 'GET':
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, title, content, author_name, created_at FROM news ORDER BY created_at DESC LIMIT 50"
                )
                rows = cur.fetchall()
            return resp(200, [
                {'id': r[0], 'title': r[1], 'content': r[2], 'author_name': r[3], 'created_at': str(r[4])}
                for r in rows
            ])

        # POST → создать новость
        if method == 'POST':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('creator', 'admin'):
                return resp(403, {'error': 'Нет доступа'})
            title   = (body.get('title') or '').strip()
            content = (body.get('content') or '').strip()
            if not title or not content:
                return resp(400, {'error': 'Заполните заголовок и текст'})
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO news (title, content, author_id, author_name) VALUES (%s,%s,%s,%s) RETURNING id, created_at",
                    (title, content, user['id'], user['username'])
                )
                row = cur.fetchone()
                conn.commit()
            return resp(200, {
                'id': row[0], 'title': title, 'content': content,
                'author_name': user['username'], 'created_at': str(row[1])
            })

        # PUT → редактировать (id в body)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('creator', 'admin'):
                return resp(403, {'error': 'Нет доступа'})
            news_id = body.get('id')
            title   = (body.get('title') or '').strip()
            content = (body.get('content') or '').strip()
            if not news_id:
                return resp(400, {'error': 'Укажите id'})
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE news SET title=%s, content=%s, updated_at=NOW() WHERE id=%s",
                    (title, content, news_id)
                )
                conn.commit()
            return resp(200, {'ok': True})

        # DELETE → удалить (id в body или query)
        if method == 'DELETE':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('creator', 'admin'):
                return resp(403, {'error': 'Нет доступа'})
            news_id = body.get('id') or qs.get('id')
            if not news_id:
                return resp(400, {'error': 'Укажите id'})
            with conn.cursor() as cur:
                cur.execute("DELETE FROM news WHERE id=%s", (int(news_id),))
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
