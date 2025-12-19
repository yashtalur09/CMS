# Conference Management System (CMS)

A modern, full-stack conference management platform supporting the complete lifecycle of academic and professional conferences.

## 🎯 Features

- **Card-Based Discovery UI** - Intuitive, modern interface inspired by event discovery platforms
- **Role-Based Access Control** - Four stakeholder roles (Organizer, Author, Reviewer, Participant)
- **Complete Conference Lifecycle** - From submission to certification
- **JWT Authentication** - Secure user authentication and authorization
- **OAuth Integration** 🆕 - Multiple sign-in options (ORCID, Google) for enhanced security and convenience
- **MongoDB Database** - Scalable NoSQL database with Mongoose ODM
- **RESTful APIs** - Well-structured backend APIs
- **Responsive Design** - Mobile and desktop friendly

## 🛠 Technology Stack

### Frontend
- React.js 18
- React Router v6
- Tailwind CSS
- Axios

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose
- JWT Authentication
- Multer (file uploads)
- Express Validator

### Deployment
- Docker & Docker Compose
- Frontend: Vercel (planned)
- Backend: Render/Railway (planned)
- Database: MongoDB Atlas (planned)

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

## 🚀 Installation & Setup

### Option 1: Manual Setup

#### 1. Clone the repository
```bash
git clone <repository-url>
cd CMF
```

#### 2. Setup Backend
```bash
cd backend
npm install

# Create .env file
copy .env.example .env
# Edit .env with your configuration
```

#### 3. Setup Frontend
```bash
cd ../frontend
npm install

# Create .env file
copy .env.example .env
# Edit with your API URL
```

#### 4. Start MongoDB
Make sure MongoDB is running on `mongodb://localhost:27017`

#### 5. Run the Application

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

Access the application at `http://localhost:3000`

### Option 2: Docker Setup

#### 1. Build and run with Docker Compose
```bash
docker-compose up --build
```

Access the application at `http://localhost`

## 📁 Project Structure

```
CMF/
├── backend/
│   ├── config/          # Database configuration
│   ├── middleware/      # Auth, upload, error handling
│   ├── models/          # Mongoose schemas
│   ├── routes/          # API routes
│   ├── utils/           # Helper functions
│   ├── uploads/         # File storage
│   └── server.js        # Entry point
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   ├── context/     # React context (Auth)
│   │   ├── pages/       # Page components
│   │   │   ├── Organizer/
│   │   │   ├── Author/
│   │   │   ├── Reviewer/
│   │   │   └── Participant/
│   │   ├── utils/       # API client, helpers
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── docker-compose.yml
```

## 🔐 User Roles

### 1. Organizer
- Create and manage conferences
- View submissions
- Assign reviewers
- Accept/reject papers
- Schedule presentations
- Generate certificates

### 2. Author
- Discover conferences
- Submit papers
- Track submission status
- View reviews
- Download certificates

### 3. Reviewer
- Browse conferences
- Bid on papers
- Review submissions
- Provide feedback

### 4. Participant
- Register for conferences
- View schedules
- Download certificates

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile

### Organizer Routes
- `GET /api/organizer/conferences` - Get all conferences
- `POST /api/organizer/conferences` - Create conference
- `PUT /api/organizer/conferences/:id` - Update conference
- `GET /api/organizer/conferences/:id/submissions` - Get submissions
- `PUT /api/organizer/submissions/:id/status` - Accept/reject submission
- `POST /api/organizer/conferences/:id/certificates` - Generate certificates

### Author Routes
- `GET /api/author/dashboard` - Get dashboard data
- `GET /api/author/conferences` - Discover conferences
- `POST /api/author/submissions` - Submit paper
- `GET /api/author/submissions` - Get my submissions
- `GET /api/author/submissions/:id` - Get submission details

### Reviewer Routes
- `GET /api/reviewer/dashboard` - Get dashboard
- `GET /api/reviewer/conferences` - Browse conferences
- `GET /api/reviewer/conferences/:id/submissions` - Get submissions
- `POST /api/reviewer/bids` - Place bid
- `POST /api/reviewer/reviews` - Submit review
- `GET /api/reviewer/reviews` - Get my reviews

### Participant Routes
- `GET /api/participant/dashboard` - Get dashboard
- `GET /api/participant/conferences` - Browse conferences
- `POST /api/participant/registrations` - Register for conference
- `GET /api/participant/certificates` - Get certificates

## 📊 Database Schema

### Collections
- **users** - User accounts and authentication
- **conferences** - Conference information
- **submissions** - Paper submissions
- **reviews** - Paper reviews
- **bids** - Reviewer bids
- **certificates** - Certificates issued
- **registrations** - Conference registrations

## 🎨 UI Components

- **Button** - Primary, secondary, outline, danger variants
- **Card** - Hoverable cards for content display
- **Input** - Text, email, password, date inputs
- **Select** - Dropdown selection
- **Textarea** - Multi-line text input
- **Badge** - Status indicators
- **Modal** - Dialog boxes
- **Loading** - Loading spinners
- **Navbar** - Navigation bar

## 🔒 Security Features

- JWT-based authentication
- Password hashing with bcrypt
- Role-based authorization
- Input validation
- File upload restrictions
- CORS protection

## 🐛 Development

### Backend Development
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start  # Starts development server
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/cms
JWT_SECRET=your_secret_key
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### Frontend (.env)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## 🚢 Deployment

### Frontend (Vercel)
1. Push code to GitHub
2. Import project in Vercel
3. Set environment variables
4. Deploy

### Backend (Render/Railway)
1. Create new web service
2. Connect repository
3. Set environment variables
4. Set start command: `npm start`

### Database (MongoDB Atlas)
1. Create cluster
2. Get connection string
3. Update MONGODB_URI in backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name

## 🙏 Acknowledgments

- Card-based UI inspired by modern event discovery platforms
- Built with best practices for scalability and maintainability

## 🆔 OAuth Integration (ORCID & Google)

This system supports multiple OAuth authentication methods for secure, convenient sign-in.

### 🔬 ORCID Integration
For verified researcher identity. Users can login/register using their ORCID iD.

**Documentation:**
- **[ORCID_SETUP.md](ORCID_SETUP.md)** - Detailed setup guide
- **[ORCID_CHECKLIST.md](ORCID_CHECKLIST.md)** - Testing checklist

### 🔐 Google Sign-In
For familiar, secure authentication. Users can login/register with their Google account.

**Documentation:**
- **[GOOGLE_SETUP.md](GOOGLE_SETUP.md)** - Detailed setup guide

### Quick Setup
1. **Get OAuth credentials:**
   - ORCID: https://orcid.org/developer-tools
   - Google: https://console.cloud.google.com/
2. **Configure environment variables** (see respective setup guides)
3. **Test the integrations**

**Quick Setup Script (Windows):**
```bash
setup-orcid.bat
```

## 📞 Support

For support, email support@cms.com or open an issue in the repository.

---

**Note:** This is a complete, production-ready conference management system. All core features are implemented, including ORCID authentication. Placeholder pages can be expanded with additional functionality as needed.
