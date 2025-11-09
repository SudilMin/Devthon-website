const express = require('express');
const router = express.Router();
const Joi = require('joi');
const Team = require('../models/Team');

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
router.post('/register', async (req, res) => {
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
        const existingTeam = await Team.findOne({ teamName: value.teamName });
        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: 'Team name already exists. Please choose a different name.'
            });
        }

        // Check if any email is already registered
        const allEmails = [value.teamLeader.email, ...value.members.map(m => m.email)];
        const existingEmailTeams = await Team.findByMemberEmail({ $in: allEmails });
        
        if (existingEmailTeams.length > 0) {
            const registeredEmails = [];
            existingEmailTeams.forEach(team => {
                const teamEmails = team.getAllEmails();
                teamEmails.forEach(email => {
                    if (allEmails.includes(email)) {
                        registeredEmails.push(email);
                    }
                });
            });
            
            return res.status(409).json({
                success: false,
                message: 'Some team members are already registered',
                registeredEmails: [...new Set(registeredEmails)]
            });
        }

        // Create new team
        const newTeam = new Team(value);
        await newTeam.save();

        // Return success response (exclude sensitive data)
        const responseTeam = {
            teamId: newTeam.teamId,
            teamName: newTeam.teamName,
            teamSize: newTeam.teamSize,
            projectTitle: newTeam.projectTitle,
            projectCategory: newTeam.projectCategory,
            registrationDate: newTeam.registrationDate,
            status: newTeam.status
        };

        res.status(201).json({
            success: true,
            message: 'Team registered successfully!',
            data: responseTeam
        });

    } catch (error) {
        console.error('Registration error:', error);
        
        if (error.code === 11000) {
            // Duplicate key error
            const field = Object.keys(error.keyPattern)[0];
            return res.status(409).json({
                success: false,
                message: `${field} already exists`
            });
        }

        res.status(500).json({
            success: false,
            message: 'Internal server error during registration'
        });
    }
});

// GET /api/registration/teams - Get all teams (admin endpoint)
router.get('/teams', async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category } = req.query;
        
        // Build filter
        const filter = {};
        if (status) filter.status = status;
        if (category) filter.projectCategory = category;

        // Get teams with pagination
        const teams = await Team.find(filter)
            .select('-members.email -members.phone -teamLeader.email -teamLeader.phone') // Exclude sensitive data
            .sort({ registrationDate: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Team.countDocuments(filter);

        res.json({
            success: true,
            data: {
                teams,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                total
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
router.get('/team/:teamId', async (req, res) => {
    try {
        const team = await Team.findOne({ teamId: req.params.teamId });
        
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

// PUT /api/registration/team/:teamId/status - Update team status (admin endpoint)
router.put('/team/:teamId/status', async (req, res) => {
    try {
        const { status } = req.body;
        
        if (!['pending', 'approved', 'rejected'].includes(status)) {
            return res.status(400).json({
                success: false,
                message: 'Invalid status. Must be pending, approved, or rejected'
            });
        }

        const team = await Team.findOneAndUpdate(
            { teamId: req.params.teamId },
            { status },
            { new: true }
        );

        if (!team) {
            return res.status(404).json({
                success: false,
                message: 'Team not found'
            });
        }

        res.json({
            success: true,
            message: `Team status updated to ${status}`,
            data: { teamId: team.teamId, status: team.status }
        });

    } catch (error) {
        console.error('Update status error:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating team status'
        });
    }
});

// GET /api/registration/stats - Get registration statistics
router.get('/stats', async (req, res) => {
    try {
        const stats = await Team.aggregate([
            {
                $group: {
                    _id: null,
                    totalTeams: { $sum: 1 },
                    totalParticipants: { $sum: '$teamSize' },
                    pendingTeams: {
                        $sum: { $cond: [{ $eq: ['$status', 'pending'] }, 1, 0] }
                    },
                    approvedTeams: {
                        $sum: { $cond: [{ $eq: ['$status', 'approved'] }, 1, 0] }
                    },
                    rejectedTeams: {
                        $sum: { $cond: [{ $eq: ['$status', 'rejected'] }, 1, 0] }
                    }
                }
            }
        ]);

        const categoryStats = await Team.aggregate([
            {
                $group: {
                    _id: '$projectCategory',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const result = stats[0] || {
            totalTeams: 0,
            totalParticipants: 0,
            pendingTeams: 0,
            approvedTeams: 0,
            rejectedTeams: 0
        };

        res.json({
            success: true,
            data: {
                ...result,
                categoryStats
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

module.exports = router;