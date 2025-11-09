# DevThon 3.0 Backend

Backend API for DevThon 3.0 registration system built with Node.js, Express, and MongoDB.

## 🚀 Features

- Team registration with validation
- Multi-member team support (1-4 members)
- Project information management
- Email uniqueness validation
- RESTful API endpoints
- Data validation with Joi
- Rate limiting and security
- Registration statistics

## 📋 Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or cloud)
- npm or yarn

## 🛠️ Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up MongoDB:**
   - Install MongoDB locally OR use MongoDB Atlas (cloud)
   - Create a database named `devthon3`

3. **Environment Configuration (Optional):**
   Create a `.env` file:
   ```env
   MONGODB_URI=mongodb://localhost:27017/devthon3
   PORT=3000
   NODE_ENV=development
   ```

## 🏃 Running the Server

### Development Mode:
```bash
npm run dev
```

### Production Mode:
```bash
npm start
```

The server will start on `http://localhost:3000`

## 📡 API Endpoints

### Health Check
- **GET** `/health` - Check API status

### Registration
- **POST** `/api/registration/register` - Register a new team
- **GET** `/api/registration/teams` - Get all teams (with pagination)
- **GET** `/api/registration/team/:teamId` - Get specific team details
- **PUT** `/api/registration/team/:teamId/status` - Update team status
- **GET** `/api/registration/stats` - Get registration statistics

## 📝 API Usage Examples

### Register a Team
```javascript
POST /api/registration/register
Content-Type: application/json

{
  "teamName": "Code Warriors",
  "teamSize": 3,
  "teamLeader": {
    "name": "John Doe",
    "email": "john@example.com",
    "phone": "+1234567890",
    "college": "Tech University",
    "year": "3rd Year",
    "skills": ["JavaScript", "React", "Node.js"]
  },
  "members": [
    {
      "name": "Jane Smith",
      "email": "jane@example.com",
      "phone": "+1234567891",
      "college": "Tech University",
      "year": "2nd Year",
      "skills": ["Python", "Django"]
    },
    {
      "name": "Bob Johnson",
      "email": "bob@example.com",
      "phone": "+1234567892",
      "college": "Code Institute",
      "year": "4th Year",
      "skills": ["Java", "Spring Boot"]
    }
  ],
  "projectTitle": "Smart Campus Management",
  "projectDescription": "A comprehensive platform to manage campus resources, student activities, and academic processes using modern web technologies.",
  "techStack": ["React", "Node.js", "MongoDB", "Express"],
  "projectCategory": "Web Development",
  "experience": "Intermediate",
  "requirements": "Need access to campus data APIs",
  "whatsappGroup": "https://chat.whatsapp.com/ABC123XYZ"
}
```

### Response Format
```javascript
{
  "success": true,
  "message": "Team registered successfully!",
  "data": {
    "teamId": "DT3-ABC123",
    "teamName": "Code Warriors",
    "teamSize": 3,
    "projectTitle": "Smart Campus Management",
    "projectCategory": "Web Development",
    "registrationDate": "2024-01-15T10:30:00.000Z",
    "status": "pending"
  }
}
```

## 🗃️ Database Schema

### Team Model
- **teamName**: Unique team name (3-50 chars)
- **teamSize**: Number of members (1-4)
- **teamLeader**: Leader information (required)
- **members**: Array of additional members
- **projectTitle**: Project title (max 100 chars)
- **projectDescription**: Detailed description (50-1000 chars)
- **techStack**: Array of technologies (1-15 items)
- **projectCategory**: Project category from predefined list
- **experience**: Team experience level
- **requirements**: Special requirements (optional)
- **whatsappGroup**: WhatsApp group link (optional)
- **status**: Registration status (pending/approved/rejected)
- **teamId**: Unique team identifier

### Member Schema
- **name**: Member name (max 100 chars)
- **email**: Unique email address
- **phone**: Phone number
- **college**: College/University name
- **year**: Academic year
- **skills**: Array of skills (max 10)

## 🔒 Data Validation

- Email uniqueness across all team members
- Team size consistency validation
- Input sanitization and validation
- Phone number format validation
- WhatsApp link format validation

## 🔧 Configuration

### CORS Settings
The API allows requests from:
- `http://localhost:3000`
- `http://127.0.0.1:5500`

### Rate Limiting
- 100 requests per 15 minutes per IP

## 📊 Error Handling

The API returns standardized error responses:
```javascript
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "teamName",
      "message": "Team name is required"
    }
  ]
}
```

## 🚀 Deployment

### Local Development
1. Start MongoDB service
2. Run `npm run dev`
3. API available at `http://localhost:3000`

### Production Deployment
1. Set environment variables
2. Ensure MongoDB is accessible
3. Run `npm start`

## 🧪 Testing the API

Use tools like Postman, Insomnia, or curl to test the endpoints:

```bash
# Health check
curl http://localhost:3000/health

# Get statistics
curl http://localhost:3000/api/registration/stats
```

## 📈 Monitoring

Check the health endpoint for API status:
```bash
GET /health
```

Response:
```javascript
{
  "status": "OK",
  "message": "DevThon 3.0 API is running",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## 🔗 Frontend Integration

Update your frontend registration form to submit data to:
```javascript
const response = await fetch('http://localhost:3000/api/registration/register', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(teamData)
});
```

---

**DevThon 3.0 Backend API** - Built with ❤️ for seamless team registration