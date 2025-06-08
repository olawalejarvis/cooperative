import { getLogger } from './logger';
import axios from 'axios';
import sgMail from '@sendgrid/mail';
import nodemailer from 'nodemailer';
import { User } from '../entity/User';
import { Organization } from '../entity/Organization';

export class NotificationService {
  private static instance: NotificationService;
  private logger = getLogger('services/NotificationService');

  private constructor() {}

  public static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  public async sendSms(phoneNumber: string, message: string): Promise<void> {
    // Here you would implement the logic to send an SMS.
    // Example: You might use a service like Twilio or Nexmo to send the SMS.
    // await smsService.send(phoneNumber, message);

    
    await this.sendWhatsAppMessage(phoneNumber, message);
  }

  /**
   * Sends a WhatsApp message using a WhatsApp API provider (e.g., Twilio, Vonage, or custom provider).
   * @param phoneNumber The recipient's phone number in international format.
   * @param message The message to send.
   * @returns Promise<void>
   * @throws Error if the message fails to send.
   */
  public async sendWhatsAppMessage(phoneNumber: string, message: string): Promise<void> {
    this.logger.info(`Sending WhatsApp message to ${phoneNumber}: ${message}`);
    const apiUrl = process.env.WHATSAPP_API_URL || 'https://api.yourwhatsappprovider.com/send';
    const apiKey = process.env.WHATSAPP_API_KEY || 'your_api_key_here';

    try {
      await axios.post(apiUrl, {
        to: phoneNumber,
        message,
      }, {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      });
    } catch (error) {
      this.logger.error(`Failed to send WhatsApp message to ${phoneNumber}: ${error}`);
      throw new Error(`Failed to send WhatsApp message: ${error}`);
    }
  }

  public async sendEmail(email: string, subject: string, body: string): Promise<void> {

    // await this.sendEmailWithSendGrid(email, subject, body);
    await this.sendEmailWithNodemailer(email, subject, body);
  }

  /**
   * Send email using SendGrid.
   */
  public async sendEmailWithSendGrid(email: string, subject: string, body: string): Promise<void> {
    this.logger.info(`Sending email to ${email} with subject "${subject}": ${body}`);
    const sendgridApiKey = process.env.SENDGRID_API_KEY;
    if (!sendgridApiKey) {
      this.logger.error('SENDGRID_API_KEY is not set');
      throw new Error('SENDGRID_API_KEY is not set');
    }
    sgMail.setApiKey(sendgridApiKey);
    const msg = {
      to: email,
      from: process.env.SENDGRID_FROM_EMAIL || 'no-reply@coop-app.com',
      subject,
      text: body,
    };
    try {
      await sgMail.send(msg);
      this.logger.info(`Email sent to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email to ${email}: ${error}`);
      throw new Error(`Failed to send email: ${error}`);
    }
  }

  /**
   * Send email using Nodemailer (SMTP).
   */
  public async sendEmailWithNodemailer(email: string, subject: string, body: string): Promise<void> {
    this.logger.info(`Sending email (Nodemailer) to ${email} with subject "${subject}": ${body}`);
    const smtpHost = process.env.SMTP_HOST;
    const smtpPort = process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : 587;
    const smtpUser = process.env.SMTP_USER;
    const smtpPass = process.env.SMTP_PASSWORD;
    const fromEmail = process.env.SMTP_FROM_EMAIL || 'no-reply@coop-app.com';
    if (!smtpHost || !smtpUser || !smtpPass) {
      this.logger.error('SMTP credentials are not set');
      throw new Error('SMTP credentials are not set');
    }
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465, // true for 465, false for other ports
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    try {
      await transporter.sendMail({
        from: fromEmail,
        to: email,
        subject,
        text: body,
      });
      this.logger.info(`Email sent (Nodemailer) to ${email}`);
    } catch (error) {
      this.logger.error(`Failed to send email (Nodemailer) to ${email}: ${error}`);
      throw new Error(`Failed to send email (Nodemailer): ${error}`);
    }
  }

  async sendAccountVerificationEmail(user: User, verificationLink: string, orgLabel?: string): Promise<void> {
    // send email to verify account to user
    const emailBody = `
      Hello ${user.firstName || user.userName || ''},

      Welcome to ${orgLabel} Cooperative Society!

      Please verify your account by clicking the link below:

          ${verificationLink}

      If you did not request this account, please ignore this email.

      Thank you,
      ${orgLabel} Team
    `;
    const subject = 'Verify your Cooperative Account';
    await this.sendEmail(user.email, subject, emailBody);
  }

  async sendGuestAccountApprovalEmail(adminUser: User, guestUser: User, organization: Organization, activationUrl: string): Promise<void> {
    const emailBody = `
      Hello Admin,

      A new user has requested to join your cooperative (${organization.label || organization.name}).

      User details:
      Name: ${guestUser.firstName || ''} ${guestUser.lastName || ''}
      Username: ${guestUser.userName || ''}
      Email: ${guestUser.email || ''}
      Phone: ${guestUser.phoneNumber || ''}

      To approve and activate this user, click the link below:

          ${activationUrl}

      Or review and approve this registration in your admin dashboard.

      Thank you,
      Coop App System
    `;
    const subject = 'New User Registration Request - Approval Needed';
    await this.sendEmail(adminUser.email, subject, emailBody);
  }

  async send2FaAuthenticationCode(user: User, organization: Organization, code: string) {
    const emailBody = `
      Hello ${user.firstName || ''},

      We received a request to log in to your Coop App account for organization "${organization.label}".

      Your One-Time Password (OTP) for login is:

          ${code}

      This code is valid for 5 minutes. If you did not request this code, please ignore this email or contact support immediately.

      Thank you,
      Coop App Security Team
    `;
    const subject = 'Your Coop App 2FA Code';
    await this.sendEmail(user.email, subject, emailBody)
  }

}
// Usage example:
// const notificationService = NotificationService.getInstance();
// notificationService.sendSms('+1234567890', 'Hello, this is a test message.');
