# Pide-Piper API

A Node.js-based JOTTER API with features like file upload, folder management, and user authentication.

## Features

- User Authentication (Email/Password & Google Sign-in)
- Email verification with OTP
- File upload and management
- Folder creation and organization
- Storage management (15GB per user)
- File favorites system
- Recent files tracking
- File type categorization

## Prerequisites

- Node.js (v20.11 or higher)
- MongoDB
- Docker and Docker Compose (for containerized deployment)
- SMTP server credentials (for email functionality)
- Google OAuth credentials (for Google Sign-in)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
PORT=3000
MONGO_URI=mongodb://localhost:27017/google-drive-clone
JWT_SECRET=your_jwt_secret_key
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_email_app_password
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## Installation and Running Locally

1. Clone the repository:
```bash
git clone <repository-url>
cd google-drive-clone
```

2. Install dependencies:
```bash
npm install
```

3. Create uploads directory:
```bash
mkdir -p src/uploads
```

4. Start the application:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## Docker Deployment

1. Build and start the containers:
```bash
docker-compose up -d
```

2. Stop the containers:
```bash
docker-compose down
```

3. View logs:
```bash
docker-compose logs -f app
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/verify-email` - Verify email with OTP
- POST `/api/auth/login` - Login with email/password
- POST `/api/auth/google-signin` - Login with Google
- POST `/api/auth/forgot-password` - Request password reset
- POST `/api/auth/reset-password` - Reset password with OTP

### Files and Folders
- POST `/api/files/folder` - Create new folder
- POST `/api/files/upload` - Upload file
- GET `/api/files/list` - Get files list
- GET `/api/files/recent` - Get recent files
- GET `/api/files/favorites` - Get favorite files
- PUT `/api/files/:id/favorite` - Toggle file favorite
- PUT `/api/files/:id/rename` - Rename file
- DELETE `/api/files/:id` - Delete file
- GET `/api/files/storage-info` - Get storage information

## Testing the API

Use the following curl commands or Postman to test the API:

1. Register a new user:
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123"
  }'
```

2. Login:
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "password123"
  }'
```

3. Create a folder:
```bash
curl -X POST http://localhost:3000/api/files/folder \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "My Folder"
  }'
```

4. Upload a file:
```bash
curl -X POST http://localhost:3000/api/files/upload \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -F "file=@/path/to/your/file.pdf" \
  -F "parentId=FOLDER_ID"
```

## Error Handling

The API uses standard HTTP status codes:
- 200: Success
- 201: Created
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 500: Internal Server Error

