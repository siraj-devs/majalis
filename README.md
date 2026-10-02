# مجالس

سجل مجالس بالعربية — Next.js و Prisma و Telegram OIDC.

## الإعداد

1. انسخ البيئة:

```bash
cp .env.example .env.local
```

2. عبّئ `DATABASE_URL` و `TELEGRAM_CLIENT_ID` و `TELEGRAM_CLIENT_SECRET` و `APP_URL`.

   الافتراضي المحلي يستخدم قاعدة `majalis` على Postgres الخاص بـ Supabase (منفذ `54422`، كما في iqraa). لا تستخدم منفذًا فيه مشروع آخر.

3. في BotFather فعّل Web Login ووجّه الـ redirect إلى:

`{APP_URL}/api/auth/callback/telegram`

4. ثبّت وشغّل المهاجرات:

```bash
bun install
bun run db:migrate
bun run dev
```

5. سجّل الدخول مرة عبر تيليغرام، ثم عيّن أول مشرف يدويًا:

```sql
UPDATE users SET is_admin = true WHERE username = 'your_username';
```

بعدها يمكن للمشرف منح صلاحيات من صفحة **المشرفون**.
