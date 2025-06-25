# App Quiz - Full Stack Application

A modern full-stack web application built with Vue.js, Express.js, and PostgreSQL.

## Features

- **Frontend**: Vue 3 with Composition API, Vue Router, and modern UI
- **Backend**: Express.js API with JWT authentication
- **Database**: PostgreSQL with automatic table creation
- **Authentication**: Login/Register with JWT tokens
- **Data Management**: Save and retrieve user data
- **Responsive Design**: Mobile-first approach

## Project Structure

```
app-quiz/
├── frontend/           # Vue.js frontend
│   ├── src/
│   │   ├── components/
│   │   ├── views/
│   │   ├── services/
│   │   └── router/
│   ├── package.json
│   └── vite.config.js
├── backend/            # Express.js API
│   ├── server.js
│   ├── package.json
│   └── env.example
└── package.json        # Root workspace
```

## Local Development Setup

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd app-quiz
npm run install:all
```

### 2. Database Setup

1. Create a PostgreSQL database:

```sql
CREATE DATABASE appquiz;
```

2. Set up environment variables in `backend/.env`:

```bash
cp backend/env.example backend/.env
```

Edit `backend/.env`:

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/appquiz
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

### 3. Run the Application

**Start both servers:**

```bash
# Terminal 1 - Backend
npm run dev:backend

# Terminal 2 - Frontend
npm run dev:frontend
```

Or use the workspace scripts:

```bash
npm run dev:backend &
npm run dev:frontend
```

**Access the application:**

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001

## Deployment

### Frontend (GitHub Pages)

1. **Enable GitHub Pages:**

   - Go to your repo Settings → Pages
   - Source: GitHub Actions

2. **Push to main branch:**

   ```bash
   git push origin main
   ```

   The GitHub Action will automatically build and deploy your frontend.

3. **Update API URL:**
   In `frontend/src/services/api.js`, update the production URL:
   ```javascript
   const API_BASE_URL = import.meta.env.PROD
     ? "https://your-backend-url.herokuapp.com/api"
     : "http://localhost:3001/api"
   ```

### Backend & Database (Heroku)

1. **Create Heroku app:**

   ```bash
   heroku create your-app-name
   ```

2. **Add PostgreSQL addon:**

   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

3. **Set environment variables:**

   ```bash
   heroku config:set JWT_SECRET=your-super-secret-jwt-key
   heroku config:set NODE_ENV=production
   ```

4. **Deploy:**
   ```bash
   # Deploy only the backend folder
   git subtree push --prefix=backend heroku main
   ```

### Alternative: Railway/Render

**Railway:**

1. Connect your GitHub repo
2. Select the `backend` folder
3. Add PostgreSQL database
4. Set environment variables

**Render:**

1. Create new Web Service from GitHub
2. Root Directory: `backend`
3. Add PostgreSQL database
4. Set environment variables

## API Endpoints

### Authentication

- `POST /api/register` - Register new user
- `POST /api/login` - Login user

### User Data

- `POST /api/user/data` - Save user data (requires auth)
- `GET /api/user/data` - Get user data (requires auth)

### Health Check

- `GET /api/health` - Server health check

## Technologies Used

### Frontend

- **Vue 3** - Progressive JavaScript framework
- **Vue Router** - Client-side routing
- **Vite** - Build tool and dev server
- **Axios** - HTTP client
- **Modern CSS** - Custom properties and grid layout

### Backend

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing

## Scripts

### Root Level

- `npm run install:all` - Install all dependencies
- `npm run dev:frontend` - Start frontend dev server
- `npm run dev:backend` - Start backend dev server
- `npm run build:frontend` - Build frontend for production

### Frontend

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build

### Backend

- `npm run dev` - Start with nodemon
- `npm start` - Start production server

## Environment Variables

### Backend (.env)

```env
PORT=3001
DATABASE_URL=postgresql://username:password@localhost:5432/appquiz
JWT_SECRET=your-super-secret-jwt-key
NODE_ENV=development
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

MIT License - see LICENSE file for details
