const nodemailer = require('nodemailer');

// Rate limiting store (in production, use Redis or database)
const rateLimitStore = new Map();

// Clean up old entries every hour
setInterval(() => {
  const now = Date.now();
  for (const [key, data] of rateLimitStore.entries()) {
    if (now - data.resetTime > 15 * 60 * 1000) { // 15 minutes
      rateLimitStore.delete(key);
    }
  }
}, 60 * 60 * 1000);

// Rate limiting function
function checkRateLimit(ip) {
  const now = Date.now();
  const key = ip;
  
  if (!rateLimitStore.has(key)) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now
    });
    return { allowed: true, remaining: 4 };
  }
  
  const data = rateLimitStore.get(key);
  
  // Reset if 15 minutes have passed
  if (now - data.resetTime > 15 * 60 * 1000) {
    rateLimitStore.set(key, {
      count: 1,
      resetTime: now
    });
    return { allowed: true, remaining: 4 };
  }
  
  // Check if limit exceeded
  if (data.count >= 5) {
    return { 
      allowed: false, 
      remaining: 0,
      resetTime: data.resetTime + (15 * 60 * 1000)
    };
  }
  
  // Increment count
  data.count++;
  return { allowed: true, remaining: 5 - data.count };
}

// Create SMTP transporter
const createTransporter = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    },
    tls: {
      rejectUnauthorized: false
    }
  });
};

// Validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Sanitize input
const sanitizeInput = (input) => {
  if (typeof input !== 'string') return '';
  return input.trim().replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '');
};

module.exports = async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Rate limiting
    const clientIP = req.headers['x-forwarded-for'] || req.connection.remoteAddress || 'unknown';
    const rateLimit = checkRateLimit(clientIP);
    
    if (!rateLimit.allowed) {
      return res.status(429).json({
        success: false,
        error: 'Too many requests. Please try again later.',
        resetTime: rateLimit.resetTime
      });
    }

    const { name, email, company, message, phone } = req.body;

    // Sanitize inputs
    const sanitizedData = {
      name: sanitizeInput(name),
      email: sanitizeInput(email),
      company: sanitizeInput(company),
      message: sanitizeInput(message),
      phone: sanitizeInput(phone)
    };

    // Validation
    if (!sanitizedData.name || !sanitizedData.email || !sanitizedData.message) {
      return res.status(400).json({
        success: false,
        error: 'Name, email, and message are required fields'
      });
    }

    if (!isValidEmail(sanitizedData.email)) {
      return res.status(400).json({
        success: false,
        error: 'Please provide a valid email address'
      });
    }

    if (sanitizedData.message.length > 5000) {
      return res.status(400).json({
        success: false,
        error: 'Message is too long (max 5000 characters)'
      });
    }

    const transporter = createTransporter();

    // Email to company
    const companyMailOptions = {
      from: `"${sanitizedData.name}" <${process.env.SMTP_FROM_EMAIL}>`,
      replyTo: sanitizedData.email,
      to: process.env.COMPANY_EMAIL,
      subject: `New Contact Form Submission from ${sanitizedData.name}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #0b1020; border-bottom: 2px solid #6ee7b7; padding-bottom: 10px;">
            New Contact Form Submission
          </h2>
          
          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Name:</strong> ${sanitizedData.name}</p>
            <p><strong>Email:</strong> ${sanitizedData.email}</p>
            ${sanitizedData.company ? `<p><strong>Company:</strong> ${sanitizedData.company}</p>` : ''}
            ${sanitizedData.phone ? `<p><strong>Phone:</strong> ${sanitizedData.phone}</p>` : ''}
          </div>
          
          <div style="margin: 20px 0;">
            <h3 style="color: #0b1020;">Message:</h3>
            <div style="background: white; padding: 15px; border-left: 4px solid #6ee7b7; border-radius: 4px;">
              ${sanitizedData.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #eee; color: #666; font-size: 12px;">
            <p>This email was sent from the Mindbloom Technologies contact form.</p>
            <p>Timestamp: ${new Date().toLocaleString()}</p>
            <p>IP Address: ${clientIP}</p>
          </div>
        </div>
      `
    };

    // Auto-reply to customer
    const customerMailOptions = {
      from: `"Mindbloom Technologies" <${process.env.SMTP_FROM_EMAIL}>`,
      to: sanitizedData.email,
      subject: 'Thank you for contacting Mindbloom Technologies',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="text-align: center; padding: 20px; background: linear-gradient(90deg, #6ee7b7, #60a5fa); border-radius: 8px 8px 0 0;">
            <h1 style="color: white; margin: 0;">Mindbloom Technologies</h1>
          </div>
          
          <div style="padding: 30px; background: white; border-radius: 0 0 8px 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="color: #0b1020;">Thank you for reaching out, ${sanitizedData.name}!</h2>
            
            <p>We've received your message and appreciate you taking the time to contact us. Our team will review your inquiry and get back to you within 24 hours.</p>
            
            <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #0b1020; margin-top: 0;">Your Message:</h3>
              <p style="margin-bottom: 0;">${sanitizedData.message.replace(/\n/g, '<br>')}</p>
            </div>
            
            <p>In the meantime, feel free to explore our services and learn more about how we can help transform your business with cutting-edge technology solutions.</p>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="https://mindbloomtech.in" style="background: linear-gradient(90deg, #6ee7b7, #60a5fa); color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold;">Visit Our Website</a>
            </div>
            
            <div style="border-top: 1px solid #eee; padding-top: 20px; margin-top: 30px; color: #666; font-size: 14px;">
              <p><strong>Mindbloom Technologies</strong><br>
              Email: inquiry@mindbloomtech.in<br>
              Phone: +91-987654321<br>
              Location: Pollachi, Tamil Nadu, India</p>
            </div>
          </div>
        </div>
      `
    };

    // Send emails
    await Promise.all([
      transporter.sendMail(companyMailOptions),
      transporter.sendMail(customerMailOptions)
    ]);

    res.status(200).json({
      success: true,
      message: 'Email sent successfully'
    });

  } catch (error) {
    console.error('Email sending error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to send email. Please try again later.'
    });
  }
}