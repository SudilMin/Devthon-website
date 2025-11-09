# Quick MongoDB Setup Guide

## Option 1: MongoDB Atlas (Cloud - Recommended)

### Step 1: Create Account
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" and create an account
3. Create a new project called "DevThon 3.0"

### Step 2: Create Cluster
1. Click "Build a Database"
2. Choose "M0 Sandbox" (FREE tier)
3. Select a cloud provider and region
4. Name your cluster "DevThon3-Cluster"
5. Click "Create Cluster"

### Step 3: Setup Database Access
1. Go to "Database Access" in left sidebar
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Username: `devthon-admin`
5. Password: Generate secure password (save it!)
6. Select "Built-in Role" → "Atlas Admin"
7. Click "Add User"

### Step 4: Setup Network Access
1. Go to "Network Access" in left sidebar
2. Click "Add IP Address"
3. Choose "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Connection String
1. Go to "Database" (clusters view)
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `devthon3`

### Step 6: Update Backend
1. In your backend folder, create `.env` file:
```env
MONGODB_URI=mongodb+srv://devthon-admin:YOUR_PASSWORD@devthon3-cluster.xxxxx.mongodb.net/devthon3
PORT=3000
NODE_ENV=development
```

2. Restart your backend server:
```powershell
cd "c:\Users\sudil\Music\123\devthon-backend"
npm start
```

You should see: "✅ Connected to MongoDB"

## Option 2: Local MongoDB (Advanced)

If you prefer local installation, follow the MongoDB installation guide in MONGODB_SETUP.md

## Testing the Setup

1. **Start Backend:** The server should show MongoDB connection success
2. **Test Health:** Visit http://localhost:3000/health
3. **Test Registration:** Fill out the registration form on your website
4. **Check Database:** Use MongoDB Compass or Atlas interface to see registered teams

## Troubleshooting

### Connection Issues:
- Check if MongoDB URI is correct
- Verify network access settings in Atlas
- Ensure password doesn't contain special characters

### Registration Issues:
- Check browser console for errors
- Verify frontend is running on http://localhost:8080 or similar
- Check if backend CORS settings allow your frontend URL

### Common Errors:
1. **MongoServerError: Authentication failed**
   - Check username and password in connection string

2. **MongooseError: Operation timeout**
   - Check network access settings in Atlas

3. **ValidationError**
   - Check if all required fields are being sent from frontend