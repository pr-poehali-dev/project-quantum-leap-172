"""Аутентификация: register, login, me, users, set_role — все через action в body/query."""
import json, os, hashlib, secrets
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

def get_conn():
    return psycopg2.connect(os.environ['DATABASE_URL'])

def hash_password(password: str, salt: str = None):
    if not salt:
        salt = secrets.token_hex(16)
    h = hashlib.pbkdf2_hmac('sha256', password.encode(), salt.encode(), 260000)
    return f"{salt}${h.hex()}"

def verify_password(password: str, stored: str):
    try:
        salt = stored.split('$')[0]
        return hash_password(password, salt) == stored
    except Exception:
        return False

def make_token(user_id: int):
    return f"{user_id}:{secrets.token_hex(24)}"

def get_user_by_token(conn, token: str):
    if not token or ':' not in token:
        return None
    try:
        uid = int(token.split(':')[0])
    except Exception:
        return None
    with conn.cursor() as cur:
        cur.execute("SELECT id, username, role, privilege FROM users WHERE id = %s", (uid,))
        row = cur.fetchone()
    if row:
        return {'id': row[0], 'username': row[1], 'role': row[2], 'privilege': row[3]}
    return None

def resp(code: int, data):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data)}

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
        # GET → me или users
        if method == 'GET':
            action = qs.get('action', 'me')
            if action == 'me':
                user = get_user_by_token(conn, token)
                if not user:
                    return resp(401, {'error': 'Не авторизован'})
                return resp(200, user)
            if action == 'users':
                user = get_user_by_token(conn, token)
                if not user or user['role'] not in ('creator', 'admin'):
                    return resp(403, {'error': 'Нет доступа'})
                with conn.cursor() as cur:
                    cur.execute("SELECT id, username, role, privilege, created_at FROM users ORDER BY id")
                    rows = cur.fetchall()
                return resp(200, [
                    {'id': r[0], 'username': r[1], 'role': r[2], 'privilege': r[3], 'created_at': str(r[4])}
                    for r in rows
                ])
            return resp(400, {'error': 'Неизвестное действие'})

        # POST → register | login
        if method == 'POST':
            action = body.get('action')
            if action == 'register':
                username = (body.get('username') or '').strip()
                password = body.get('password') or ''
                if not username or not password:
                    return resp(400, {'error': 'Заполните все поля'})
                if len(username) < 3 or len(username) > 32:
                    return resp(400, {'error': 'Ник: 3–32 символа'})
                if len(password) < 6:
                    return resp(400, {'error': 'Пароль минимум 6 символов'})
                pw_hash = hash_password(password)
                with conn.cursor() as cur:
                    try:
                        cur.execute(
                            "INSERT INTO users (username, password_hash, role) VALUES (%s, %s, 'player') RETURNING id",
                            (username, pw_hash)
                        )
                        uid = cur.fetchone()[0]
                        conn.commit()
                    except psycopg2.errors.UniqueViolation:
                        conn.rollback()
                        return resp(409, {'error': 'Ник уже занят'})
                tok = make_token(uid)
                return resp(200, {'token': tok, 'id': uid, 'username': username, 'role': 'player', 'privilege': None})

            if action == 'login':
                username = (body.get('username') or '').strip()
                password = body.get('password') or ''
                with conn.cursor() as cur:
                    cur.execute("SELECT id, password_hash, role, privilege FROM users WHERE username = %s", (username,))
                    row = cur.fetchone()
                if not row or not verify_password(password, row[1]):
                    return resp(401, {'error': 'Неверный ник или пароль'})
                tok = make_token(row[0])
                return resp(200, {'token': tok, 'id': row[0], 'username': username, 'role': row[2], 'privilege': row[3]})

            return resp(400, {'error': 'Неизвестное действие'})

        # PUT → выдача роли (только creator)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] != 'creator':
                return resp(403, {'error': 'Нет доступа'})
            target_id = body.get('target_id')
            new_role  = body.get('role')
            new_priv  = body.get('privilege') or None
            if not target_id or new_role not in ('player', 'helper', 'moderator', 'admin', 'creator'):
                return resp(400, {'error': 'Неверные данные'})
            with conn.cursor() as cur:
                cur.execute("UPDATE users SET role=%s, privilege=%s WHERE id=%s", (new_role, new_priv, target_id))
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
