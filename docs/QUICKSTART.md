# Quick Start Guide

## Prerequisites
- Node.js v16+ installed
- MongoDB installed and running
- Git installed

## Setup Steps

### 1. Install Dependencies
```bash
# Install root dependencies (optional)
npm install

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Configure Environment

**Backend (.env):**
```bash
cd backend
copy .env.example .env
```
Edit `backend/.env` and set:
- `MONGODB_URI=mongodb://localhost:27017/cms`
- `JWT_SECRET=your_secure_secret_key`

**Frontend (.env):**
```bash
cd frontend
copy .env.example .env
```
Edit `frontend/.env` and set:
- `REACT_APP_API_URL=http://localhost:5000/api`

### 3. Start MongoDB
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

### 4. Run Application

**Option A: Run Separately**

Terminal 1 (Backend):
```bash
cd backend
npm run dev
```

Terminal 2 (Frontend):
```bash
cd frontend
npm start
```

**Option B: Run Together (from root)**
```bash
npm run dev
```

### 5. Access Application
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## Docker Setup (Alternative)

```bash
# Build and start all services
docker-compose up --build

# Access at http://localhost
```

## Default Test Users

Create users via the registration page with these roles:
- **Organizer** - Can create and manage conferences
- **Author** - Can submit papers to conferences
- **Reviewer** - Can review submitted papers
- **Participant** - Can register for conferences

## Common Issues

### MongoDB Connection Error
- Ensure MongoDB is running
- Check MONGODB_URI in backend/.env

### Port Already in Use
- Backend (5000): Change PORT in backend/.env
- Frontend (3000): Change in frontend/package.json scripts

### CORS Errors
- Ensure REACT_APP_API_URL in frontend/.env matches backend URL

## Next Steps

1. Register as an **Organizer** and create a conference
2. Register as an **Author** and submit a paper
3. Register as a **Reviewer** and review papers
4. Register as a **Participant** and register for events

## API Documentation

Access Swagger docs at: http://localhost:5000/api-docs (Future)

## Support

- Check README.md for detailed documentation
- Open an issue on GitHub
- Contact: support@cms.com
