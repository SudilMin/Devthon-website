# MongoDB Installation Guide for Windows

## Download and Install MongoDB Community Edition

1. **Download MongoDB:**
   - Go to https://www.mongodb.com/try/download/community
   - Select Windows x64
   - Download the .msi installer

2. **Install MongoDB:**
   - Run the installer
   - Choose "Complete" installation
   - Install as a Windows Service
   - Install MongoDB Compass (GUI tool)

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB service is running
   Get-Service -Name MongoDB
   
   # Test connection
   mongosh
   ```

4. **Create Database:**
   ```javascript
   // In mongosh
   use devthon3
   db.teams.insertOne({test: "data"})
   db.teams.deleteOne({test: "data"})
   ```

## Alternative: Use MongoDB with Docker

```powershell
# Install Docker Desktop for Windows
# Then run MongoDB container
docker run -d -p 27017:27017 --name mongodb mongo:latest
```