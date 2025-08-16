# Full-Stack Monorepo

A full-stack application with React + Vite frontend and Node.js + Express backend.

## 🚀 Quick Start

```bash
npm install
npm run start
```

This will start both the frontend (port 5173) and backend (port 3001) servers concurrently.

## 📂 Project Structure

```
├── package.json          # Root workspace configuration
├── frontend/             # React + Vite application
│   ├── src/
│   ├── package.json
│   └── vite.config.js
├── backend/              # Node.js + Express server
│   ├── server.js
│   └── package.json
└── README.md
```

## 🛠 Available Scripts

### Root Level
- `npm run start` - Start both frontend and backend
- `npm run dev` - Start frontend only
- `npm run server` - Start backend only

### Frontend
- `npm run dev --workspace frontend` - Start development server
- `npm run build --workspace frontend` - Build for production
- `npm run preview --workspace frontend` - Preview production build

### Backend
- `npm run dev --workspace backend` - Start with nodemon
- `npm run start --workspace backend` - Start production server

## 🔧 Tech Stack

### Frontend
- **React 18** - UI library
- **Vite** - Build tool and dev server
- **TailwindCSS** - Utility-first CSS framework

### Backend
- **Node.js** - Runtime environment
- **Express** - Web framework
- **CORS** - Cross-origin resource sharing

## 📡 API Endpoints

- `GET /api/hello` - Test endpoint
- `GET /api/status` - Server status
- `GET /health` - Health check

## 🚀 Deployment

### Frontend
```bash
cd frontend
npm run build
```

### Backend
```bash
cd backend
npm start
```

## 📝 Development

1. Install dependencies: `npm install`
2. Start development: `npm run start`
3. Frontend will be available at `http://localhost:5173`
4. Backend API will be available at `http://localhost:3001`

The frontend automatically connects to the backend and displays a message from the server.