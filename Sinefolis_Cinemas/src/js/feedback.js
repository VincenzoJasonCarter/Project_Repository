document.addEventListener('DOMContentLoaded', function () {
    const feedbackForm = document.getElementById('feedbackForm');
    const submissionStatus = document.getElementById('formSubmissionStatus');

    const fullNameInput = document.getElementById('fullName');
    const emailInput = document.getElementById('email');
    const phoneInput = document.getElementById('phone');
    const feedbackTypeSelect = document.getElementById('feedbackType');
    const feedbackMessageTextarea = document.getElementById('feedbackMessage');
    
    const fullNameError = document.getElementById('fullNameError');
    const emailError = document.getElementById('emailError');
    const phoneError = document.getElementById('phoneError');
    const feedbackTypeError = document.getElementById('feedbackTypeError');
    const feedbackMessageError = document.getElementById('feedbackMessageError');
    const ratingError = document.getElementById('ratingError');

    feedbackForm.addEventListener('submit', function (event) {
        event.preventDefault();
        clearAllErrors();
        let isValid = true;

        // 1. Required Field Validation (Full Name) & 2. Minimum Length Validation (Full Name)
        const fullNameValue = fullNameInput.value.trim();
        if (fullNameValue === '') {
            displayError(fullNameError, 'Full name is required.');
            isValid = false;
        } else if (fullNameValue.length < 3) {
            displayError(fullNameError, 'Full name must be at least 3 characters long.');
            isValid = false;
        }

        // 1. Required Field Validation (Email) & 3. Email Basic Format Check
        const emailValue = emailInput.value.trim();
        if (emailValue === '') {
            displayError(emailError, 'Email address is required.');
            isValid = false;
        } else if (!isValidEmail(emailValue)) {
            displayError(emailError, 'Please enter a valid email address format (e.g., name@example.com).');
            isValid = false;
        }

        // 4. Numeric Check & Length for Phone (Optional field, so only validate if filled)
        const phoneValue = phoneInput.value.trim();
        if (phoneValue !== '') { // Only validate if not empty
            if (!isNumeric(phoneValue)) {
                displayError(phoneError, 'Phone number must contain only digits.');
                isValid = false;
            } else if (phoneValue.length < 7 || phoneValue.length > 15) {
                displayError(phoneError, 'Phone number must be between 7 and 15 digits.');
                isValid = false;
            }
        }
        
        // 1. Required Field Validation (Feedback Type) & 5. Specific Value for Select
        if (feedbackTypeSelect.value === '') {
            displayError(feedbackTypeError, 'Please select a feedback type.');
            isValid = false;
        }

        // 1. Required Field Validation (Feedback Message) & 2. Minimum Length Validation (Feedback Message)
        const feedbackMessageValue = feedbackMessageTextarea.value.trim();
        if (feedbackMessageValue === '') {
            displayError(feedbackMessageError, 'Feedback message is required.');
            isValid = false;
        } else if (feedbackMessageValue.length < 10) {
            displayError(feedbackMessageError, 'Feedback message must be at least 10 characters long.');
            isValid = false;
        }

        // 1. Required Field Validation (Rating - Radio Button Selection)
        const selectedRating = document.querySelector('input[name="rating"]:checked');
        if (!selectedRating) {
            displayError(ratingError, 'Please select an overall experience rating.');
            isValid = false;
        }

        if (isValid) {
            submissionStatus.textContent = 'Thank you for your feedback! It has been submitted successfully.';
            submissionStatus.className = 'submission-status success';
            submissionStatus.style.display = 'block';
            feedbackForm.reset(); // Clear the form
            setTimeout(() => { // Hide message after a few seconds
                 submissionStatus.style.display = 'none';
            }, 5000);
            // In a real application, you would send data to a server here.
            // For example:
            // const formData = new FormData(feedbackForm);
            // fetch('/submit-feedback', { method: 'POST', body: formData })
            // .then(...)
        } else {
            submissionStatus.textContent = 'Please correct the errors highlighted below.';
            submissionStatus.className = 'submission-status error';
            submissionStatus.style.display = 'block';
        }
    });

    function displayError(element, message) {
        if (element) {
            element.textContent = message;
        }
    }

    function clearAllErrors() {
        const errorMessages = document.querySelectorAll('.error-message');
        errorMessages.forEach(msg => msg.textContent = '');
        if(submissionStatus) submissionStatus.style.display = 'none';
    }

    function isValidEmail(email) {
        if (email.length === 0) return false;
        
        const atSymbolIndex = email.indexOf('@');
        if (atSymbolIndex <= 0 || atSymbolIndex === email.length - 1) { // '@' not found, or is first/last char
            return false;
        }
        
        const partAfterAt = email.substring(atSymbolIndex + 1);
        const dotSymbolIndex = partAfterAt.indexOf('.');
        
        if (dotSymbolIndex <= 0 || dotSymbolIndex === partAfterAt.length - 1) { // '.' not found after '@', or is first/last char in domain part
            return false;
        }
        
        return true;
    }

    function isNumeric(value) {
        if (value.length === 0) return false; // or true if empty is allowed but handled by required
        for (let i = 0; i < value.length; i++) {
            const char = value.charAt(i);
            if (char < '0' || char > '9') {
                return false;
            }
        }
        return true;
    }
});