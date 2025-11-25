document.addEventListener('DOMContentLoaded', function () {
    let currentSection = 1;
    const totalSections = 7;

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
    }

    function updateProgressBar() {
        const progressFill = document.getElementById('progress-fill');
        const progressText = document.getElementById('progress-text');

        if (progressFill && progressText) {
            const progress = ((currentSection + 1) / totalSections) * 100;
            progressFill.style.width = `${progress}%`;

            // Update section titles for better progress indication
            const sectionTitles = [
                'Team Information',
                'Team Leader Details',
                'Member 2 Details',
                'Member 3 Details',
                'Additional Members',
                'Review & Submit',
                'Registration Complete'
            ];

            if (currentSection < sectionTitles.length) {
                progressText.textContent = `${sectionTitles[currentSection]} (${currentSection + 1}/${totalSections})`;
            } else {
                progressText.textContent = `Step ${currentSection + 1} of ${totalSections}`;
            }
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
        const currentSectionElement = document.getElementById(`section-${currentSection}`);
        if (!currentSectionElement) return true;

        const requiredFields = currentSectionElement.querySelectorAll('input[required], select[required]');

        for (let field of requiredFields) {
            if (!field.value.trim()) {
                field.focus();
                showError(`Please fill in the ${field.previousElementSibling.textContent}`);
                return false;
            }

            // Email validation
            if (field.type === 'email' && !isValidEmail(field.value)) {
                field.focus();
                showError('Please enter a valid email address');
                return false;
            }

            // Phone validation
            if (field.type === 'tel' && !isValidPhone(field.value)) {
                field.focus();
                showError('Please enter a valid WhatsApp number');
                return false;
            }

            // NIC validation
            if (field.name.includes('nic') && !isValidNIC(field.value)) {
                field.focus();
                showError('Please enter a valid NIC number');
                return false;
            }
        }

        return true;
    }

    function isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    function isValidPhone(phone) {
        const phoneRegex = /^(\+94|0)?[7][0-9]{8}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
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

        // Hide after 8 seconds
        setTimeout(() => {
            errorDiv.style.display = 'none';
        }, 8000);
    }

    function showSuccess(message) {
        // Create or update success message
        let successDiv = document.querySelector('.success-message');
        if (!successDiv) {
            successDiv = document.createElement('div');
            successDiv.className = 'success-message';
            successDiv.style.cssText = `
                background: linear-gradient(135deg, #2ed573, #7bed9f);
                color: white;
                padding: 15px 20px;
                border-radius: 12px;
                margin-bottom: 20px;
                box-shadow: 0 8px 25px rgba(46, 213, 115, 0.3);
                border-left: 4px solid #2ed573;
                white-space: pre-line;
                font-size: 14px;
                line-height: 1.5;
                max-width: 100%;
                word-wrap: break-word;
            `;
            document.querySelector('.registration-form').prepend(successDiv);
        }

        successDiv.innerHTML = message.replace(/\n/g, '<br>');
        successDiv.style.display = 'block';

        // Scroll to top to show message
        successDiv.scrollIntoView({ behavior: 'smooth', block: 'center' });

        // Hide after 8 seconds (longer for success messages with important info)
        setTimeout(() => {
            successDiv.style.display = 'none';
        }, 8000);
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

            // Submit to backend API
            const response = await fetch('http://localhost:3000/api/registration/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(registrationData)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                // Show success message with team ID
                showSuccess(`Registration successful! Your Team ID: ${result.data.teamId}. Please save this ID for future reference.`);

                // Redirect to WhatsApp group after a delay
                setTimeout(() => {
                    window.open('https://chat.whatsapp.com/KS3gAzOxgKtG0w6KomIWyw', '_blank');
                }, 3000);

                // Reset form after successful submission
                setTimeout(() => {
                    e.target.reset();
                    currentSection = 1;
                    updateProgressBar();
                    updateSectionVisibility();
                }, 5000);

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

                showError(errorMessage);
            }

        } catch (error) {
            console.error('Submission error:', error);
            showError('Network error. Please check your connection and try again.');
        } finally {
            // Reset button state
            if (submitBtn) {
                submitBtn.disabled = false;
                submitBtn.textContent = originalText;
            }
        }
    }

    function formatRegistrationData(formData) {
        const teamSize = parseInt(formData.get('team-size'));

        // Format team leader data
        const teamLeader = {
            name: formData.get('leader-name'),
            email: formData.get('leader-email'),
            phone: formData.get('leader-phone'),
            college: formData.get('leader-college'),
            year: formData.get('leader-year'),
            skills: formData.get('leader-skills') ? formData.get('leader-skills').split(',').map(s => s.trim()) : []
        };

        // Format additional members based on team size
        const members = [];

        for (let i = 2; i <= teamSize; i++) {
            const memberData = {
                name: formData.get(`member${i}-name`),
                email: formData.get(`member${i}-email`),
                phone: formData.get(`member${i}-phone`),
                college: formData.get(`member${i}-college`),
                year: formData.get(`member${i}-year`),
                skills: formData.get(`member${i}-skills`) ? formData.get(`member${i}-skills`).split(',').map(s => s.trim()) : []
            };

            // Only add member if they have required data
            if (memberData.name && memberData.email) {
                members.push(memberData);
            }
        }

        // Format complete registration data
        const registrationData = {
            teamName: formData.get('team-name'),
            teamSize: teamSize,
            teamLeader: teamLeader,
            members: members,
            projectTitle: formData.get('project-title'),
            projectDescription: formData.get('project-description'),
            techStack: formData.get('tech-stack') ? formData.get('tech-stack').split(',').map(s => s.trim()) : [],
            projectCategory: formData.get('project-category'),
            experience: formData.get('experience'),
            requirements: formData.get('requirements') || '',
            whatsappGroup: formData.get('whatsapp-group') || ''
        };

        return registrationData;
    }

    // Global functions for navigation
    window.nextSection = function (targetSection) {
        if (!validateCurrentSection()) {
            return;
        }

        currentSection = targetSection || currentSection + 1;
        updateProgressBar();
        updateSectionVisibility();

        // Scroll to top of form
        document.querySelector('.registration-form-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    window.prevSection = function (targetSection) {
        currentSection = targetSection || currentSection - 1;
        updateProgressBar();
        updateSectionVisibility();

        // Scroll to top of form
        document.querySelector('.registration-form-section').scrollIntoView({
            behavior: 'smooth',
            block: 'start'
        });
    };

    window.checkTeamSize = function (targetSectionId) {
        const teamSize = parseInt(document.getElementById('team-size').value);

        if (currentSection === 4) { // After Member 3
            if (teamSize >= 4) {
                window.nextSection(5); // Go to Member 4
            } else {
                window.nextSection(7); // Go to final section
            }
        } else if (currentSection === 5) { // After Member 4
            if (teamSize === 5) {
                window.nextSection(6); // Go to Member 5
            } else {
                window.nextSection(7); // Go to final section
            }
        }
    };
});