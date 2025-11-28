const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = process.env.PORT || 3001;

// Your Google Sheet ID from the URL
const SHEET_ID = '1itUHfhuD0uMVmgLNorMw1Rbhqahjrhwv1_CjbP7dQII';

// Google Apps Script Web App URL (you'll need to deploy the script and get this URL)
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyckPXLJ6-whHkX-Mpw7yQkZlX-CvydZIU2VhW3kSgtgkzs3rbdsVE8C6bS8GE7DoKo/exec';

let registrations = []; // Local storage for duplicate checking

// Middleware
app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl, etc.)
        if (!origin) return callback(null, true);
        
        // Allow localhost and 127.0.0.1 with any port
        if (origin.match(/^http:\/\/(localhost|127\.0\.0\.1):\d+$/)) {
            return callback(null, true);
        }
        
        return callback(null, true); // Allow all for development
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Generate unique team ID in DEV-0001 format
let teamIdCounter = 1;
function generateTeamId() {
    const paddedNumber = String(teamIdCounter).padStart(4, '0');
    teamIdCounter++;
    return 'DEV-' + paddedNumber;
}

// Function to write to Google Sheets using Google Apps Script Web App
async function writeToGoogleSheet(registration) {
    try {
        console.log('\n🔄 PROCESSING GOOGLE SHEETS INTEGRATION...');
        
        // Always provide manual copy-paste format as PRIMARY method
        const teamRowData = [
            registration.teamId,
            registration.teamName,
            registration.teamLeader.name,
            registration.teamLeader.email,
            registration.teamLeader.phone || '',
            registration.teamLeader.nic || '',
            registration.teamLeader.college || '',
            registration.teamSize,
            new Date(registration.registrationDate).toLocaleString()
        ];

        const memberRows = [];
        
        // Add team leader
        memberRows.push([
            registration.teamId,
            registration.teamLeader.name,
            registration.teamLeader.email,
            registration.teamLeader.phone || '',
            registration.teamLeader.nic || '',
            registration.teamLeader.college || '',
            'Team Leader'
        ]);

        // Add team members
        registration.members.forEach(member => {
            memberRows.push([
                registration.teamId,
                member.name,
                member.email,
                member.phone || '',
                member.nic || '',
                member.college || '',
                'Team Member'
            ]);
        });

        // ALWAYS show manual format
        console.log('\n📊 🟢 GOOGLE SHEETS DATA - READY TO COPY:');
        console.log('='.repeat(100));
        console.log('🔹 TEAMS SHEET - Copy this row:');
        console.log(teamRowData.join('\t'));
        console.log('\n🔹 MEMBERS SHEET - Copy these rows:');
        memberRows.forEach(row => {
            console.log(row.join('\t'));
        });
        console.log('='.repeat(100));
        console.log(`\n🌐 Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
        console.log('📋 Instructions:');
        console.log('1. Go to your Google Sheet');
        console.log('2. Create "Teams" and "Members" tabs if they don\'t exist');
        console.log('3. Copy and paste the tab-separated data above');
        
        // Try Google Apps Script as SECONDARY method
        let gasSuccess = false;
        if (GOOGLE_APPS_SCRIPT_URL && GOOGLE_APPS_SCRIPT_URL !== 'YOUR_DEPLOYED_WEB_APP_URL_HERE') {
            try {
                console.log('\n🔄 Attempting Google Apps Script integration...');
                const response = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registration)
                });
                
                if (response.ok) {
                    const result = await response.json();
                    if (result.success) {
                        console.log('✅ SUCCESS: Also saved to Google Sheets automatically via Apps Script!');
                        gasSuccess = true;
                    } else {
                        console.log('⚠️  Google Apps Script responded but indicated failure');
                    }
                } else {
                    console.log('⚠️  Google Apps Script responded with error status');
                }
            } catch (error) {
                console.log('⚠️  Google Apps Script not responding - using manual format above');
                console.log('💡 To fix automatic saving, redeploy your Google Apps Script');
            }
        } else {
            console.log('⚠️  Google Apps Script URL not configured - using manual format above');
        }
        
        return true;
    } catch (error) {
        console.error('❌ Error in Google Sheets integration:', error.message);
        console.log('📋 Manual backup: Use the tab-separated data above');
        return false;
    }
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        message: 'Dev{thon} 3.0 API is running with Google Sheets integration',
        timestamp: new Date().toISOString(),
        storage: 'Google Sheets Ready',
        sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
        totalRegistrations: registrations.length
    });
});

// Team registration endpoint
app.post('/api/registration/register', async (req, res) => {
    try {
        console.log('\n🎯 NEW REGISTRATION RECEIVED!');
        console.log('='.repeat(60));
        
        const {
            teamName,
            teamLeader,
            members = [],
            projectTitle,
            projectDescription,
            techStack = [],
            projectCategory,
            experience,
            teamSize
        } = req.body;

        console.log(`📝 Team Name: ${teamName}`);
        console.log(`👨‍💼 Team Leader: ${teamLeader?.name} (${teamLeader?.email})`);
        console.log(`👥 Team Members: ${members?.length || 0}`);
        console.log(`🚀 Project: ${projectTitle}`);

        // Validation
        if (!teamName || !teamLeader || !teamLeader.name || !teamLeader.email) {
            console.log('❌ Validation failed: Missing required fields');
            return res.status(400).json({
                success: false,
                message: 'Team name and team leader details are required'
            });
        }

        // Check for duplicate emails (prevent same person from registering multiple times)
        const allEmails = [teamLeader.email, ...members.map(m => m.email)].filter(Boolean);
        const duplicateEmails = [];
        
        for (const registration of registrations) {
            const regEmails = [registration.teamLeader.email, ...registration.members.map(m => m.email)];
            for (const email of allEmails) {
                if (regEmails.includes(email.toLowerCase())) {
                    duplicateEmails.push(email);
                }
            }
        }
        
        if (duplicateEmails.length > 0) {
            return res.status(409).json({
                success: false,
                message: `The following email(s) are already registered: ${duplicateEmails.join(', ')}. Each person can only register once.`,
                duplicateEmails: duplicateEmails
            });
        }

        // Check for duplicate team name
        const existingTeam = registrations.find(reg => 
            reg.teamName.toLowerCase() === teamName.toLowerCase()
        );
        
        if (existingTeam) {
            return res.status(409).json({
                success: false,
                message: 'This team name is already taken. Please choose a different team name.'
            });
        }

        const teamId = generateTeamId();
        const registrationDate = new Date().toISOString();
        const finalTeamSize = teamSize || (1 + members.length);

        // Create registration object
        const registration = {
            teamId,
            teamName,
            teamLeader,
            members,
            projectTitle: projectTitle || 'Dev{thon} 3.0 Project',
            projectDescription: projectDescription || 'Team registered for Dev{thon} 3.0 competition',
            techStack,
            projectCategory: projectCategory || 'Web Development',
            experience: experience || 'Intermediate',
            teamSize: finalTeamSize,
            registrationDate,
            timestamp: Date.now()
        };

        // Store in local array for duplicate checking
        registrations.push(registration);

        // Write to Google Sheets
        const sheetsSuccess = await writeToGoogleSheet(registration);

        console.log('\n📝 NEW REGISTRATION SUCCESSFUL:');
        console.log('='.repeat(60));
        console.log(`✅ Team ID: ${teamId}`);
        console.log(`✅ Team Name: ${teamName}`);
        console.log(`✅ Team Leader: ${teamLeader.name} (${teamLeader.email})`);
        console.log(`✅ Team Size: ${finalTeamSize} members`);
        console.log(`✅ Registration Time: ${new Date(registrationDate).toLocaleString()}`);
        console.log('='.repeat(60));

        res.status(201).json({
            success: true,
            message: 'Team registered successfully! Data is ready for Google Sheets.',
            data: {
                teamId,
                teamName,
                teamLeader: teamLeader.name,
                teamSize: finalTeamSize,
                registrationDate: new Date(registrationDate).toLocaleString(),
                googleSheetsUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
                instructions: 'Check server console for tab-separated data to copy to Google Sheets'
            }
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error during registration',
            error: error.message
        });
    }
});

// Get all registrations for Google Sheets export
app.get('/api/registrations/export', (req, res) => {
    try {
        const teamsData = registrations.map(reg => ({
            'Team ID': reg.teamId,
            'Team Name': reg.teamName,
            'Team Leader': reg.teamLeader.name,
            'Leader Email': reg.teamLeader.email,
            'Leader Phone': reg.teamLeader.phone || '',
            'Leader NIC': reg.teamLeader.nic || '',
            'Leader College': reg.teamLeader.college || '',
            'Team Size': reg.teamSize,
            'Registration Date': new Date(reg.registrationDate).toLocaleString()
        }));

        const membersData = [];
        registrations.forEach(reg => {
            // Add team leader
            membersData.push({
                'Team ID': reg.teamId,
                'Member Name': reg.teamLeader.name,
                'Email': reg.teamLeader.email,
                'Phone': reg.teamLeader.phone || '',
                'NIC': reg.teamLeader.nic || '',
                'College': reg.teamLeader.college || '',
                'Role': 'Team Leader'
            });

            // Add team members
            reg.members.forEach(member => {
                membersData.push({
                    'Team ID': reg.teamId,
                    'Member Name': member.name,
                    'Email': member.email,
                    'Phone': member.phone || '',
                    'NIC': member.nic || '',
                    'College': member.college || '',
                    'Role': 'Team Member'
                });
            });
        });

        res.json({
            success: true,
            data: {
                teams: teamsData,
                members: membersData
            },
            totalTeams: registrations.length,
            totalMembers: membersData.length,
            instructions: {
                message: 'Copy this data to your Google Sheets',
                sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
                teamsSheet: 'Copy teams array to "Teams" sheet',
                membersSheet: 'Copy members array to "Members" sheet'
            }
        });

    } catch (error) {
        console.error('Export error:', error);
        res.status(500).json({
            success: false,
            message: 'Error exporting registrations'
        });
    }
});

// Get registration statistics
app.get('/api/registration/stats', (req, res) => {
    try {
        const totalMembers = registrations.reduce((sum, reg) => sum + reg.teamSize, 0);
        
        res.json({
            success: true,
            data: {
                totalTeams: registrations.length,
                totalMembers: totalMembers,
                sheetUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`,
                exportUrl: `http://localhost:${PORT}/api/registrations/export`
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

// Test endpoint to add sample data to Google Sheets
app.post('/api/test/google-sheets', async (req, res) => {
    try {
        console.log('\n🧪 TESTING GOOGLE SHEETS INTEGRATION...');
        
        const testRegistration = {
            teamId: `DT3-TEST-${Date.now().toString(36).toUpperCase()}`,
            teamName: 'Test Team Alpha',
            teamLeader: {
                name: 'John Test Doe',
                email: 'john.test@devthon.com',
                phone: '+94771234567',
                nic: '200012345678',
                college: 'Test University of Technology'
            },
            members: [
                {
                    name: 'Jane Test Smith',
                    email: 'jane.test@devthon.com',
                    phone: '+94771234568',
                    nic: '199987654321',
                    college: 'Test University of Technology'
                },
                {
                    name: 'Bob Test Wilson',
                    email: 'bob.test@devthon.com',
                    phone: '+94771234569',
                    nic: '200156789012',
                    college: 'Test Institute of Technology'
                }
            ],
            projectTitle: 'Revolutionary Web App',
            projectDescription: 'An innovative web application that solves real-world problems using modern technologies.',
            techStack: ['React', 'Node.js', 'MongoDB', 'Express'],
            projectCategory: 'Web Development',
            experience: 'Intermediate',
            teamSize: 3,
            registrationDate: new Date().toISOString(),
            timestamp: Date.now()
        };

        // Store in local array
        registrations.push(testRegistration);

        // Attempt to write to Google Sheets
        const success = await writeToGoogleSheet(testRegistration);

        console.log('\n✅ TEST REGISTRATION CREATED:');
        console.log('='.repeat(60));
        console.log(`Team ID: ${testRegistration.teamId}`);
        console.log(`Team Name: ${testRegistration.teamName}`);
        console.log(`Leader: ${testRegistration.teamLeader.name}`);
        console.log(`Members: ${testRegistration.members.length}`);
        console.log(`Total Size: ${testRegistration.teamSize}`);
        console.log('='.repeat(60));

        res.json({
            success: true,
            message: 'Test registration created successfully!',
            data: {
                teamId: testRegistration.teamId,
                teamName: testRegistration.teamName,
                teamLeader: testRegistration.teamLeader.name,
                teamSize: testRegistration.teamSize,
                registrationDate: new Date(testRegistration.registrationDate).toLocaleString(),
                googleSheetsUrl: `https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`
            },
            instructions: {
                manual: 'Check server console for tab-separated data to copy to Google Sheets',
                automated: 'If Google Apps Script is deployed, data should appear automatically in your sheet'
            }
        });

    } catch (error) {
        console.error('Test registration error:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating test registration',
            error: error.message
        });
    }
});

// Clear registrations (for testing)
app.delete('/api/registrations/clear', (req, res) => {
    registrations = [];
    console.log('🗑️  All registrations cleared');
    res.json({
        success: true,
        message: 'All registrations cleared'
    });
});

// 404 handler
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: 'API endpoint not found'
    });
});

// Start server
app.listen(PORT, () => {
    console.log('\n🚀 Dev{thon} 3.0 API Server Started!');
    console.log('='.repeat(60));
    console.log(`📍 Server URL: http://localhost:${PORT}`);
    console.log(`🏥 Health Check: http://localhost:${PORT}/health`);
    console.log(`📊 Statistics: http://localhost:${PORT}/api/registration/stats`);
    console.log(`📤 Export Data: http://localhost:${PORT}/api/registrations/export`);
    console.log(`🌐 Google Sheet: https://docs.google.com/spreadsheets/d/${SHEET_ID}/edit`);
    console.log('='.repeat(60));
    console.log('\n📝 Features:');
    console.log('✅ Duplicate email prevention - each person can only register once');
    console.log('✅ Duplicate team name prevention');
    console.log('✅ Google Sheets formatted output in console');
    console.log('✅ Tab-separated data for easy copy-paste to Google Sheets');
    console.log('\n📋 How to use:');
    console.log('1. Registrations will be logged with tab-separated format');
    console.log('2. Copy the tab-separated data directly to Google Sheets');
    console.log('3. Visit /api/registrations/export for JSON formatted data');
    console.log('\n✅ Server ready for registrations!');
});

module.exports = app;