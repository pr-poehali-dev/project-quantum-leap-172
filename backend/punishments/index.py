"""Система наказаний: выдача банов/мутов с лимитами по ролям, снятие, список, журнал."""
import json, os
from datetime import datetime, timedelta
import psycopg2

CORS = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Session-Token',
}

# Лимиты по ролям (в часах). None = без ограничений.
BAN_LIMITS = {
    'helper': 0,          # хелпер не может банить
    'moderator': 30 * 24, # 30 дней
    'admin': None,        # без ограничений
    'creator': None,
}
MUTE_LIMITS = {
    'helper': 12,         # 12 часов
    'moderator': 40,      # 40 часов
    'admin': 72,          # 72 часа
    'creator': None,
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


def log_action(conn, actor, action):
    with conn.cursor() as cur:
        cur.execute(
            "INSERT INTO action_logs (actor_name, actor_role, action) VALUES (%s,%s,%s)",
            (actor['username'], actor['role'], action)
        )


def resp(code, data):
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, ensure_ascii=False, default=str)}


def row_to_dict(r):
    return {
        'id': r[0], 'player_name': r[1], 'reason': r[2], 'punishment_type': r[3],
        'issued_at': str(r[4]), 'expires_at': str(r[5]) if r[5] else None,
        'admin_name': r[6], 'proof_url': r[7], 'active': r[8],
        'removed_by': r[9], 'removed_at': str(r[10]) if r[10] else None,
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

    qs = event.get('queryStringParameters') or {}
    headers_in = event.get('headers') or {}
    token = headers_in.get('X-Session-Token') or headers_in.get('x-session-token', '')

    conn = get_conn()
    try:
        # GET → список наказаний (всем) или журнал (admin/creator)
        if method == 'GET':
            action = qs.get('action', 'list')

            if action == 'logs':
                user = get_user_by_token(conn, token)
                if not user or user['role'] not in ('admin', 'creator'):
                    return resp(403, {'error': 'Нет доступа'})
                with conn.cursor() as cur:
                    cur.execute(
                        "SELECT id, actor_name, actor_role, action, created_at FROM action_logs ORDER BY created_at DESC LIMIT 100"
                    )
                    rows = cur.fetchall()
                return resp(200, [
                    {'id': r[0], 'actor_name': r[1], 'actor_role': r[2], 'action': r[3], 'created_at': str(r[4])}
                    for r in rows
                ])

            # список наказаний; опциональный фильтр ?player=
            player = qs.get('player')
            with conn.cursor() as cur:
                if player:
                    cur.execute(
                        "SELECT id, player_name, reason, punishment_type, issued_at, expires_at, admin_name, proof_url, active, removed_by, removed_at "
                        "FROM punishments WHERE LOWER(player_name)=LOWER(%s) ORDER BY issued_at DESC", (player,)
                    )
                else:
                    cur.execute(
                        "SELECT id, player_name, reason, punishment_type, issued_at, expires_at, admin_name, proof_url, active, removed_by, removed_at "
                        "FROM punishments ORDER BY issued_at DESC LIMIT 200"
                    )
                rows = cur.fetchall()
            return resp(200, [row_to_dict(r) for r in rows])

        # POST → выдать наказание
        if method == 'POST':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('helper', 'moderator', 'admin', 'creator'):
                return resp(403, {'error': 'У вас нет прав для выполнения этого действия'})

            player_name = (body.get('player_name') or '').strip()
            reason = (body.get('reason') or '').strip()
            ptype = body.get('punishment_type')  # ban | mute
            proof_url = (body.get('proof_url') or '').strip()
            hours = body.get('hours')  # число часов, None/0 → перманент (только для бана у admin/creator)

            if not player_name or not reason or ptype not in ('ban', 'mute'):
                return resp(400, {'error': 'Заполните все поля'})

            limits = BAN_LIMITS if ptype == 'ban' else MUTE_LIMITS
            limit = limits.get(user['role'])

            if ptype == 'ban' and limit == 0:
                return resp(403, {'error': 'Хелпер не может выдавать баны'})

            try:
                hours_int = int(hours) if hours else 0
            except Exception:
                hours_int = 0

            # проверка лимита
            if limit is not None:
                if hours_int == 0 or hours_int > limit:
                    return resp(403, {'error': f'Максимальный срок для вашей роли: {limit} ч'})

            expires_at = None
            if hours_int > 0:
                expires_at = datetime.utcnow() + timedelta(hours=hours_int)

            with conn.cursor() as cur:
                cur.execute(
                    "INSERT INTO punishments (player_name, reason, punishment_type, expires_at, admin_name, proof_url) "
                    "VALUES (%s,%s,%s,%s,%s,%s) RETURNING id, player_name, reason, punishment_type, issued_at, expires_at, admin_name, proof_url, active, removed_by, removed_at",
                    (player_name, reason, ptype, expires_at, user['username'], proof_url)
                )
                row = cur.fetchone()
                log_action(conn, user, f"Выдал {ptype} игроку {player_name} (причина: {reason})")
                conn.commit()
            return resp(200, row_to_dict(row))

        # PUT → снять наказание (admin/creator или сам выдавший)
        if method == 'PUT':
            user = get_user_by_token(conn, token)
            if not user or user['role'] not in ('moderator', 'admin', 'creator'):
                return resp(403, {'error': 'У вас нет прав для выполнения этого действия'})
            pid = body.get('id')
            if not pid:
                return resp(400, {'error': 'Укажите id'})
            with conn.cursor() as cur:
                cur.execute("SELECT admin_name FROM punishments WHERE id=%s", (pid,))
                pr = cur.fetchone()
                if not pr:
                    return resp(404, {'error': 'Наказание не найдено'})
                # модератор может снимать только свои; admin/creator — любые
                if user['role'] == 'moderator' and pr[0] != user['username']:
                    return resp(403, {'error': 'Можно снимать только свои наказания'})
                cur.execute(
                    "UPDATE punishments SET active=FALSE, removed_by=%s, removed_at=NOW() WHERE id=%s",
                    (user['username'], pid)
                )
                log_action(conn, user, f"Снял наказание #{pid}")
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
