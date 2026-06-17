"""
Аутентификация + Баланс + Кейсы + Инвентарь.

AUTH:
  GET  ?action=me       → текущий пользователь
  GET  ?action=users    → список (creator/admin)
  POST action=register | login | setup
  PUT  → выдача роли (creator)

BALANCE:
  GET  ?action=balance          → мой баланс + история
  GET  ?action=balance_all      → все балансы (creator)
  POST action=topup             → пополнить (creator для любого, игрок — только себе)
  POST action=balance_set       → установить (creator)
  POST action=spend             → списать (auth user)

КЕЙСЫ:
  GET  ?action=case_items&case_id=X → предметы кейса (публично)
  GET  ?action=inventory            → инвентарь игрока (auth)
  POST action=open_case             → открыть кейс (auth, списывает баланс)
  POST action=save_items            → сохранить предметы кейса (creator)
"""
import json, os, hashlib, secrets, random
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
    return {'statusCode': code, 'headers': CORS, 'body': json.dumps(data, default=str)}

# ── Balance helpers ───────────────────────────────────────────────────────────
def ensure_balance(conn, user_id: int):
    with conn.cursor() as c:
        c.execute("""
            INSERT INTO balance (user_id, amount)
            VALUES (%s, 0)
            ON CONFLICT (user_id) DO NOTHING
        """, [user_id])
    conn.commit()

def get_balance(conn, user_id: int) -> int:
    ensure_balance(conn, user_id)
    with conn.cursor() as c:
        c.execute("SELECT amount FROM balance WHERE user_id = %s", [user_id])
        row = c.fetchone()
    return row[0] if row else 0

def add_tx(conn, user_id: int, delta: int, reason: str):
    with conn.cursor() as c:
        c.execute("""
            INSERT INTO balance_transactions (user_id, delta, reason)
            VALUES (%s, %s, %s)
        """, [user_id, delta, reason])

# ── Case helpers ──────────────────────────────────────────────────────────────
def roll_item(items: list) -> dict:
    total = sum(it['weight'] for it in items)
    r = random.randint(1, total)
    cum = 0
    for it in items:
        cum += it['weight']
        if r <= cum:
            return it
    return items[-1]

# ── Handler ───────────────────────────────────────────────────────────────────
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
        # ════════════════════════════════════════ GET ════════════════════════
        if method == 'GET':
            action = qs.get('action', 'me')

            # ── Auth ──────────────────────────────────────────────────────
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

            # ── Balance ───────────────────────────────────────────────────
            if action == 'balance':
                user = get_user_by_token(conn, token)
                if not user:
                    return resp(401, {'error': 'Не авторизован'})
                amount = get_balance(conn, user['id'])
                with conn.cursor() as c:
                    c.execute("""
                        SELECT delta, reason, created_at
                        FROM balance_transactions
                        WHERE user_id = %s
                        ORDER BY created_at DESC LIMIT 30
                    """, [user['id']])
                    txs = [{'delta': r[0], 'reason': r[1], 'created_at': r[2]}
                           for r in c.fetchall()]
                return resp(200, {'amount': amount, 'transactions': txs})

            if action == 'balance_all':
                user = get_user_by_token(conn, token)
                if not user or user['role'] != 'creator':
                    return resp(403, {'error': 'Нет доступа'})
                with conn.cursor() as c:
                    c.execute("""
                        SELECT u.id, u.username, COALESCE(b.amount, 0)
                        FROM users u
                        LEFT JOIN balance b ON b.user_id = u.id
                        ORDER BY COALESCE(b.amount, 0) DESC
                    """)
                    return resp(200, [{'id': r[0], 'username': r[1], 'amount': r[2]}
                                      for r in c.fetchall()])

            # ── Cases ─────────────────────────────────────────────────────
            if action == 'case_items':
                case_id = qs.get('case_id', '')
                with conn.cursor() as c:
                    c.execute("""
                        SELECT id, name, rarity, color, image, weight
                        FROM case_items
                        WHERE case_id = %s AND weight > 0
                        ORDER BY weight DESC
                    """, [case_id])
                    return resp(200, [
                        {'id': r[0], 'name': r[1], 'rarity': r[2],
                         'color': r[3], 'image': r[4], 'weight': r[5]}
                        for r in c.fetchall()
                    ])

            if action == 'inventory':
                user = get_user_by_token(conn, token)
                if not user:
                    return resp(401, {'error': 'Не авторизован'})
                with conn.cursor() as c:
                    c.execute("""
                        SELECT id, item_name, item_rarity, item_color, item_image,
                               case_name, obtained_at
                        FROM inventory
                        WHERE user_id = %s
                        ORDER BY obtained_at DESC
                    """, [user['id']])
                    return resp(200, [
                        {'id': r[0], 'name': r[1], 'rarity': r[2], 'color': r[3],
                         'image': r[4], 'case_name': r[5], 'obtained_at': r[6]}
                        for r in c.fetchall()
                    ])

            return resp(400, {'error': 'Неизвестное действие'})

        # ════════════════════════════════════════ POST ═══════════════════════
        if method == 'POST':
            action = body.get('action')

            # ── Auth ──────────────────────────────────────────────────────
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

            if action == 'setup':
                new_username = (body.get('username') or '').strip()
                new_password = body.get('password') or ''
                setup_key    = body.get('setup_key') or ''
                if len(new_password) < 6:
                    return resp(400, {'error': 'Пароль минимум 6 символов'})
                if not new_username or len(new_username) < 3:
                    return resp(400, {'error': 'Ник минимум 3 символа'})
                expected_key = os.environ.get('SETUP_KEY', 'mcfire-setup-2026')
                if setup_key != expected_key:
                    return resp(403, {'error': 'Неверный ключ настройки'})
                pw_hash = hash_password(new_password)
                with conn.cursor() as cur:
                    cur.execute(
                        "UPDATE users SET username=%s, password_hash=%s WHERE role='creator' AND id=(SELECT id FROM users WHERE role='creator' ORDER BY id LIMIT 1) RETURNING id",
                        (new_username, pw_hash)
                    )
                    row = cur.fetchone()
                    if not row:
                        cur.execute(
                            "INSERT INTO users (username, password_hash, role) VALUES (%s,%s,'creator') RETURNING id",
                            (new_username, pw_hash)
                        )
                        row = cur.fetchone()
                    conn.commit()
                    uid = row[0]
                tok = make_token(uid)
                return resp(200, {'token': tok, 'id': uid, 'username': new_username, 'role': 'creator', 'privilege': None, 'setup': True})

            # ── Balance ───────────────────────────────────────────────────
            if action in ('topup', 'balance_set', 'spend'):
                user = get_user_by_token(conn, token)
                if not user:
                    return resp(401, {'error': 'Не авторизован'})

                if action == 'topup':
                    target_id = int(body.get('user_id', user['id']))
                    amount    = int(body.get('amount', 0))
                    reason    = body.get('reason', 'Пополнение баланса')
                    if amount <= 0:
                        return resp(400, {'error': 'Сумма должна быть больше 0'})
                    if target_id != user['id'] and user['role'] != 'creator':
                        return resp(403, {'error': 'Нет доступа'})
                    ensure_balance(conn, target_id)
                    with conn.cursor() as c:
                        c.execute("UPDATE balance SET amount=amount+%s, updated_at=now() WHERE user_id=%s",
                                  [amount, target_id])
                        add_tx(conn, target_id, amount, reason)
                    conn.commit()
                    return resp(200, {'amount': get_balance(conn, target_id)})

                if action == 'balance_set':
                    if user['role'] != 'creator':
                        return resp(403, {'error': 'Нет доступа'})
                    target_id = int(body.get('user_id'))
                    amount    = int(body.get('amount', 0))
                    if amount < 0:
                        return resp(400, {'error': 'Баланс не может быть отрицательным'})
                    ensure_balance(conn, target_id)
                    old = get_balance(conn, target_id)
                    with conn.cursor() as c:
                        c.execute("UPDATE balance SET amount=%s, updated_at=now() WHERE user_id=%s",
                                  [amount, target_id])
                        if amount != old:
                            add_tx(conn, target_id, amount - old, 'Ручная корректировка')
                    conn.commit()
                    return resp(200, {'amount': amount})

                if action == 'spend':
                    amount = int(body.get('amount', 0))
                    reason = body.get('reason', 'Покупка')
                    if amount <= 0:
                        return resp(400, {'error': 'Сумма должна быть больше 0'})
                    cur_bal = get_balance(conn, user['id'])
                    if cur_bal < amount:
                        return resp(400, {'error': f'Недостаточно средств: нужно {amount} ₽, есть {cur_bal} ₽'})
                    with conn.cursor() as c:
                        c.execute("UPDATE balance SET amount=amount-%s, updated_at=now() WHERE user_id=%s",
                                  [amount, user['id']])
                        add_tx(conn, user['id'], -amount, reason)
                    conn.commit()
                    return resp(200, {'amount': get_balance(conn, user['id'])})

            # ── Cases ─────────────────────────────────────────────────────
            if action == 'open_case':
                user = get_user_by_token(conn, token)
                if not user:
                    return resp(401, {'error': 'Не авторизован'})
                case_id    = body.get('case_id', '')
                case_name  = body.get('case_name', 'Кейс')
                case_price = int(body.get('price', 0))

                with conn.cursor() as c:
                    c.execute("""
                        SELECT id, name, rarity, color, image, weight
                        FROM case_items WHERE case_id=%s AND weight>0
                    """, [case_id])
                    items = [{'id': r[0], 'name': r[1], 'rarity': r[2],
                              'color': r[3], 'image': r[4], 'weight': r[5]}
                             for r in c.fetchall()]

                if not items:
                    return resp(400, {'error': 'В кейсе нет предметов'})

                cur_bal = get_balance(conn, user['id'])
                if cur_bal < case_price:
                    return resp(400, {'error': f'Недостаточно средств: нужно {case_price} ₽, есть {cur_bal} ₽'})

                won = roll_item(items)

                with conn.cursor() as c:
                    c.execute("UPDATE balance SET amount=amount-%s, updated_at=now() WHERE user_id=%s",
                              [case_price, user['id']])
                    add_tx(conn, user['id'], -case_price, f'Открытие кейса «{case_name}»')
                    c.execute("""
                        INSERT INTO inventory
                          (user_id, item_name, item_rarity, item_color, item_image, case_name)
                        VALUES (%s,%s,%s,%s,%s,%s)
                        RETURNING id, obtained_at
                    """, [user['id'], won['name'], won['rarity'],
                          won['color'], won['image'], case_name])
                    inv = c.fetchone()
                conn.commit()

                return resp(200, {
                    'won':         {**won, 'inv_id': inv[0], 'obtained_at': inv[1]},
                    'new_balance': get_balance(conn, user['id']),
                    'all_items':   items,
                })

            if action == 'save_items':
                user = get_user_by_token(conn, token)
                if not user or user['role'] != 'creator':
                    return resp(403, {'error': 'Нет доступа'})
                case_id = body.get('case_id', '')
                items   = body.get('items', [])

                with conn.cursor() as c:
                    c.execute("SELECT id FROM case_items WHERE case_id=%s ORDER BY id", [case_id])
                    existing = [r[0] for r in c.fetchall()]

                    for idx, item in enumerate(items):
                        nm  = item.get('name', '')
                        rar = item.get('rarity', 'common')
                        col = item.get('color', '#9ca3af')
                        img = item.get('image', '')
                        wt  = max(1, int(item.get('weight', 10)))
                        if idx < len(existing):
                            c.execute("""
                                UPDATE case_items SET name=%s,rarity=%s,color=%s,image=%s,weight=%s
                                WHERE id=%s
                            """, [nm, rar, col, img, wt, existing[idx]])
                        else:
                            c.execute("""
                                INSERT INTO case_items (case_id,name,rarity,color,image,weight)
                                VALUES (%s,%s,%s,%s,%s,%s)
                            """, [case_id, nm, rar, col, img, wt])

                    for idx in range(len(items), len(existing)):
                        c.execute("UPDATE case_items SET weight=0 WHERE id=%s", [existing[idx]])

                conn.commit()
                return resp(200, {'ok': True})

            return resp(400, {'error': 'Неизвестное действие'})

        # ════════════════════════════════════════ PUT ════════════════════════
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
                cur.execute("UPDATE users SET role=%s, privilege=%s WHERE id=%s",
                            (new_role, new_priv, target_id))
                conn.commit()
            return resp(200, {'ok': True})

        return resp(404, {'error': 'Not found'})
    finally:
        conn.close()
