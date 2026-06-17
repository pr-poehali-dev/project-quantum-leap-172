"""Настройки сайта: получение, обновление (creator) и загрузка изображений (admin/creator)."""
import json, os, base64, uuid
import psycopg2
import boto3

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

ALLOWED = {'image/png': 'png', 'image/jpeg': 'jpg', 'image/jpg': 'jpg', 'image/webp': 'webp', 'image/gif': 'gif'}
MAX_BYTES = 5 * 1024 * 1024


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
            return resp(200, settings)

        # POST — загрузка изображения в S3 (admin/creator)
        if method == 'POST':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('admin', 'creator'):
                return resp(403, {'error': 'Нет доступа'})
            content_type = body.get('content_type', '')
            data_b64 = body.get('data', '')
            if content_type not in ALLOWED:
                return resp(400, {'error': 'Поддерживаются PNG, JPG, WEBP, GIF'})
            if ',' in data_b64:
                data_b64 = data_b64.split(',', 1)[1]
            try:
                raw = base64.b64decode(data_b64)
            except Exception:
                return resp(400, {'error': 'Ошибка декодирования файла'})
            if len(raw) > MAX_BYTES:
                return resp(400, {'error': 'Файл больше 5 МБ'})
            ext = ALLOWED[content_type]
            key = f"site/{uuid.uuid4().hex}.{ext}"
            s3 = boto3.client(
                's3',
                endpoint_url='https://bucket.poehali.dev',
                aws_access_key_id=os.environ['AWS_ACCESS_KEY_ID'],
                aws_secret_access_key=os.environ['AWS_SECRET_ACCESS_KEY'],
            )
            s3.put_object(Bucket='files', Key=key, Body=raw, ContentType=content_type)
            url = f"https://cdn.poehali.dev/projects/{os.environ['AWS_ACCESS_KEY_ID']}/bucket/{key}"
            return resp(200, {'url': url})

        # PUT — обновить настройки (только creator)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] != 'creator':
                return resp(403, {'error': 'Нет доступа'})
            with conn.cursor() as cur:
                for key, value in body.items():
                    cur.execute(
                        "INSERT INTO site_settings (key, value) VALUES (%s, %s) ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value",
                        (key, str(value))
                    )
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
