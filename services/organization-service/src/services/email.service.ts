import { Injectable } from '@nestjs/common';
import * as nodemailer from 'nodemailer';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor() {
    const smtpHost = process.env.SMTP_HOST || 'smtp.hostinger.com';
    const smtpPort = parseInt(process.env.SMTP_PORT || '465', 10);
    const smtpUser = process.env.SMTP_USER || process.env.EMAIL_FROM;
    const smtpPass = process.env.SMTP_PASS;

    // Vérifier que les credentials SMTP sont présents
    if (!smtpUser || !smtpPass) {
      console.warn('⚠️  SMTP credentials manquants. Les emails ne pourront pas être envoyés.');
      console.warn('   Variables requises: SMTP_USER (ou EMAIL_FROM) et SMTP_PASS');
    }

    this.transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE !== 'false', // true par défaut pour port 465
      auth: smtpUser && smtpPass ? {
        user: smtpUser,
        pass: smtpPass,
      } : undefined, // Pas d'auth si credentials manquants (pour éviter l'erreur)
    });
  }

  /**
   * Envoyer un email de réinitialisation de mot de passe
   */
  async sendPasswordResetEmail(email: string, resetToken: string): Promise<void> {
    // Production: HTTPS, Development: HTTP localhost
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://viridial.com' : 'http://localhost:3000');
    const resetUrl = `${frontendUrl}/reset-password?token=${resetToken}`;

    const fromName = process.env.FROM_NAME || 'Viridial Support';
    const fromEmail = process.env.EMAIL_FROM || 'support@viridial.com';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Réinitialisation de votre mot de passe - Viridial',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Réinitialisation de mot de passe - Viridial</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #0B1220;
              background-color: #F7F7F9;
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #FFFFFF;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(11, 18, 32, 0.08);
            }
            .email-header {
              text-align: center;
              padding: 40px 30px 30px;
              border-bottom: 1px solid #E6E7EA;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #0B1220;
              letter-spacing: -0.5px;
              margin-bottom: 10px;
            }
            .logo-accent {
              color: #FF3B30;
            }
            .email-content {
              padding: 40px 30px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #0B1220;
              margin-bottom: 16px;
              line-height: 1.3;
            }
            .title-highlight {
              color: #FF3B30;
            }
            .text {
              font-size: 16px;
              color: #5E6573;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            .button-wrapper {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #FF3B30;
              color: #FFFFFF !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            }
            .button:hover {
              background-color: #E6342A;
            }
            .footer {
              padding: 30px;
              background-color: #F7F7F9;
              text-align: center;
              font-size: 14px;
              color: #5E6573;
              line-height: 1.6;
            }
            .footer-link {
              color: #FF3B30;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <div class="logo">Vir<span class="logo-accent">idial</span></div>
            </div>
            <div class="email-content">
              <h1 class="title">Réinitialisation de votre <span class="title-highlight">mot de passe</span></h1>
              <p class="text">
                Vous avez demandé la réinitialisation de votre mot de passe. Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe.
              </p>
              <p class="text">
                Ce lien est valide pendant <strong>1 heure</strong>. Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.
              </p>
              <div class="button-wrapper">
                <a href="${resetUrl}" class="button">Réinitialiser mon mot de passe</a>
              </div>
              <p class="text" style="font-size: 14px; color: #8B92A5;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${resetUrl}" style="color: #FF3B30; word-break: break-all;">${resetUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé par Viridial</p>
              <p>
                <a href="${frontendUrl}" class="footer-link">Viridial</a> |
                <a href="${frontendUrl}/support" class="footer-link">Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de réinitialisation:', error);
      throw error;
    }
  }

  /**
   * Envoyer un email de vérification d'email
   */
  async sendVerificationEmail(email: string, verificationToken: string): Promise<void> {
    // Production: HTTPS, Development: HTTP localhost
    const frontendUrl = process.env.FRONTEND_URL || (process.env.NODE_ENV === 'production' ? 'https://viridial.com' : 'http://localhost:3000');
    const verifyUrl = `${frontendUrl}/verify-email?token=${verificationToken}`;

    const fromName = process.env.FROM_NAME || 'Viridial Support';
    const fromEmail = process.env.EMAIL_FROM || 'support@viridial.com';

    const mailOptions = {
      from: `"${fromName}" <${fromEmail}>`,
      to: email,
      subject: 'Vérifiez votre adresse email - Viridial',
      html: `
        <!DOCTYPE html>
        <html lang="fr">
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="IE=edge">
          <title>Vérification d'email - Viridial</title>
          <style>
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #0B1220;
              background-color: #F7F7F9;
              padding: 40px 20px;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              background-color: #FFFFFF;
              border-radius: 12px;
              overflow: hidden;
              box-shadow: 0 4px 12px rgba(11, 18, 32, 0.08);
            }
            .email-header {
              text-align: center;
              padding: 40px 30px 30px;
              border-bottom: 1px solid #E6E7EA;
            }
            .logo {
              font-size: 28px;
              font-weight: 700;
              color: #0B1220;
              letter-spacing: -0.5px;
              margin-bottom: 10px;
            }
            .logo-accent {
              color: #FF3B30;
            }
            .email-content {
              padding: 40px 30px;
            }
            .title {
              font-size: 24px;
              font-weight: 600;
              color: #0B1220;
              margin-bottom: 16px;
              line-height: 1.3;
            }
            .title-highlight {
              color: #FF3B30;
            }
            .text {
              font-size: 16px;
              color: #5E6573;
              margin-bottom: 24px;
              line-height: 1.6;
            }
            .button-wrapper {
              text-align: center;
              margin: 32px 0;
            }
            .button {
              display: inline-block;
              padding: 14px 32px;
              background-color: #FF3B30;
              color: #FFFFFF !important;
              text-decoration: none;
              border-radius: 8px;
              font-weight: 600;
              font-size: 16px;
            }
            .button:hover {
              background-color: #E6342A;
            }
            .footer {
              padding: 30px;
              background-color: #F7F7F9;
              text-align: center;
              font-size: 14px;
              color: #5E6573;
              line-height: 1.6;
            }
            .footer-link {
              color: #FF3B30;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="email-header">
              <div class="logo">Vir<span class="logo-accent">idial</span></div>
            </div>
            <div class="email-content">
              <h1 class="title">Vérifiez votre <span class="title-highlight">adresse email</span></h1>
              <p class="text">
                Bienvenue sur Viridial ! Veuillez vérifier votre adresse email en cliquant sur le bouton ci-dessous.
              </p>
              <p class="text">
                Ce lien est valide pendant <strong>24 heures</strong>.
              </p>
              <div class="button-wrapper">
                <a href="${verifyUrl}" class="button">Vérifier mon email</a>
              </div>
              <p class="text" style="font-size: 14px; color: #8B92A5;">
                Si le bouton ne fonctionne pas, copiez et collez ce lien dans votre navigateur :<br>
                <a href="${verifyUrl}" style="color: #FF3B30; word-break: break-all;">${verifyUrl}</a>
              </p>
            </div>
            <div class="footer">
              <p>Cet email a été envoyé par Viridial</p>
              <p>
                <a href="${frontendUrl}" class="footer-link">Viridial</a> |
                <a href="${frontendUrl}/support" class="footer-link">Support</a>
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
    };

    try {
      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      console.error('Erreur lors de l\'envoi de l\'email de vérification:', error);
      throw error;
    }
  }
}

