const express = require('express');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const Joi = require('joi');

const app = express();
const PORT = process.env.PORT || 3000;

// Temporary in-memory storage for testing (replace with MongoDB later)
let teams = [];
let teamCounter = 1;

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
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'DevThon 3.0 API is running (In-Memory Mode)',
        timestamp: new Date().toISOString(),
        totalTeams: teams.length
    });
});

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

// POST /api/registration/register - Register a new team
app.post('/api/registration/register', (req, res) => {
    try {
        // Validate request body
        const { error, value } = teamValidation.validate(req.body, { abortEarly: false });
        
        if (error) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: error.details.map(detail => ({
                    field: detail.path.join('.'),
                    message: detail.message
                }))
            });
        }

        // Additional validation: check team size consistency
        if (value.members.length !== value.teamSize - 1) {
            return res.status(400).json({
                success: false,
                message: `Team size mismatch: Expected ${value.teamSize - 1} additional members, got ${value.members.length}`
            });
        }

        // Check if team name already exists
        const existingTeam = teams.find(team => team.teamName.toLowerCase() === value.teamName.toLowerCase());
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
                if (allEmails.includes(email.toLowerCase())) {
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

        // Create new team
        const newTeam = {
            ...value,
            teamId: 'DT3-' + Date.now().toString(36).toUpperCase(),
            registrationDate: new Date(),
            status: 'pending',
            id: teamCounter++
        };
        
        teams.push(newTeam);

        // Return success response
        const responseTeam = {
            teamId: newTeam.teamId,
            teamName: newTeam.teamName,
            teamSize: newTeam.teamSize,
            projectTitle: newTeam.projectTitle,
            projectCategory: newTeam.projectCategory,
            registrationDate: newTeam.registrationDate,
            status: newTeam.status
        };

        console.log(`✅ Team registered: ${newTeam.teamName} (${newTeam.teamId})`);

        res.status(201).json({
            success: true,
            message: 'Team registered successfully!',
            data: responseTeam
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// GET /api/registration/teams - Get all teams
app.get('/api/registration/teams', (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        
        // Filter teams
        let filteredTeams = teams;
        if (status) filteredTeams = filteredTeams.filter(team => team.status === status);
        if (category) filteredTeams = filteredTeams.filter(team => team.projectCategory === category);

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + parseInt(limit);
        const paginatedTeams = filteredTeams.slice(startIndex, endIndex);

        // Remove sensitive data
        const sanitizedTeams = paginatedTeams.map(team => ({
            teamId: team.teamId,
            teamName: team.teamName,
            teamSize: team.teamSize,
            projectTitle: team.projectTitle,
            projectCategory: team.projectCategory,
            experience: team.experience,
            registrationDate: team.registrationDate,
            status: team.status
        }));

        res.json({
            success: true,
            data: {
                teams: sanitizedTeams,
                totalPages: Math.ceil(filteredTeams.length / limit),
                currentPage: parseInt(page),
                total: filteredTeams.length
            }
        });

    } catch (error) {
        console.error('Get teams error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching teams'
        });
    }
});

// GET /api/registration/team/:teamId - Get specific team details
app.get('/api/registration/team/:teamId', (req, res) => {
    try {
        const team = teams.find(t => t.teamId === req.params.teamId);
        
        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            data: team
        });

    } catch (error) {
        console.error('Get team error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching team details'
        });
    }
});

// GET /api/registration/stats - Get registration statistics
app.get('/api/registration/stats', (req, res) => {
    try {
        const totalTeams = teams.length;
        const totalParticipants = teams.reduce((sum, team) => sum + team.teamSize, 0);
        const pendingTeams = teams.filter(team => team.status === 'pending').length;
        const approvedTeams = teams.filter(team => team.status === 'approved').length;
        const rejectedTeams = teams.filter(team => team.status === 'rejected').length;

        const categoryStats = {};
        teams.forEach(team => {
            categoryStats[team.projectCategory] = (categoryStats[team.projectCategory] || 0) + 1;
        });

        const categoryStatsArray = Object.entries(categoryStats).map(([category, count]) => ({
            _id: category,
            count
        })).sort((a, b) => b.count - a.count);

        res.json({
            success: true,
            data: {
                totalTeams,
                totalParticipants,
                pendingTeams,
                approvedTeams,
                rejectedTeams,
                categoryStats: categoryStatsArray
            }
        });

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching statistics'
        });
    }
});

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
    console.log(`⚠️  Using in-memory storage (data will be lost on restart)`);
    console.log(`📝 To use MongoDB: Follow QUICK_SETUP.md guide`);
});

module.exports = app;