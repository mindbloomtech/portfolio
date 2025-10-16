// SMTP Contact Form Handler
if (typeof SMTPContactForm === 'undefined') {
class SMTPContactForm {
    constructor(formId, options = {}) {
        this.form = document.getElementById(formId);

        // Validate that we found a form element
        if (!this.form) {
            console.error(`Form with ID '${formId}' not found`);
            return;
        }

        if (this.form.tagName !== 'FORM') {
            console.error(`Element with ID '${formId}' is not a form element`);
            return;
        }

        // Auto-detect API URL based on environment
        const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
        const defaultApiUrl = isLocalhost ? 'http://localhost:3000/api/contact' : '/api/contact';
        this.apiUrl = options.apiUrl || defaultApiUrl;
        this.onSuccess = options.onSuccess || this.defaultSuccessHandler;
        this.onError = options.onError || this.defaultErrorHandler;
        this.onLoading = options.onLoading || this.defaultLoadingHandler;

        this.init();
    }

    init() {
        this.form.addEventListener('submit', this.handleSubmit.bind(this));
    }

    async handleSubmit(e) {
        e.preventDefault();

        // Validate form element before creating FormData
        if (!this.form || this.form.tagName !== 'FORM') {
            console.error('Invalid form element');
            this.onError('Form not found. Please refresh the page and try again.');
            return;
        }

        // Get form data manually to avoid FormData issues
        const data = {
            name: this.form.querySelector('[name="name"]')?.value?.trim() || '',
            email: this.form.querySelector('[name="email"]')?.value?.trim() || '',
            company: this.form.querySelector('[name="company"]')?.value?.trim() || '',
            phone: this.form.querySelector('[name="phone"]')?.value?.trim() || '',
            message: this.form.querySelector('[name="message"]')?.value?.trim() || ''
        };

        // Client-side validation
        if (!this.validateForm(data)) {
            return;
        }

        try {
            this.onLoading(true);

            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.ok && result.success) {
                this.onSuccess(result.message);
                this.form.reset();
            } else {
                this.onError(result.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            this.onError('Network error. Please check your connection and try again.');
        } finally {
            this.onLoading(false);
        }
    }

    validateForm(data) {
        const errors = [];

        if (!data.name) {
            errors.push('Name is required');
        }

        if (!data.email) {
            errors.push('Email is required');
        } else if (!this.isValidEmail(data.email)) {
            errors.push('Please enter a valid email address');
        }

        if (!data.message) {
            errors.push('Message is required');
        } else if (data.message.length > 5000) {
            errors.push('Message is too long (max 5000 characters)');
        }

        if (errors.length > 0) {
            this.onError(errors.join(', '));
            return false;
        }

        return true;
    }

    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }

    defaultSuccessHandler(message) {
        this.showNotification(message || 'Message sent successfully!', 'success');
    }

    defaultErrorHandler(error) {
        this.showNotification(error || 'Failed to send message', 'error');
    }

    defaultLoadingHandler(isLoading) {
        if (!this.form) return;

        const submitBtn = this.form.querySelector('button[type="submit"]');
        if (submitBtn) {
            if (isLoading) {
                submitBtn.disabled = true;
                submitBtn.textContent = 'Sending...';
                submitBtn.style.opacity = '0.7';
            } else {
                submitBtn.disabled = false;
                submitBtn.textContent = 'Send Message';
                submitBtn.style.opacity = '1';
            }
        }
    }

    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.smtp-notification');
        existingNotifications.forEach(n => n.remove());

        // Create notification
        const notification = document.createElement('div');
        notification.className = `smtp-notification smtp-notification-${type}`;
        notification.innerHTML = `
      <div class="smtp-notification-content">
        <span>${message}</span>
        <button class="smtp-notification-close" onclick="this.parentElement.parentElement.remove()">×</button>
      </div>
    `;

        // Add styles if not already present
        if (!document.getElementById('smtp-notification-styles')) {
            const styles = document.createElement('style');
            styles.id = 'smtp-notification-styles';
            styles.textContent = `
        .smtp-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          z-index: 10000;
          max-width: 400px;
          border-radius: 8px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          animation: slideIn 0.3s ease-out;
        }
        
        .smtp-notification-success {
          background: linear-gradient(135deg, #6ee7b7, #10b981);
          color: white;
        }
        
        .smtp-notification-error {
          background: linear-gradient(135deg, #f87171, #ef4444);
          color: white;
        }
        
        .smtp-notification-content {
          padding: 16px 20px;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        
        .smtp-notification-close {
          background: none;
          border: none;
          color: inherit;
          font-size: 20px;
          cursor: pointer;
          padding: 0;
          margin-left: 12px;
          opacity: 0.8;
        }
        
        .smtp-notification-close:hover {
          opacity: 1;
        }
        
        @keyframes slideIn {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }
        
        @media (max-width: 480px) {
          .smtp-notification {
            left: 20px;
            right: 20px;
            max-width: none;
          }
        }
      `;
            document.head.appendChild(styles);
        }

        document.body.appendChild(notification);

        // Auto-remove after 5 seconds
        setTimeout(() => {
            if (notification.parentElement) {
                notification.remove();
            }
        }, 5000);
    }
}

// Auto-initialize if contact form exists
document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit to ensure all DOM is loaded
    setTimeout(() => {
        const contactForm = document.getElementById('contact-form');
        if (contactForm && contactForm.tagName === 'FORM') {
            console.log('Initializing SMTP contact form');
            new SMTPContactForm('contact-form');
        } else {
            console.error('Contact form not found or invalid');
        }
    }, 100);
});

} // End of SMTPContactForm check