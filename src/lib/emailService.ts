import nodemailer from 'nodemailer';
import { render } from '@react-email/render';
import React from 'react';

// Email configuration interface
interface EmailConfig {
  from: string;
  to: string;
  subject: string;
  html: string;
}

// Create email transporter
const createTransporter = () => {
  // Use Gmail with the provided credentials
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER || 'dhageravi4@gmail.com',
      pass: process.env.SMTP_PASS || '35793579'
    }
  });
};

// Email service class
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    this.transporter = createTransporter();
  }

  /**
   * Send an email with HTML content
   */
  async sendEmail(config: EmailConfig): Promise<boolean> {
    try {
      const mailOptions = {
        from: config.from || process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com', // Use the configured Gmail
        to: config.to,
        subject: config.subject,
        html: config.html
      };

      const result = await this.transporter.sendMail(mailOptions);
      return true;
    } catch (error) {
      console.error('Failed to send email:', error);
      return false;
    }
  }

  /**
   * Send React component as email
   */
  async sendReactEmail(
    to: string,
    subject: string,
    ReactComponent: React.ComponentType<Record<string, unknown>>,
    props: Record<string, unknown> = {}
  ): Promise<boolean> {
    try {
      const html = await render(React.createElement(ReactComponent, props));
      
      return await this.sendEmail({
        from: process.env.DEFAULT_FROM_EMAIL || 'dhageravindra28@gmail.com',
        to,
        subject,
        html
      });
    } catch (error) {
      console.error('Failed to send React email:', error);
      return false;
    }
  }

  /**
   * Test email configuration
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      console.log('Email service is ready');
      return true;
    } catch (error) {
      console.error('Email service connection failed:', error);
      return false;
    }
  }
}

// Email templates data interfaces
export interface ApplicantEmailData {
  applicantName: string;
  applicantEmail: string;
  jobTitle: string;
  companyName: string;
  opportunityData?: {
    role: string;
    institute: string;
    department: string;
    location: string;
    stipend: string;
    type: string;
  };
}

export interface TaskEmailData extends ApplicantEmailData {
  taskDetails: {
    title: string;
    description: string;
    dueDate: string;
    submissionFormat?: string;
    contactEmail?: string;
  };
}

export interface InterviewEmailData extends ApplicantEmailData {
  interviewDetails: {
    date: string;
    time: string;
    mode: string;
    link?: string;
    interviewer?: string;
    notes?: string;
  };
}

export interface PaymentRequestEmailData extends ApplicantEmailData {
  eventDetails: {
    title: string;
    type: string;
    location: string;
    department: string;
    paymentLink?: string;
  };
}

// Create singleton instance
export const emailService = new EmailService();

// Email sending functions for different notification types
export const EmailNotifications = {
  /**
   * Send shortlisted notification email
   */
  async sendShortlistedEmail(data: ApplicantEmailData): Promise<boolean> {
    const subject = `🎉 Application Shortlisted - ${data.jobTitle} at ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Shortlisted Application</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background-color: #6366f1; color: white; text-align: center; padding: 40px 24px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .job-card { background-color: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px; margin: 24px 0; }
            .job-title { color: #1e40af; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
            .job-details { color: #6b7280; font-size: 14px; }
            .job-details span { margin-right: 16px; }
            .highlight { font-weight: 600; }
            .footer { background-color: #f3f4f6; text-align: center; padding: 16px; font-size: 12px; color: #6b7280; }
            .support-link { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Shortlisted Application</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${data.applicantName}</span>,</p>
              
              <p>Thank you for applying for the position of <span class="highlight">${data.jobTitle}</span> at <span class="highlight">${data.companyName}</span>.</p>
              
              ${data.opportunityData ? `
              <div class="job-card">
                <p style="font-size: 12px; color: #6366f1; font-weight: 500; margin-bottom: 4px;">Verified by IIT Hyderabad</p>
                <h3 class="job-title">${data.opportunityData.role}</h3>
                <div class="job-details">
                  <span>📅 ${data.opportunityData.type}</span>
                  <span>💰 Stipend: ${data.opportunityData.stipend}</span>
                  <span>📍 ${data.opportunityData.location}</span>
                  <span>🏛️ ${data.opportunityData.department}</span>
                </div>
              </div>
              ` : ''}
              
              <p>We are pleased to inform you that your application <span class="highlight">has been shortlisted</span> for the next stage of our hiring process. Our team was impressed with your qualifications, and we look forward to learning more about you. You will be contacted shortly with the details of the next steps.</p>
              
              <p>If you have any questions in the meantime, feel free to reach out to us.</p>
              
              <p style="font-size: 14px; color: #6b7280;">
                We are committed to helping you achieve your academic and research goals. If you have any questions or need assistance, our <a href="mailto:support@tayog.in" class="support-link">support team</a> is just an email away at support@tayog.in
              </p>
              
              <p style="margin-top: 24px;">Thanks,<br/>
              <span class="highlight">Team Tayog</span><br/>
              <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a></p>
            </div>
            <div class="footer">
              Copyrights © all rights reserved by Tayog
            </div>
          </div>
        </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com',
      to: data.applicantEmail,
      subject,
      html
    });
  },

  /**
   * Send rejected notification email
   */
  async sendRejectedEmail(data: ApplicantEmailData): Promise<boolean> {
    const subject = `Application Update - ${data.jobTitle} at ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Rejected Application</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background-color: #6366f1; color: white; text-align: center; padding: 40px 24px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .highlight { font-weight: 600; }
            .footer { background-color: #f3f4f6; text-align: center; padding: 16px; font-size: 12px; color: #6b7280; }
            .support-link { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Rejected Application</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${data.applicantName}</span>,</p>
              
              <p>Thank you for your interest in the <span class="highlight">${data.jobTitle}</span> position at <span class="highlight">${data.companyName}</span>.</p>
              
              <p>After careful review of your application, we regret to inform you that you <span class="highlight">have not been selected</span> for the next stage. Please know that this decision was not easy, as we received a large number of strong applications. We truly appreciate the time and effort you put into applying and your interest in being part of our team.</p>
              
              <p>We encourage you to apply for future opportunities with us that match your skills and experience.</p>
              
              <p>Wishing you all the best in your job search and future endeavors.</p>
              
              <p style="font-size: 14px; color: #6b7280;">
                We are committed to helping you achieve your academic and research goals. If you have any questions or need assistance, our <a href="mailto:support@tayog.in" class="support-link">support team</a> is just an email away at support@tayog.in
              </p>
              
              <p style="margin-top: 24px;">Thanks,<br/>
              <span class="highlight">Team Tayog</span><br/>
              <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a></p>
            </div>
            <div class="footer">
              Copyrights © all rights reserved by Tayog
            </div>
          </div>
        </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com',
      to: data.applicantEmail,
      subject,
      html
    });
  },

  /**
   * Send task assigned notification email
   */
  async sendTaskAssignedEmail(data: TaskEmailData): Promise<boolean> {
    const subject = `📋 Task Assigned - ${data.jobTitle} at ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Task Assigned</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background-color: #6366f1; color: white; text-align: center; padding: 40px 24px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .job-card { background-color: white; border-radius: 8px; border: 1px solid #e5e7eb; padding: 16px; margin: 24px 0; }
            .job-title { color: #1e40af; font-weight: 600; font-size: 14px; margin-bottom: 8px; }
            .job-details { color: #6b7280; font-size: 14px; }
            .job-details span { margin-right: 16px; }
            .task-details { background-color: #f8fafc; border-radius: 8px; padding: 20px; margin: 20px 0; }
            .task-item { margin-bottom: 12px; position: relative; padding-left: 20px; }
            .task-item:before { content: '•'; position: absolute; left: 0; color: #6b7280; font-weight: bold; }
            .highlight { font-weight: 600; }
            .footer { background-color: #f3f4f6; text-align: center; padding: 16px; font-size: 12px; color: #6b7280; }
            .support-link { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Task Assigned</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${data.applicantName}</span>,</p>
              
              <p>Thank you for applying for the <span class="highlight">${data.jobTitle}</span> position at <span class="highlight">${data.companyName}</span>.</p>
              
              ${data.opportunityData ? `
              <div class="job-card">
                <p style="font-size: 12px; color: #6366f1; font-weight: 500; margin-bottom: 4px;">Verified by IIT Hyderabad</p>
                <h3 class="job-title">${data.opportunityData.role}</h3>
                <div class="job-details">
                  <span>📅 ${data.opportunityData.type}</span>
                  <span>💰 Stipend: ${data.opportunityData.stipend}</span>
                  <span>📍 ${data.opportunityData.location}</span>
                  <span>🏛️ ${data.opportunityData.department}</span>
                </div>
              </div>
              ` : ''}
              
              <p>As part of our evaluation process, we would like you to complete a short task to help us better understand your skills and approach.</p>
              
              <div class="task-details">
                <h3 style="margin-top: 0; color: #374151;">Task Details:</h3>
                <div class="task-item"><span class="highlight">Title:</span> ${data.taskDetails.title}</div>
                <div class="task-item"><span class="highlight">Description:</span> ${data.taskDetails.description}</div>
                <div class="task-item"><span class="highlight">Deadline:</span> ${new Date(data.taskDetails.dueDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                ${data.taskDetails.submissionFormat ? `<div class="task-item"><span class="highlight">Submission Format:</span> ${data.taskDetails.submissionFormat}</div>` : ''}
                ${data.taskDetails.contactEmail ? `<div class="task-item"><span class="highlight">Submit To:</span> <a href="mailto:${data.taskDetails.contactEmail}" class="support-link">${data.taskDetails.contactEmail}</a></div>` : ''}
              </div>
              
              <p>Please go through the task brief carefully and feel free to reach out to us at <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a> if you have any questions or need clarification.</p>
              
              <p>We look forward to reviewing your submission.</p>
              
              <p style="font-size: 14px; color: #6b7280;">
                We are committed to helping you achieve your academic and research goals. If you have any questions or need assistance, our <a href="mailto:support@tayog.in" class="support-link">support team</a> is just an email away at support@tayog.in
              </p>
              
              <p style="margin-top: 24px;">Thanks,<br/>
              <span class="highlight">Team Tayog</span><br/>
              <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a></p>
            </div>
            <div class="footer">
              Copyrights © all rights reserved by Tayog
            </div>
          </div>
        </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com',
      to: data.applicantEmail,
      subject,
      html
    });
  },

  /**
   * Send interview scheduled notification email
   */
  async sendInterviewScheduledEmail(data: InterviewEmailData): Promise<boolean> {
    const subject = `📅 Interview Scheduled - ${data.jobTitle} at ${data.companyName}`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Interview Scheduled</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background-color: #6366f1; color: white; text-align: center; padding: 40px 24px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .interview-card { background-color: white; border-radius: 12px; border: 1px solid #e5e7eb; overflow: hidden; margin: 24px 0; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
            .interview-header { background-color: #6366f1; color: white; text-align: center; padding: 16px; }
            .interview-header h3 { margin: 0; font-size: 20px; font-weight: 600; }
            .interview-details { padding: 24px; text-align: center; }
            .interview-details p { margin-bottom: 8px; font-size: 16px; }
            .highlight { font-weight: 600; }
            .footer { background-color: #f3f4f6; text-align: center; padding: 16px; font-size: 12px; color: #6b7280; }
            .support-link { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Interview Scheduled</h1>
            </div>
            <div class="content">
              <p>Dear <span class="highlight">${data.applicantName}</span>,</p>
              
              <p>Great news! Your interview for the role of <span class="highlight">${data.jobTitle}</span> at <span class="highlight">${data.companyName}</span> is now scheduled.</p>
              
              <div class="interview-card">
                <div class="interview-header">
                  <h3>Interview details</h3>
                </div>
                <div class="interview-details">
                  <p><span class="highlight">Date:</span> ${new Date(data.interviewDetails.date).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                  <p><span class="highlight">Time:</span> ${data.interviewDetails.time}</p>
                  <p><span class="highlight">Mode:</span> ${data.interviewDetails.mode}</p>
                  ${data.interviewDetails.link ? `<p><span class="highlight">Link to Join:</span> <a href="${data.interviewDetails.link}" class="support-link">${data.interviewDetails.link}</a></p>` : ''}
                  ${data.interviewDetails.interviewer ? `<p><span class="highlight">Interviewer:</span> ${data.interviewDetails.interviewer}</p>` : ''}
                </div>
              </div>
              
              ${data.interviewDetails.notes ? `<p><span class="highlight">Additional Notes:</span> ${data.interviewDetails.notes}</p>` : ''}
              
              <p>If you have any questions or need to reschedule, feel free to reach out. We're excited to learn more about your journey and ideas!</p>
              
              <p>Wishing you the best. See you soon!</p>
              
              <p style="font-size: 14px; color: #6b7280;">
                We are committed to helping you achieve your academic and research goals. If you have any questions or need assistance, our <a href="mailto:support@tayog.in" class="support-link">support team</a> is just an email away at support@tayog.in
              </p>
              
              <p style="margin-top: 24px;">Thanks,<br/>
              <span class="highlight">Team Tayog</span><br/>
              <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a></p>
            </div>
            <div class="footer">
              Copyrights © all rights reserved by Tayog
            </div>
          </div>
        </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com',
      to: data.applicantEmail,
      subject,
      html
    });
  },

  /**
   * Send payment request email for event registration
   */
  async sendPaymentRequestEmail(data: PaymentRequestEmailData): Promise<boolean> {
    const subject = `Payment Request for Event Registration`;
    
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Payment Request for Event Registration</title>
          <style>
            body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f9fafb; }
            .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 10px 25px rgba(0,0,0,0.1); }
            .header { background-color: #8b5cf6; color: white; text-align: center; padding: 40px 24px; }
            .header h1 { margin: 0; font-size: 24px; font-weight: 600; }
            .content { padding: 32px 24px; color: #374151; line-height: 1.6; }
            .greeting-line { width: 50px; height: 3px; background-color: #ec4899; margin: 0 0 20px 0; }
            .event-card { background-color: white; border-radius: 8px; border-left: 4px solid #3b82f6; padding: 20px; margin: 24px 0; position: relative; }
            .verified-badge { color: #3b82f6; font-size: 14px; margin-bottom: 12px; }
            .event-title { color: #1e40af; font-weight: 600; font-size: 18px; margin-bottom: 16px; }
            .event-details { display: flex; align-items: center; margin-bottom: 8px; font-size: 14px; color: #6b7280; }
            .event-details svg { width: 16px; height: 16px; margin-right: 8px; }
            .event-logo { position: absolute; top: 20px; right: 20px; text-align: center; }
            .event-logo img { width: 40px; height: 40px; border-radius: 50%; }
            .event-logo-text { font-size: 12px; color: #6b7280; margin-top: 4px; }
            .pay-button { display: inline-block; background-color: #2563eb; color: white; padding: 12px 32px; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 24px 0; text-align: center; }
            .pay-button:hover { background-color: #1d4ed8; }
            .payment-note { text-align: center; font-size: 14px; color: #6b7280; margin-bottom: 24px; }
            .support-section { background-color: #f3f4f6; padding: 20px; border-radius: 8px; margin: 24px 0; }
            .support-text { font-size: 14px; color: #6b7280; margin-bottom: 12px; }
            .footer { background-color: #f3f4f6; text-align: center; padding: 16px; font-size: 12px; color: #6b7280; }
            .support-link { color: #2563eb; text-decoration: none; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Payment Request for Event Registration</h1>
            </div>
            <div class="content">
              <div class="greeting-line"></div>
              <p>Dear <span style="font-weight: 600;">${data.applicantName}</span>,</p>
              
              <p>Thank you for registering for <span style="font-weight: 600;">${data.eventDetails.title}</span>. We are excited to have you as a participant in this unique event. Your application has been successfully reviewed and provisionally confirmed for the event. To complete your registration and reserve your spot, we kindly request you to proceed with the payment process.</p>
              
              <div class="event-card">
                <div class="verified-badge">✓ Verified by ${data.eventDetails.department}</div>
                <div class="event-title">${data.eventDetails.title}</div>
                <div class="event-details">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M6 6V5a3 3 0 013-3h2a3 3 0 013 3v1h2a2 2 0 012 2v3.57A22.952 22.952 0 0110 13a22.95 22.95 0 01-8-1.43V8a2 2 0 012-2h2zm2-1a1 1 0 011-1h2a1 1 0 011 1v1H8V5zm1 5a1 1 0 011-1h.01a1 1 0 110 2H10a1 1 0 01-1-1z" clip-rule="evenodd" />
                  </svg>
                  ${data.eventDetails.type}
                </div>
                <div class="event-details">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  ${data.eventDetails.location}
                </div>
                <div class="event-details">
                  <svg fill="currentColor" viewBox="0 0 20 20">
                    <path fill-rule="evenodd" d="M4 4a2 2 0 00-2 2v4a2 2 0 002 2V6h10a2 2 0 00-2-2H4zm2 6a2 2 0 012-2h8a2 2 0 012 2v4a2 2 0 01-2 2H8a2 2 0 01-2-2v-4zm6 4a2 2 0 100-4 2 2 0 000 4z" clip-rule="evenodd" />
                  </svg>
                  ${data.eventDetails.department}
                </div>
                <div class="event-logo">
                  <div style="width: 40px; height: 40px; background-color: #f59e0b; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: 600; font-size: 14px;">K</div>
                  <div class="event-logo-text">KHOJ 24<br/>Research Scholars' Day</div>
                </div>
              </div>
              
              <div style="text-align: center;">
                <a href="${data.eventDetails.paymentLink || '#'}" class="pay-button">
                  Pay Now
                  <svg style="width: 16px; height: 16px; margin-left: 8px; display: inline-block;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
                <div class="payment-note">This link will redirect you to the payment gateway to pay</div>
              </div>
              
              <div class="support-section">
                <p class="support-text">If you have any questions in the meantime, feel free to reach out to us.</p>
                <p style="font-size: 14px; color: #6b7280; margin: 0;">
                  We are committed to helping you achieve your academic and research goals. If you have any questions or need assistance, our support team is just an email away at <a href="mailto:support@tayog.in" class="support-link">support@tayog.in</a>
                </p>
              </div>
              
              <p style="margin-top: 24px;">Thanks,<br/>
              <span style="font-weight: 600;">Team Tayog</span><br/>
              <a href="mailto:hello@tayog.in" class="support-link">hello@tayog.in</a></p>
            </div>
            <div class="footer">
              Copyrights © all rights reserved by Tayog
            </div>
          </div>
        </body>
      </html>
    `;

    return await emailService.sendEmail({
      from: process.env.DEFAULT_FROM_EMAIL || 'dhageravi4@gmail.com',
      to: data.applicantEmail,
      subject,
      html
    });
  }
}; 