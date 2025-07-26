
# ♟️ Multiplayer Chess App

A real-time 2-player chess game built with **Next.js App Router**, **Socket.IO**, and **chess.js**.

---

## 📸 Preview

<p align="center">
  <img src="public/img/preview-1.png" alt="Chess App Preview 1" width="400"/>
  <img src="public/img/Ground-Chess 2.png" alt="Chess App Preview 2" width="400"/>
</p>

---

## 🚀 Features

- Real-time multiplayer with **Socket.IO**
- Automatic color assignment (White, Black, or Spectator)
- Move sync across clients
- Game history & match results
- PostgreSQL + Prisma for persistent storage

---

## 🛠️ Getting Started

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/multiplayer-chess-app.git
cd multiplayer-chess-app
npm install
````

### 2. Set Up Environment Variables

Create a `.env` file:

```env
JWT_SECRET=your_secret
DATABASE_URL=your_postgres_url
```

### 3. Configure Database (PostgreSQL + Prisma)

* Make sure PostgreSQL is running
* Update your `.env`:

```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chess_app_db"
```

* Install dependencies:

```bash
npm install @prisma/client prisma pg
npx prisma init
npx prisma db push
```



### 4. Start the Dev Server

```bash
npm run dev
```

Visit `http://localhost:3000/game/vs-player/room1` in two browser tabs to test multiplayer.

---

## 📅 Roadmap

* ✅ Real-time gameplay
* ✅ Color assignment
* ✅ Move sync
* ✅ Match history
* ✅ Play vs bot
* ✅ Responsive UI

---

## 🙋 FAQ

**How do I play with a friend?**
Share a room URL (e.g., `/game/vs-player/room1`). Anyone with the link can join.

**How does the database work?**
Prisma + PostgreSQL handles game data. See "Getting Started" for setup.

---

## 🤝 Contributing

Contributions and suggestions are welcome! Feel free to open an issue or PR.

---

## 📖 License

MIT

```
