const mongoose = require('mongoose');

// Member schema for team members
const memberSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Member name is required'],
        trim: true,
        maxlength: [100, 'Name cannot exceed 100 characters']
    },
    email: {
        type: String,
        required: [true, 'Member email is required'],
        trim: true,
        lowercase: true,
        match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
    },
    phone: {
        type: String,
        required: [true, 'Member phone is required'],
        trim: true,
        match: [/^[\+]?[1-9][\d]{0,15}$/, 'Please enter a valid phone number']
    },
    college: {
        type: String,
        required: [true, 'College/University is required'],
        trim: true,
        maxlength: [200, 'College name cannot exceed 200 characters']
    },
    year: {
        type: String,
        required: [true, 'Academic year is required'],
        enum: {
            values: ['1st Year', '2nd Year', '3rd Year', '4th Year', 'Graduate', 'Post Graduate'],
            message: 'Please select a valid academic year'
        }
    },
    skills: {
        type: [String],
        default: [],
        validate: {
            validator: function(skills) {
                return skills.length <= 10;
            },
            message: 'Maximum 10 skills allowed per member'
        }
    }
}, {
    _id: true,
    timestamps: true
});

// Team schema
const teamSchema = new mongoose.Schema({
    // Basic Team Information
    teamName: {
        type: String,
        required: [true, 'Team name is required'],
        unique: true,
        trim: true,
        minlength: [3, 'Team name must be at least 3 characters'],
        maxlength: [50, 'Team name cannot exceed 50 characters']
    },
    
    teamSize: {
        type: Number,
        required: [true, 'Team size is required'],
        min: [1, 'Team must have at least 1 member'],
        max: [4, 'Team cannot have more than 4 members']
    },
    
    // Team Leader (always required)
    teamLeader: {
        type: memberSchema,
        required: [true, 'Team leader information is required']
    },
    
    // Additional team members (conditional based on team size)
    members: {
        type: [memberSchema],
        default: [],
        validate: {
            validator: function(members) {
                // Team size should match actual members count (leader + members)
                return members.length === this.teamSize - 1;
            },
            message: 'Number of members must match team size (excluding leader)'
        }
    },
    
    // Project Information
    projectTitle: {
        type: String,
        required: [true, 'Project title is required'],
        trim: true,
        maxlength: [100, 'Project title cannot exceed 100 characters']
    },
    
    projectDescription: {
        type: String,
        required: [true, 'Project description is required'],
        trim: true,
        minlength: [50, 'Project description must be at least 50 characters'],
        maxlength: [1000, 'Project description cannot exceed 1000 characters']
    },
    
    techStack: {
        type: [String],
        required: [true, 'Technology stack is required'],
        validate: {
            validator: function(stack) {
                return stack.length > 0 && stack.length <= 15;
            },
            message: 'Please specify 1-15 technologies for your project'
        }
    },
    
    projectCategory: {
        type: String,
        required: [true, 'Project category is required'],
        enum: {
            values: [
                'Web Development',
                'Mobile App Development', 
                'AI/ML',
                'Blockchain',
                'IoT',
                'Game Development',
                'Data Science',
                'DevOps',
                'Cybersecurity',
                'AR/VR',
                'Other'
            ],
            message: 'Please select a valid project category'
        }
    },
    
    // Additional Information
    requirements: {
        type: String,
        trim: true,
        maxlength: [500, 'Requirements cannot exceed 500 characters']
    },
    
    experience: {
        type: String,
        required: [true, 'Experience level is required'],
        enum: {
            values: ['Beginner', 'Intermediate', 'Advanced'],
            message: 'Please select a valid experience level'
        }
    },
    
    // WhatsApp group (optional)
    whatsappGroup: {
        type: String,
        trim: true,
        match: [/^https:\/\/chat\.whatsapp\.com\/[A-Za-z0-9]+$/, 'Please enter a valid WhatsApp group link']
    },
    
    // Registration metadata
    registrationDate: {
        type: Date,
        default: Date.now
    },
    
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending'
    },
    
    // Team ID for easy reference
    teamId: {
        type: String,
        unique: true,
        default: function() {
            return 'DT3-' + Date.now().toString(36).toUpperCase();
        }
    }
    
}, {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better performance
teamSchema.index({ teamName: 1 });
teamSchema.index({ teamId: 1 });
teamSchema.index({ registrationDate: -1 });
teamSchema.index({ 'teamLeader.email': 1 });

// Virtual for total team member count
teamSchema.virtual('totalMembers').get(function() {
    return this.members.length + 1; // +1 for team leader
});

// Pre-save middleware to validate team structure
teamSchema.pre('save', function(next) {
    // Ensure all team member emails are unique
    const emails = [this.teamLeader.email, ...this.members.map(m => m.email)];
    const uniqueEmails = new Set(emails);
    
    if (emails.length !== uniqueEmails.size) {
        return next(new Error('All team member emails must be unique'));
    }
    
    // Ensure team size consistency
    if (this.members.length !== this.teamSize - 1) {
        return next(new Error(`Team size mismatch: Expected ${this.teamSize - 1} additional members, got ${this.members.length}`));
    }
    
    next();
});

// Static method to find teams by email
teamSchema.statics.findByMemberEmail = function(email) {
    return this.find({
        $or: [
            { 'teamLeader.email': email },
            { 'members.email': email }
        ]
    });
};

// Instance method to get all team emails
teamSchema.methods.getAllEmails = function() {
    return [this.teamLeader.email, ...this.members.map(m => m.email)];
};

const Team = mongoose.model('Team', teamSchema);

module.exports = Team;