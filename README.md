# مجالس

سجل مجالس بالعربية — Next.js و Prisma و Telegram OIDC.

## الإعداد

1. انسخ البيئة:

```bash
cp .env.example .env.local
```

2. عبّئ `DATABASE_URL` و `TELEGRAM_CLIENT_ID` و `TELEGRAM_CLIENT_SECRET` و `APP_URL`.

3. في BotFather فعّل Web Login ووجّه الـ redirect إلى:

`{APP_URL}/api/auth/callback/telegram`

4. ثبّت وشغّل المهاجرات:

```bash
bun install
bun run db:deploy
bun run dev
```

5. سجّل الدخول مرة عبر تيليغرام (يُنشأ صف في `connections` فقط، ثم تُحوَّل إلى `/unauthorized`).

6. عيّن أول مشرف يدويًا:

```sql
INSERT INTO users (id, name, image, role, is_blocked, created_at, updated_at)
SELECT
  gen_random_uuid()::text,
  name,
  avatar,
  'admin',
  false,
  NOW(),
  NOW()
FROM connections
WHERE provider = 'telegram' AND username = 'your_username'
RETURNING id;

UPDATE connections
SET user_id = 'USER_ID'
WHERE username = 'your_username' AND provider = 'telegram';
```

بعدها من صفحة **المستخدمون**: إنشاء/تعديل، ربط تيليغرام، الأدوار، والحظر (بدون حذف).

## نموذج المصادقة

- تسجيل تيليغرام → `connections` فقط (`provider_id` = Telegram ID، `username` = اسم تيليغرام)
- `users` بدون username — الاسم والدور والحظر فقط
- بدون مستخدم مربوط أو حساب محظور → `/unauthorized`
- الحضور من جدول `users`
