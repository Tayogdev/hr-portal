# Email Notifications Setup Guide

## Overview

The HR Portal now includes automatic email notifications that are sent when:

1. **Applicant Status Changes:**
   - Application is **shortlisted** (SHORTLISTED status)
   - Application is **rejected** (REJECTED status)

2. **Task Assignment:**
   - When a task is assigned to an applicant

3. **Interview Scheduling:**
   - When an interview is scheduled for an applicant

## Environment Variables Setup

Add the following environment variables to your `.env.local` file:

```bash
# Email Configuration
# Default from email address
DEFAULT_FROM_EMAIL=noreply@tayog.in

# Production Email Settings (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your_email@gmail.com
SMTP_PASS=your_app_password

# Development Email Settings (Ethereal - for testing)
ETHEREAL_USER=your_ethereal_username
ETHEREAL_PASS=your_ethereal_password
```

## Email Providers Setup

### For Production (Gmail)

1. **Enable 2-Factor Authentication** on your Gmail account
2. **Generate an App Password:**
   - Go to Google Account settings
   - Navigate to Security → 2-Step Verification → App passwords
   - Generate a new app password for "Mail"
   - Use this password in `SMTP_PASS`

3. **Configure environment variables:**
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=your_email@gmail.com
   SMTP_PASS=your_generated_app_password
   DEFAULT_FROM_EMAIL=your_email@gmail.com
   ```

### For Development (Ethereal Email)

Ethereal Email is perfect for testing without sending real emails:

1. **Create account:** Visit [https://ethereal.email/](https://ethereal.email/)
2. **Get credentials:** Use the provided username and password
3. **Configure environment variables:**
   ```bash
   ETHEREAL_USER=your_ethereal_username
   ETHEREAL_PASS=your_ethereal_password
   ```

### Alternative SMTP Providers

You can also use other SMTP providers:

#### SendGrid
```bash
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_USER=apikey
SMTP_PASS=your_sendgrid_api_key
```

#### Mailgun
```bash
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_USER=your_mailgun_username
SMTP_PASS=your_mailgun_password
```

## Email Templates

The system includes four pre-designed email templates:

1. **Shortlisted Application** - Congratulates applicants on being shortlisted
2. **Rejected Application** - Politely informs applicants of rejection
3. **Task Assigned** - Provides task details and deadlines
4. **Interview Scheduled** - Shares interview details and meeting links

All templates include:
- Responsive design that works on all devices
- Company branding (Tayog)
- Professional styling
- Dynamic content based on applicant and opportunity data

## How It Works

### Status Change Emails
When an applicant's status is updated via the API endpoint:
```
PUT /api/opportunities/applicants/[applicantId]/status
```

The system automatically:
1. Updates the database
2. Fetches applicant and opportunity details
3. Sends appropriate email (shortlisted or rejected)
4. Logs the email sending status

### Task Assignment Emails
When a task is assigned via:
```
POST /api/tasks
```

The system automatically:
1. Creates the task in the database
2. Fetches applicant and opportunity details
3. Sends task assignment email with details
4. Logs the email sending status

### Interview Scheduling Emails
When an interview is scheduled via:
```
POST /api/interviews
```

The system automatically:
1. Creates the interview in the database
2. Fetches applicant and opportunity details
3. Sends interview confirmation email
4. Logs the email sending status

## Email Content Customization

### Dynamic Data Included:
- Applicant name and email
- Job title/position
- Company/institute name
- Department and location
- Stipend information
- Specific task or interview details

### Customizing Templates:
Email templates are defined in `src/lib/emailService.ts`. You can modify:
- Subject lines
- Email content
- Styling and branding
- Additional dynamic fields

## Error Handling

The email system includes comprehensive error handling:

1. **Non-blocking:** Email sending doesn't block API responses
2. **Graceful failures:** API continues to work even if email fails
3. **Logging:** All email attempts are logged for debugging
4. **Fallback data:** Missing applicant data gets sensible defaults

## Testing

### Development Testing
1. Use Ethereal Email for safe testing
2. All emails are captured in Ethereal's web interface
3. No real emails are sent to applicants

### Production Testing
1. Start with a test Gmail account
2. Verify email delivery and formatting
3. Test with different email clients (Gmail, Outlook, Apple Mail)
4. Check spam folder placement

## Troubleshooting

### Common Issues:

**Emails not sending:**
- Check environment variables are set correctly
- Verify SMTP credentials
- Check application logs for error messages

**Emails going to spam:**
- Use a reputable SMTP provider
- Set up proper SPF/DKIM records for your domain
- Use a consistent "from" email address

**Missing applicant data:**
- Check database relationships between applicants and opportunities
- Verify user email addresses are properly stored

**Template formatting issues:**
- Test across different email clients
- Check HTML validity
- Ensure responsive design works on mobile

## Security Considerations

1. **App Passwords:** Never use regular passwords for SMTP
2. **Environment Variables:** Keep email credentials secure
3. **Rate Limiting:** The system respects SMTP provider limits
4. **Data Privacy:** Only necessary applicant data is included in emails

## Future Enhancements

Potential improvements for the email system:

1. **Email Templates in Database:** Store templates in database for easy editing
2. **Email Queue:** Implement queue system for high-volume sending
3. **Delivery Tracking:** Track email opens and clicks
4. **Multiple Languages:** Support internationalization
5. **Admin Dashboard:** Interface for managing email settings
6. **Unsubscribe Handling:** Allow applicants to opt-out 