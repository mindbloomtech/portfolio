# Mindbloom Technologies - SMTP Contact Form Setup

This project includes a complete SMTP email setup for the Mindbloom Technologies contact form.

## Features

- ✅ Node.js Express server with SMTP functionality
- ✅ Rate limiting and security middleware
- ✅ Professional email templates
- ✅ Auto-reply to customers
- ✅ Client-side form validation
- ✅ Responsive notifications
- ✅ Error handling and logging

## Quick Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment Variables

Update your `.env` file with your SMTP credentials:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM_EMAIL=your-email@gmail.com

# Application Configuration
PORT=3000
COMPANY_EMAIL=mindbloomtech@gmail.com
ALLOWED_ORIGINS=http://localhost:3000,https://mindbloomtech.in
```

### 3. Gmail Setup (if using Gmail)

1. Enable 2-Factor Authentication on your Gmail account
2. Generate an App Password:
   - Go to Google Account settings
   - Security → 2-Step Verification → App passwords
   - Generate a password for "Mail"
   - Use this password in `SMTP_PASS`

### 4. Start the Server

```bash
# Development mode
npm run dev

# Production mode
npm start
```

### 5. Test the Setup

Visit `http://localhost:3000/api/health` to check if the server is running.
Visit `http://localhost:3000/api/test-smtp` to test SMTP connection.

## File Structure

```
├── server.js              # Main SMTP server
├── smtp-contact.js         # Client-side form handler
├── package.json           # Dependencies
├── .env                   # Environment variables
├── index.html             # Updated with SMTP form
└── README.md              # This file
```

## API Endpoints

- `POST /api/contact` - Send contact form email
- `GET /api/health` - Health check
- `GET /api/test-smtp` - Test SMTP connection

## Security Features

- Rate limiting (5 requests per 15 minutes per IP)
- Input validation and sanitization
- CORS protection
- Helmet security headers
- Email format validation
- Message length limits

## Customization

### Email Templates

Edit the HTML templates in `server.js`:
- `companyMailOptions.html` - Email sent to your company
- `customerMailOptions.html` - Auto-reply sent to customers

### Form Fields

The contact form supports:
- Name (required)
- Email (required)
- Company (optional)
- Phone (optional)
- Message (required)

### Styling

Notification styles are included in `smtp-contact.js`. Customize the CSS in the `showNotification` method.

## Production Deployment

1. Update `ALLOWED_ORIGINS` in `.env` with your production domain
2. Update the `apiUrl` in the HTML script section
3. Use a process manager like PM2:

```bash
npm install -g pm2
pm2 start server.js --name "mindbloom-smtp"
```

## Troubleshooting

### Common Issues

1. **SMTP Authentication Failed**
   - Check your email and app password
   - Ensure 2FA is enabled for Gmail
   - Verify SMTP settings

2. **Rate Limit Exceeded**
   - Wait 15 minutes or adjust rate limits in `server.js`

3. **CORS Errors**
   - Add your domain to `ALLOWED_ORIGINS`

4. **Form Not Submitting**
   - Check browser console for errors
   - Verify server is running
   - Check network connectivity

### Testing

Test the contact form by:
1. Filling out the form on your website
2. Checking server logs for any errors
3. Verifying emails are received
4. Testing the auto-reply functionality

## Support

For issues or questions, contact: mindbloomtech@gmail.com

---

**Mindbloom Technologies** - Empowering businesses with next-gen software and AI