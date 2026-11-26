# 📌 noticeboard-api

**[🇺🇦 Українська](#-українська) · [🇬🇧 English](#-english)**

---

## 🇺🇦 Українська

REST API для дошки оголошень: реєстрація, JWT-автентифікація з refresh-токенами та CRUD оголошень з перевіркою власника. Це чистий JSON API без рендерингу HTML. Клієнтом може бути React, мобільний застосунок або будь-що, що вміє слати HTTP-запити.

### Можливості

- Реєстрація та вхід, паролі зберігаються як **bcrypt**-хеші
- **JWT**: access token живе 15 хв, refresh token живе 7 днів, з **token rotation**
- Публічний перегляд оголошень з **пагінацією**, **пошуком** по `title` без урахування регістру та **сортуванням**
- Створення, редагування й видалення оголошень доступні тільки автентифікованим користувачам і тільки для **власних** оголошень
- Валідація всіх вхідних даних через **Zod**
- Документація **OpenAPI / Swagger UI** за адресою `/api-docs`

### Стек

| Шар | Технологія |
|---|---|
| Runtime | Node.js, TypeScript (ESM) |
| HTTP | Express |
| ORM / БД | Prisma 7, PostgreSQL 16 (Docker) |
| Auth | jsonwebtoken, bcrypt |
| Валідація | Zod |
| Документація | @asteasolutions/zod-to-openapi, swagger-ui-express |

### Швидкий старт

```bash
git clone https://github.com/<your-username>/noticeboard-api.git
cd noticeboard-api
npm install
cp  .env       
docker compose up -d        
npx prisma migrate dev     
npx prisma generate
npm run dev
```

API: `http://localhost:3000`, документація: `http://localhost:3000/api-docs`

### Змінні середовища

```env
DATABASE_URL="postgresql://user:password@localhost:5432/noticeboard"
JWT_SECRET=your_secret_key_here
PORT=3000
```

### Ендпоінти

#### Auth

| Метод | Шлях | Доступ | Опис |
|---|---|---|---|
| POST | `/auth/register` | public | Реєстрація, повертає `user` і пару токенів (201) |
| POST | `/auth/login` | public | Вхід, повертає `user` і нову пару токенів |
| POST | `/auth/refresh` | public | Нова пара токенів за refresh token (rotation) |
| POST | `/auth/logout` | 🔒 | Інвалідує refresh token (204) |
| GET | `/auth/me` | 🔒 | Профіль поточного користувача |

#### Announcements

| Метод | Шлях | Доступ | Опис |
|---|---|---|---|
| GET | `/announcements?page=1&search=&sort=newest` | public | Список з пагінацією (10 на сторінку) |
| GET | `/announcements/:id` | public | Одне оголошення з даними автора |
| POST | `/announcements` | 🔒 | Створення (201) |
| PATCH | `/announcements/:id` | 🔒 власник | Часткове оновлення |
| DELETE | `/announcements/:id` | 🔒 власник | Видалення (204) |

🔒 означає заголовок `Authorization: Bearer <accessToken>`.

### Коди відповідей

| Код | Коли |
|---|---|
| 400 | Невалідне тіло, параметри або query |
| 401 | Немає токена, токен невалідний/прострочений, невірні облікові дані |
| 403 | Спроба змінити чи видалити чуже оголошення |
| 404 | Ресурс не знайдено |
| 409 | Username або email уже зайняті |

### Як працює автентифікація

```
register / login ──► { accessToken (15m), refreshToken (7d) }
                              │                    │
             Authorization: Bearer ...        зберігається в БД
                              │                    │
                     захищені маршрути    access прострочився?
                                                   ▼
                                    POST /auth/refresh { refreshToken }
                                    старий токен видаляється з БД,
                                    видається й записується нова пара
```

### Приклад

```bash
# реєстрація
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ivan_petrenko","email":"ivan@example.com","password":"secret123","name":"Іван"}'

# створення оголошення
curl -X POST http://localhost:3000/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title":"Продам ноутбук ASUS","description":"Відмінний стан, 16GB RAM","price":18000,"category":"sale"}'
```

### Структура

```
├── prisma/
│   ├── schema.prisma
│   └── client.ts
├── src/
│   ├── controllers/   # бізнес-логіка маршрутів
│   ├── middleware/    # authenticate, validateBody/Params/Query
│   ├── routes/        # Express Router + реєстрація OpenAPI-шляхів
│   ├── validators/    # Zod-схеми
│   └── openapi.ts     # registry, bearerAuth, генерація документа
├── app.ts
└── .env
```

### Скрипти

| Команда | Що робить |
|---|---|
| `npm run dev` | Запуск у режимі розробки |
| `npm run build` / `npm start` | Збірка в `dist` / запуск збірки |
| `npx prisma migrate dev` | Застосувати міграції |
| `npx prisma studio` | Переглянути дані в БД через GUI |

---

## 🇬🇧 English

A REST API for a classifieds board: user registration, JWT authentication with refresh tokens, and announcement CRUD with ownership checks. It's a pure JSON API with no HTML rendering, so any HTTP client can use it, whether that's a React app, a mobile app or something else.

### Features

- Sign up and log in, with passwords stored as **bcrypt** hashes
- **JWT**: access tokens last 15 min and refresh tokens last 7 days, with **token rotation**
- Public announcement listing with **pagination**, case-insensitive **search** by `title`, and **sorting**
- Only authenticated users can create announcements, and they can edit or delete only **their own**
- Every input is validated with **Zod**
- **OpenAPI / Swagger UI** documentation at `/api-docs`

### Tech stack

| Layer | Technology |
|---|---|
| Runtime | Node.js, TypeScript (ESM) |
| HTTP | Express |
| ORM / DB | Prisma 7, PostgreSQL 16 (Docker) |
| Auth | jsonwebtoken, bcrypt |
| Validation | Zod |
| Docs | @asteasolutions/zod-to-openapi, swagger-ui-express |

### Getting started

```bash
git clone https://github.com/<your-username>/noticeboard-api.git
cd noticeboard-api
npm install
cp .env      
docker compose up -d       
npx prisma migrate dev     
npx prisma generate
npm run dev
```

API: `http://localhost:3000`, docs: `http://localhost:3000/api-docs`

### Environment variables

```env
DATABASE_URL="postgresql://user:password@localhost:5432/noticeboard"
JWT_SECRET=your_secret_key_here
PORT=3000
```

### Endpoints

#### Auth

| Method | Path | Access | Description |
|---|---|---|---|
| POST | `/auth/register` | public | Sign up and get `user` plus a token pair (201) |
| POST | `/auth/login` | public | Log in and get `user` plus a new token pair |
| POST | `/auth/refresh` | public | Swap a refresh token for a new pair (rotation) |
| POST | `/auth/logout` | 🔒 | Invalidate the refresh token (204) |
| GET | `/auth/me` | 🔒 | Get the current user's profile |

#### Announcements

| Method | Path | Access | Description |
|---|---|---|---|
| GET | `/announcements?page=1&search=&sort=newest` | public | Paginated list (10 per page) |
| GET | `/announcements/:id` | public | A single announcement with author data |
| POST | `/announcements` | 🔒 | Create an announcement (201) |
| PATCH | `/announcements/:id` | 🔒 owner | Update some fields |
| DELETE | `/announcements/:id` | 🔒 owner | Delete an announcement (204) |

🔒 means the request needs the `Authorization: Bearer <accessToken>` header.

### Status codes

| Code | When |
|---|---|
| 400 | Invalid body, route params or query |
| 401 | Token missing, invalid or expired, or wrong credentials |
| 403 | Editing or deleting someone else's announcement |
| 404 | Resource not found |
| 409 | Username or email already taken |

### Authentication flow

```
register / login ──► { accessToken (15m), refreshToken (7d) }
                              │                    │
             Authorization: Bearer ...        stored in the DB
                              │                    │
                      protected routes      access token expired?
                                                   ▼
                                    POST /auth/refresh { refreshToken }
                                    the old token is deleted from the DB
                                    and a new pair is issued and stored
```

### Example

```bash
# sign up
curl -X POST http://localhost:3000/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"ivan_petrenko","email":"ivan@example.com","password":"secret123","name":"Ivan"}'

# create an announcement
curl -X POST http://localhost:3000/announcements \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <accessToken>" \
  -d '{"title":"Selling ASUS laptop","description":"Excellent condition, 16GB RAM","price":18000,"category":"sale"}'
```

### Project structure

```
├── prisma/
│   ├── schema.prisma
│   └── client.ts
├── src/
│   ├── controllers/   # route business logic
│   ├── middleware/    # authenticate, validateBody/Params/Query
│   ├── routes/        # Express routers + OpenAPI path registration
│   ├── validators/    # Zod schemas
│   └── openapi.ts     # registry, bearerAuth, document generation
├── app.ts
└── .env
```

### Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` / `npm start` | Build to `dist` / run the build |
| `npx prisma migrate dev` | Apply migrations |
| `npx prisma studio` | Browse the database in a GUI |
