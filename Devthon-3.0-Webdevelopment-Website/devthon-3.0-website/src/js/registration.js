document.addEventListener('DOMContentLoaded', function() {
    console.log('Registration form JavaScript loaded successfully!');
    
    let currentSection = 1;
    let totalSections = 6;
    
    // Initialize form
    initializeForm();
    
    function initializeForm() {
        updateProgressBar();
        updateSectionVisibility();
        
        // Team size change handler
        const teamSizeSelect = document.getElementById('team-size');
        if (teamSizeSelect) {
            teamSizeSelect.addEventListener('change', handleTeamSizeChange);
        }
        
        // Form submission handler
        const form = document.getElementById('team-registration-form');
        if (form) {
            form.addEventListener('submit', handleFormSubmission);
        }
    }
    
    function handleTeamSizeChange() {
        const teamSize = parseInt(document.getElementById('team-size').value);
        updateMemberRequirements(teamSize);
        updateTotalSections(teamSize);
        updateProgressBar();
    }
    
    function updateTotalSections(teamSize) {
        // Team size 3: sections 1,2,3,4 = 4 total
        // Team size 4: sections 1,2,3,4,5 = 5 total
        // Team size 5: sections 1,2,3,4,5,6 = 6 total
        if (teamSize === 3) {
            totalSections = 4;
        } else if (teamSize === 4) {
            totalSections = 5;
        } else if (teamSize === 5) {
            totalSections = 6;
        }
    }
    
    function updateMemberRequirements(teamSize) {
        // Update required fields based on team size
        const member4Fields = document.querySelectorAll('#section-5 input');
        const member5Fields = document.querySelectorAll('#section-6 input');
        
        if (teamSize >= 4) {
            member4Fields.forEach(field => field.required = true);
        } else {
            member4Fields.forEach(field => field.required = false);
        }
        
        if (teamSize === 5) {
            member5Fields.forEach(field => field.required = true);
        } else {
            member5Fields.forEach(field => field.required = false);
        }
        
        // Update button visibility for section 4 (Member 3)
        const section4ContinueBtn = document.querySelector('#section-4 .btn-next');
        const section4SubmitBtn = document.querySelector('#section-4 .team-size-3');
        if (teamSize === 3) {
            if (section4ContinueBtn) section4ContinueBtn.style.display = 'none';
            if (section4SubmitBtn) section4SubmitBtn.style.display = 'inline-block';
        } else {
            if (section4ContinueBtn) section4ContinueBtn.style.display = 'inline-block';
            if (section4SubmitBtn) section4SubmitBtn.style.display = 'none';
        }
        
        // Update button visibility for section 5 (Member 4)
        const section5ContinueBtn = document.querySelector('#section-5 .btn-next');
        const section5SubmitBtn = document.querySelector('#section-5 .team-size-4');
        if (teamSize === 4) {
            if (section5ContinueBtn) section5ContinueBtn.style.display = 'none';
            if (section5SubmitBtn) section5SubmitBtn.style.display = 'inline-block';
        } else if (teamSize === 5) {
            if (section5ContinueBtn) section5ContinueBtn.style.display = 'inline-block';
            if (section5SubmitBtn) section5SubmitBtn.style.display = 'none';
        }
    }
    
    function updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');
        
        if (progressFill && progressText) {
            const progress = (currentSection / totalSections) * 100;
            progressFill.style.width = `${progress}%`;
            
            // Update progress text
            progressText.textContent = `Step ${currentSection} of ${totalSections}`;
        }
    }
    
    function updateSectionVisibility() {
        // Hide all sections
        for (let i = 1; i <= totalSections; i++) {
            const section = document.getElementById(`section-${i}`);
            if (section) {
                section.style.display = 'none';
            }
        }
        
        // Show current section
        const currentSectionElement = document.getElementById(`section-${currentSection}`);
        if (currentSectionElement) {
            currentSectionElement.style.display = 'block';
        }
    }
    
    function validateCurrentSection() {
        console.log('Validating section:', currentSection);
        const currentSectionElement = document.getElementById(`section-${currentSection}`);
        if (!currentSectionElement) {
            console.log('Section element not found:', `section-${currentSection}`);
            return true;
        }
        
        const requiredFields = currentSectionElement.querySelectorAll('input[required], select[required]');
        console.log('Required fields found:', requiredFields.length);
        
        for (let field of requiredFields) {
            console.log('Checking field:', field.name, 'Value:', field.value);
            if (!field.value.trim()) {
                field.focus();
                const label = field.previousElementSibling;
                const fieldName = label ? label.textContent : field.name;
                showError(`Please fill in the ${fieldName}`);
                return false;
            }
            
            // Email validation
            if (field.type === 'email' && !isValidEmail(field.value)) {
                field.focus();
                showError('Please enter a valid email address');
                return false;
            }
            
            // Phone validation for WhatsApp fields
            if (field.name && field.name.includes('whatsapp') && !isValidPhone(field.value)) {
                field.focus();
                showError('Please enter a valid WhatsApp number (e.g., +94 77 123 4567)');
                return false;
            }
            
            // NIC validation
            if (field.name && field.name.includes('nic') && !isValidNIC(field.value)) {
                field.focus();
                showError('Please enter a valid NIC number (e.g., 123456789V or 20001234567)');
                return false;
            }
        }
        
        console.log('Section validation passed');
        return true;
    }
    
    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
    
    function isValidPhone(phone) {
        // More flexible phone validation
        const cleanPhone = phone.replace(/\s/g, '');
        const phoneRegex = /^(\+94|0)?[7][0-9]{8}$/;
        return phoneRegex.test(cleanPhone) || cleanPhone.length >= 10;
    }
    
    function isValidNIC(nic) {
        const oldNIC = /^[0-9]{9}[vVxX]$/;
        const newNIC = /^[0-9]{12}$/;
        return oldNIC.test(nic) || newNIC.test(nic);
    }
    
    function showError(message) {
        // Create or update error message
        let errorDiv = document.querySelector('.error-message');
        if (!errorDiv) {
            errorDiv = document.createElement('div');
            errorDiv.className = 'error-message';
            errorDiv.style.cssText = `
                background: linear-gradient(135deg, #ff4757, #ff6b7a);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 8px 25px rgba(255, 71, 87, 0.3);
                border-left: 4px solid #ff3742;
                white-space: pre-line;
                font-size: 14px;
                line-height: 1.5;
                max-width: 100%;
                word-wrap: break-word;
            `;
            document.querySelector('.registration-form').prepend(errorDiv);
        }
        
        errorDiv.innerHTML = message.replace(/\n/g, '<br>');
        errorDiv.style.display = 'block';
        
        // Scroll to top to show message
        errorDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Hide after 15 seconds (longer timeout for errors so users can read details)
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 15000);
    }
    
    function showSuccess(message) {
        // Create or update success message with centered display
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.style.cssText = `
                position: fixed;
                top: 50%;
                left: 50%;
                transform: translate(-50%, -50%);
                background: linear-gradient(135deg, #1e3a5f 0%, #16213e 100%);
                color: white;
                padding: 25px 35px;
                border-radius: 18px;
                box-shadow: 0 25px 80px rgba(30, 58, 95, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.2) inset;
                width: 90%;
                max-width: 520px;
                max-height: 90vh;
                text-align: center;
                z-index: 10000;
                font-weight: 500;
                backdrop-filter: blur(10px);
                overflow-y: auto;
            `;
            document.body.appendChild(successDiv);
        }
        
        successDiv.innerHTML = message;
        successDiv.style.display = 'block';
        
        // DON'T auto-hide - keep success message visible permanently
    }
    
    async function handleFormSubmission(e) {
        e.preventDefault();
        
        if (!validateCurrentSection()) {
            return;
        }

        // Show loading state
        const submitBtn = e.target.querySelector('button[type="submit"]');
        const originalText = submitBtn ? submitBtn.textContent : '';
        if (submitBtn) {
            submitBtn.disabled = true;
            submitBtn.textContent = 'Submitting...';
        }
        
        try {
            // Collect and format form data
            const formData = new FormData(e.target);
            const registrationData = formatRegistrationData(formData);
            
            console.log('Submitting Registration Data:', registrationData);
            
            // Always attempt Apps Script first (primary save to Google Sheets)
            const appsScriptSaved = await sendToGoogleAppsScript(registrationData);
            
            // Submit to backend API (secondary, for local tracking)
            let backendOk = false;
            let result = { success: false };
            try {
                const response = await fetch('http://localhost:3001/api/registration/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(registrationData)
                });
                console.log('Response status:', response.status);
                if (response.ok) {
                    backendOk = true;
                    result = await response.json();
                }
            } catch (err) {
                console.warn('Backend unreachable, but Apps Script may have saved.');
            }
            
            console.log('Response result:', result);
            console.log('Apps Script saved:', appsScriptSaved);
            
            if (appsScriptSaved || (backendOk && result.success)) {
                // Show success message with team ID and homepage button
                const teamId = result.data?.teamId || 'DEV-' + String(Date.now() % 10000).padStart(4, '0');
                const teamName = result.data?.teamName || registrationData.teamName;
                const regDate = result.data?.registrationDate || new Date().toLocaleString();
                
                showSuccess(`
<div style="text-align: center; color: white;">
    <div style="font-size: 42px; margin-bottom: 8px;">🎉</div>
    
    <h1 style="font-size: 26px; margin: 0 0 6px 0; font-weight: 700; text-shadow: 0 2px 10px rgba(0,0,0,0.2);">
        Successfully Registered!
    </h1>
    
    <p style="font-size: 14px; opacity: 0.95; margin: 0 0 16px 0;">Your team is now part of Dev{thon} 3.0</p>
    
    <div style="background: rgba(255, 255, 255, 0.15); backdrop-filter: blur(10px); padding: 16px; border-radius: 10px; margin: 16px 0; border: 1px solid rgba(255, 255, 255, 0.2);">
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 1px;">Team ID</div>
        <div style="font-size: 28px; font-weight: 800; color: #ffd700; text-shadow: 0 2px 15px rgba(255, 215, 0, 0.5); margin-bottom: 20px; letter-spacing: 2px;">
            ${teamId}
        </div>
        
        <div style="font-size: 14px; opacity: 0.9; margin-bottom: 5px;">Team Name</div>
        <div style="font-size: 20px; font-weight: 600; margin-bottom: 15px;">${teamName}</div>
        
        <div style="font-size: 12px; opacity: 0.8;">Registered on ${regDate}</div>
    </div>
    
    <div style="margin: 16px 0; padding: 14px; background: rgba(37, 211, 102, 0.2); border-radius: 10px; border: 2px solid #25d366; backdrop-filter: blur(5px);">
        <div style="font-size: 15px; font-weight: 700; margin-bottom: 8px; display: flex; align-items: center; justify-content: center; gap: 6px;">
            <span style="font-size: 18px;">📱</span>
            <span>Join WhatsApp Group</span>
        </div>
        <p style="font-size: 12px; opacity: 0.95; margin: 0 0 10px 0;">Stay updated with competition details</p>
        <a href="https://chat.whatsapp.com/KuwglQSDQ0CJ2FqnMVaJox" target="_blank" style="
            display: inline-block;
            background: #25d366;
            color: white;
            text-decoration: none;
            padding: 10px 26px;
            border-radius: 8px;
            font-size: 14px;
            font-weight: 700;
            box-shadow: 0 8px 25px rgba(37, 211, 102, 0.4);
            transition: all 0.3s ease;
            border: 2px solid rgba(255, 255, 255, 0.3);
        " onmouseover="this.style.transform='translateY(-2px)'; this.style.boxShadow='0 12px 35px rgba(37, 211, 102, 0.6)'" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='0 8px 25px rgba(37, 211, 102, 0.4)'">
            <i class="fab fa-whatsapp"></i> Join Now
        </a>
    </div>
    
    <button onclick="window.location.replace('../index.html')" style="
        background: rgba(255, 255, 255, 0.2);
        color: white;
        border: 2px solid rgba(255, 255, 255, 0.4);
        padding: 10px 30px;
        border-radius: 8px;
        font-size: 14px;
        cursor: pointer;
        margin-top: 12px;
        font-weight: 700;
        backdrop-filter: blur(5px);
        transition: all 0.3s ease;
    " onmouseover="this.style.background='rgba(255, 255, 255, 0.3)'; this.style.transform='translateY(-2px)'" onmouseout="this.style.background='rgba(255, 255, 255, 0.2)'; this.style.transform='translateY(0)'">
        🏠 Back to Home
    </button>
</div>
`);
                
                // Hide the entire page content except success message
                const form = e.target;
                const formSections = document.querySelectorAll('.registration-section, .form-section');
                formSections.forEach(section => {
                    section.style.display = 'none';
                });
                
                // Hide header, progress bar, and all navigation
                const registrationHeader = document.querySelector('.registration-header');
                if (registrationHeader) {
                    registrationHeader.style.display = 'none';
                }
                
                const progressBar = document.querySelector('.progress-container');
                if (progressBar) {
                    progressBar.style.display = 'none';
                }
                
                // Hide all buttons including submit and previous
                const allButtons = document.querySelectorAll('button');
                allButtons.forEach(btn => {
                    btn.style.display = 'none';
                });
                
                // Hide the entire form
                form.style.display = 'none';
                
                // WhatsApp group link is now displayed in success message, no auto-open
                
                // Don't reset button - keep it hidden
                
            } else {
                // Handle API errors
                let errorMessage = 'Registration failed. Please try again.';
                
                if (result.message) {
                    errorMessage = result.message;
                }
                
                if (result.errors && result.errors.length > 0) {
                    errorMessage += '\n\nDetails:\n' + result.errors.map(err => `• ${err.message}`).join('\n');
                }
                
                if (result.registeredEmails && result.registeredEmails.length > 0) {
                    errorMessage += `\n\nAlready registered emails: ${result.registeredEmails.join(', ')}`;
                }
                
                showError(errorMessage + '\n\nIf this keeps happening, please try again later.');
                
                // Reset submit button on error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
                return; // Stop execution to prevent success message
            }
            
        } catch (error) {
            console.error('Submission error:', error);
            // Still try to save directly to Google Sheets
            const formData = new FormData(e.target);
            const registrationData = formatRegistrationData(formData);
            const appsScriptSaved = await sendToGoogleAppsScript(registrationData);
            if (appsScriptSaved) {
                showSuccess('✅ Saved to Google Sheets successfully!\n\n<button onclick="window.location.replace(\'../index.html\')" style="background: linear-gradient(135deg, #1e3a5f, #16213e); color: white; border: none; padding: 15px 30px; border-radius: 10px; font-size: 16px; cursor: pointer; margin-top: 15px;">🏠 Go to Home Page</button>');
            } else {
                showError('Network error. Please check your connection and try again.');
                // Reset submit button on network error
                if (submitBtn) {
                    submitBtn.disabled = false;
                    submitBtn.textContent = originalText;
                }
            }
        }
    }

    async function sendToGoogleAppsScript(registrationData) {
        try {
            // Use the same Apps Script URL as backend
            const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyckPXLJ6-whHkX-Mpw7yQkZlX-CvydZIU2VhW3kSgtgkzs3rbdsVE8C6bS8GE7DoKo/exec';
            const resp = await fetch(GOOGLE_APPS_SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(registrationData)
            });
            if (!resp.ok) return false;
            const data = await resp.json();
            return !!data.success;
        } catch (err) {
            console.warn('Apps Script save failed:', err);
            return false;
        }
    }
    
    function formatRegistrationData(formData) {
        const teamSize = parseInt(formData.get('team-size'));
        
        // Format team leader data
        const teamLeader = {
            name: formData.get('leader-name'),
            email: formData.get('leader-email'),
            phone: formData.get('leader-whatsapp'),
            nic: formData.get('leader-nic'),
            college: formData.get('leader-institution')
        };
        
        // Format additional members based on team size
        const members = [];
        
        for (let i = 2; i <= teamSize; i++) {
            const memberName = formData.get(`member${i}-name`);
            const memberEmail = formData.get(`member${i}-email`);
            
            if (memberName && memberEmail) {
                const memberData = {
                    name: memberName,
                    email: memberEmail,
                    phone: formData.get(`member${i}-whatsapp`),
                    nic: formData.get(`member${i}-nic`)
                };
                members.push(memberData);
            }
        }
        
        // Format complete registration data
        const registrationData = {
            teamName: formData.get('team-name'),
            teamSize: teamSize,
            teamLeader: teamLeader,
            members: members,
            projectTitle: 'Dev{thon} 3.0 Project', // Default since not in form
            projectDescription: 'Team registered for Dev{thon} 3.0 competition', // Default
            techStack: ['Web Development'], // Default
            projectCategory: 'Web Development', // Default
            experience: 'Intermediate' // Default
        };
        
        return registrationData;
    }
    
    // Global functions for navigation
    window.nextSection = function(targetSection) {
        console.log('NextSection called - Current:', currentSection, 'Target:', targetSection);
        
        if (!validateCurrentSection()) {
            console.log('Validation failed for section:', currentSection);
            return;
        }
        
        currentSection = targetSection || currentSection + 1;
        console.log('Moving to section:', currentSection);
        updateProgressBar();
        updateSectionVisibility();
        
        // Scroll to top of form
        document.querySelector('.registration-form-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };
    
    window.prevSection = function(targetSection) {
        currentSection = targetSection || currentSection - 1;
        updateProgressBar();
        updateSectionVisibility();
        
        // Scroll to top of form
        document.querySelector('.registration-form-section').scrollIntoView({ 
            behavior: 'smooth', 
            block: 'start' 
        });
    };
    
    window.checkTeamSize = function(targetSection) {
        if (!validateCurrentSection()) {
            return;
        }
        
        const teamSize = parseInt(document.getElementById('team-size').value);
        
        if (currentSection === 4) { // After Member 3
            if (teamSize >= 4) {
                window.nextSection(5); // Go to Member 4
            }
        } else if (currentSection === 5) { // After Member 4
            if (teamSize === 5) {
                window.nextSection(6); // Go to Member 5
            }
        } else {
            window.nextSection(targetSection);
        }
    };
});