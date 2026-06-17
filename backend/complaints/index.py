"""Жалобы и обжалования: подача игроком, рассмотрение персоналом."""
import json, os
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

KINDS = ('player_report', 'appeal', 'staff_report')


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


def resp(code, data):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def row_to_dict(r):
    return {
        'id': r[0], 'kind': r[1], 'author_name': r[2], 'target_name': r[3],
        'text': r[4], 'proof_url': r[5], 'punishment_id': r[6], 'status': r[7],
        'created_at': str(r[8]), 'reviewed_by': r[9], 'reviewed_at': str(r[10]) if r[10] else None,
    }


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

    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Session-Token') or headers_in.get('x-session-token', '')

    conn = get_conn()
    try:
        # GET → список (только персонал)
        if method == 'GET':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('helper', 'moderator', 'admin', 'creator'):
                return resp(403, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                cur.execute(
                    "SELECT id, kind, author_name, target_name, text, proof_url, punishment_id, status, created_at, reviewed_by, reviewed_at "
                    "FROM complaints ORDER BY (status='open') DESC, created_at DESC LIMIT 200"
                )
                rows = cur.fetchall()
            return resp(200, [row_to_dict(r) for r in rows])

        # POST → подать жалобу/обжалование (любой авторизованный)
        if method == 'POST':
            user = get_user_by_token(conn, token)
            if not user:
                return resp(401, {'error': 'Войдите в аккаунт'})
            kind = body.get('kind')
            text = (body.get('text') or '').strip()
            target = (body.get('target_name') or '').strip()
            proof = (body.get('proof_url') or '').strip()
            pid = body.get('punishment_id')
            if kind not in KINDS or not text:
                return resp(400, {'error': 'Заполните текст'})
            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO complaints (kind, author_name, target_name, text, proof_url, punishment_id) "
                    "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id, kind, author_name, target_name, text, proof_url, punishment_id, status, created_at, reviewed_by, reviewed_at",
                    (kind, user['username'], target, text, proof, pid)
                )
                row = cur.fetchone()
                conn.commit()
            return resp(200, row_to_dict(row))

        # PUT → рассмотреть (admin/creator; модератор может рассматривать жалобы игроков)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('moderator', 'admin', 'creator'):
                return resp(403, {'error': 'Нет доступа'})
            cid = body.get('id')
            status = body.get('status')
            if not cid or status not in ('accepted', 'rejected', 'open'):
                return resp(400, {'error': 'Неверные данные'})
            with conn.cursor() as cur:
                cur.execute(
                    "UPDATE complaints SET status=%s, reviewed_by=%s, reviewed_at=NOW() WHERE id=%s",
                    (status, user['username'], cid)
                )
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
