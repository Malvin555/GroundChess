
# ♟️ Multiplayer Chess App

A real-time, 2-player chess game built with **Next.js App Router**, **Socket.IO**, and **chess.js**.  
**Note:** This project is a work in progress (WIP) — expect ongoing improvements and new features!

---

## 📸 Live Preview

<p align="center">
  <img src="public/img/preview-1.png.png" alt="GrounChess App Preview" width="600"/>
</p>

## 🚀 Features

- **Real-time multiplayer** with Socket.IO
- **Automatic color assignment:** White, Black, or Spectator maybe
- **Move synchronization** across browsers
- **JWT-based login** *(work without authentication)*
- **Game history & match results** *(coming soon)*
- **Bot opponent mode** *(WIP filter)*

## 🛠️ Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/yourusername/multiplayer-chess-app.git
cd multiplayer-chess-app
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env` file in the root directory:

```
JWT_SECRET=your_secret
DATABASE_URL=your_postgres_url
```

> Replace `your_secret` and `your_postgres_url` with your own credentials.

### 4. Database Setup

This app uses **PostgreSQL** for persistent data (users, games, match history) and **Prisma** as the ORM.

- Ensure PostgreSQL is installed and running.
- Create a database (e.g., `chess_app_db`).
- Update your `.env`:

  ```
  DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/chess_app_db"
  ```

  Replace `USER`, `PASSWORD`, and `chess_app_db` as needed.

#### Install Prisma and Client Libraries

```bash
npm install @prisma/client
npm install --save-dev prisma
npm install pg
```

#### Initialize Prisma

```bash
npx prisma init
```
### 5. Run the Development Server

```bash
npm run dev
```

### 6. Test Multiplayer Locally

Open multiple browser tabs and navigate to:

```
http://localhost:3000/game/vs-player/room1
```

Each tab will be assigned a color (White/Black) or Spectator mode automatically.

## 🧩 Tech Stack

| Technology         | Purpose                                 |
|--------------------|-----------------------------------------|
| Next.js App Router | Frontend framework                      |
| TypeScript         | Type safety                             |
| Socket.IO          | Real-time communication                 |
| chess.js           | Chess logic engine                      |
| react-chessboard   | Interactive chessboard UI               |
| PostgreSQL + Prisma| Database & ORM                          |

## 📅 Roadmap

- [x] Real-time multiplayer gameplay
- [x] Color auto-assignment
- [x] Move synchronization
- [ ] JWT-based authentication *(in progress)*
- [ ] Game history & match results *(coming soon)*
- [ ] Play against a bot *(WIP)*
- [ ] Enhanced UI/UX and mobile support

## ⚠️ Notes

- This project is under active development. Some features may be incomplete or unstable.
- Contributions, bug reports, and suggestions are welcome!

## 📖 License

MIT

## 🙋 FAQ

**Q: How do I play with a friend?**  
A: Share the room URL (e.g., `/game/vs-player/room1`) with your friend. Both of you can join the same room for a private match.

**Q: Can I play against a bot?**  
A: Bot mode work but still want to make it better.

**Q: Where is my game history?**  
A: Game history and match results are planned for a future release.

**Q: How do I use the database?**  
A: The app uses PostgreSQL with Prisma. See the "Database Setup" section above for configuration, schema, and usage details.

## 🤝 Contributing

Pull requests and feedback are encouraged! Please open an issue or submit a PR if you have ideas or find bugs.
