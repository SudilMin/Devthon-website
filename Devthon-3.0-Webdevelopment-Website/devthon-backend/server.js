require('dotenv').config();
const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

// Import database connection and models
const connectDB = require('./config/database');
const Team = require('./models/Team');

// Import routes (commented out for now)
// const registrationRoutes = require('./routes/registration');

const app = express();
const PORT = process.env.PORT || 3000;

// Initialize database connection
let isDBConnected = false;

// Temporary in-memory storage (fallback)
let teams = [];
let teamCounter = 1;

// Connect to MongoDB Atlas
connectDB().then((connected) => {
    isDBConnected = connected;
    if (connected) {
        console.log('🎉 MongoDB Atlas integration enabled!');
    } else {
        console.log('⚠️  Running in test mode without MongoDB');
        console.log('📝 To enable database: Follow QUICK_SETUP.md guide');
    }
});

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(limiter);
app.use(cors({
    origin: ['http://localhost:3000', 'http://localhost:8080', 'http://127.0.0.1:5500'], // Add your frontend URLs
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check endpoint
app.get('/health', async (req, res) => {
    try {
        let dbStatus = 'Disconnected';
        let totalTeams = teams.length; // Fallback count

        if (isDBConnected) {
            dbStatus = 'Connected to MongoDB Atlas';
            totalTeams = await Team.countDocuments();
        }

        res.json({
            status: 'OK',
            message: `DevThon 3.0 API is running`,
            database: dbStatus,
            timestamp: new Date().toISOString(),
            totalTeams: totalTeams,
            mode: isDBConnected ? 'Production (MongoDB)' : 'Test (In-Memory)'
        });
    } catch (error) {
        res.json({
            status: 'OK',
            message: 'DevThon 3.0 API is running (Database query failed)',
            database: 'Error checking database',
            timestamp: new Date().toISOString(),
            totalTeams: teams.length,
            mode: 'Test (In-Memory)'
        });
    }
});

// Simple registration endpoint for testing
app.post('/api/registration/register', async (req, res) => {
    try {
        console.log('Registration request received:', req.body);

        const teamData = req.body;

        if (isDBConnected) {
            // Use MongoDB for registration
            try {
                // Create new team using the Team model
                const newTeam = new Team(teamData);
                const savedTeam = await newTeam.save();

                console.log(`✅ Team registered in MongoDB: ${savedTeam.teamName} (${savedTeam.teamId})`);

                res.status(201).json({
                    success: true,
                    message: 'Team registered successfully!',
                    data: {
                        teamId: savedTeam.teamId,
                        teamName: savedTeam.teamName,
                        teamSize: savedTeam.teamSize,
                        projectTitle: savedTeam.projectTitle,
                        registrationDate: savedTeam.registrationDate,
                        status: savedTeam.status
                    }
                });
            } catch (mongoError) {
                console.error('MongoDB registration error:', mongoError);

                // Handle MongoDB validation errors
                if (mongoError.name === 'ValidationError') {
                    const errors = Object.values(mongoError.errors).map(err => err.message);
                    return res.status(400).json({
                        success: false,
                        message: 'Validation failed',
                        errors: errors
                    });
                }

                // Handle duplicate key error
                if (mongoError.code === 11000) {
                    return res.status(409).json({
                        success: false,
                        message: 'Team name already exists. Please choose a different name.'
                    });
                }

                throw mongoError; // Re-throw other errors
            }
        } else {
            // Fallback to in-memory storage

            // Validation schemas
            const memberValidation = Joi.object({
                name: Joi.string().trim().min(2).max(100).required(),
                email: Joi.string().trim().email().required(),
                phone: Joi.string().trim().pattern(/^[\+]?[1-9][\d]{0,15}$/).required(),
                college: Joi.string().trim().min(2).max(200).required(),
                year: Joi.string().valid('1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate').required(),
                skills: Joi.array().items(Joi.string().trim()).max(10).default([])
            });

            const teamValidation = Joi.object({
                teamName: Joi.string().trim().min(3).max(50).required(),
                teamSize: Joi.number().integer().min(1).max(4).required(),
                teamLeader: memberValidation.required(),
                members: Joi.array().items(memberValidation).default([]),
                projectTitle: Joi.string().trim().max(100).required(),
                projectDescription: Joi.string().trim().min(50).max(1000).required(),
                techStack: Joi.array().items(Joi.string().trim()).min(1).max(15).required(),
                projectCategory: Joi.string().valid(
                    'Web Development', 'Mobile App Development', 'AI/ML', 'Blockchain',
                    'IoT', 'Game Development', 'Data Science', 'DevOps', 'Cybersecurity',
                    'AR/VR', 'Other'
                ).required(),
                requirements: Joi.string().trim().max(500).allow('').default(''),
                experience: Joi.string().valid('Beginner', 'Intermediate', 'Advanced').required(),
                whatsappGroup: Joi.string().trim().pattern(/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/).allow('').default('')
            });

            // Validate request body
            const { error, value } = teamValidation.validate(teamData, { abortEarly: false });

            if (error) {
                return res.status(400).json({
                    success: false,
                    message: 'Validation failed',
                    errors: error.details.map(detail => detail.message)
                });
            }

            // Check team size consistency
            if (value.members.length !== value.teamSize - 1) {
                return res.status(400).json({
                    success: false,
                    message: `Team size mismatch: Expected ${value.teamSize - 1} additional members, got ${value.members.length}`
                });
            }

            // Check for duplicate team name
            const existingTeam = teams.find(team =>
                team.teamName.toLowerCase() === value.teamName.toLowerCase()
            );

            if (existingTeam) {
                return res.status(409).json({
                    success: false,
                    message: 'Team name already exists. Please choose a different name.'
                });
            }

            // Check if any email is already registered
            const allEmails = [value.teamLeader.email, ...value.members.map(m => m.email)];
            const registeredEmails = [];

            teams.forEach(team => {
                const teamEmails = [team.teamLeader.email, ...team.members.map(m => m.email)];
                teamEmails.forEach(email => {
                    if (allEmails.includes(email)) {
                        registeredEmails.push(email);
                    }
                });
            });

            if (registeredEmails.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Some team members are already registered',
                    registeredEmails: [...new Set(registeredEmails)]
                });
            }

            // Create new team with unique ID
            const newTeam = {
                ...value,
                teamId: 'DT3-' + Date.now().toString(36).toUpperCase(),
                registrationDate: new Date(),
                status: 'pending',
                id: teamCounter++
            };

            teams.push(newTeam);

            console.log(`✅ Team registered in memory: ${newTeam.teamName} (${newTeam.teamId})`);

            res.status(201).json({
                success: true,
                message: 'Team registered successfully!',
                data: {
                    teamId: newTeam.teamId,
                    teamName: newTeam.teamName,
                    teamSize: newTeam.teamSize,
                    projectTitle: newTeam.projectTitle,
                    registrationDate: newTeam.registrationDate,
                    status: newTeam.status
                }
            });
        }

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// Get teams endpoint
app.get('/api/registration/teams', async (req, res) => {
    try {
        if (isDBConnected) {
            // Fetch teams from MongoDB
            const teams = await Team.find()
                .sort({ registrationDate: -1 })
                .select('teamId teamName teamSize projectTitle registrationDate status');

            res.json({
                success: true,
                data: {
                    teams: teams,
                    total: teams.length
                },
                source: 'MongoDB Atlas'
            });
        } else {
            // Fallback to in-memory storage
            res.json({
                success: true,
                data: {
                    teams: teams.map(team => ({
                        teamId: team.teamId,
                        teamName: team.teamName,
                        teamSize: team.teamSize,
                        projectTitle: team.projectTitle,
                        registrationDate: team.registrationDate,
                        status: team.status
                    })),
                    total: teams.length
                },
                source: 'In-Memory Storage'
            });
        }
    } catch (error) {
        console.error('Error fetching teams:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teams',
            error: error.message
        });
    }
});

// API Routes (commented out for now)
// app.use('/api/registration', registrationRoutes);

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Global error handler
app.use((error, req, res, next) => {
    console.error('Global error:', error);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Something went wrong'
    });
});

// Start server
app.listen(PORT, () => {
    console.log(`🚀 DevThon 3.0 API server running on port ${PORT}`);
    console.log(`📱 Health check: http://localhost:${PORT}/health`);
});

module.exports = app;