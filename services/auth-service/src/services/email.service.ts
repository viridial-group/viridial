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
    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
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
              background: linear-gradient(120deg, #FF3B30 0%, #FF6B60 100%);
              -webkit-background-clip: text;
              -webkit-text-fill-color: transparent;
              background-clip: text;
              display: inline;
            }
            .greeting {
              font-size: 16px;
              color: #0B1220;
              margin-bottom: 20px;
            }
            .message {
              font-size: 15px;
              color: #6B7280;
              margin-bottom: 30px;
              line-height: 1.7;
            }
            .message-highlight {
              color: #0B1220;
              font-weight: 500;
            }
            .cta-section {
              text-align: center;
              margin: 35px 0;
            }
            .cta-button {
              display: inline-flex;
              align-items: center;
              gap: 10px;
              background-color: #0B1220;
              color: #FFFFFF;
              text-decoration: none;
              padding: 14px 28px;
              border-radius: 8px;
              font-size: 15px;
              font-weight: 500;
              transition: opacity 0.2s;
              box-shadow: 0 2px 8px rgba(11, 18, 32, 0.15);
            }
            .cta-button:hover {
              opacity: 0.9;
            }
            .cta-icon {
              font-size: 18px;
            }
            .link-fallback {
              margin-top: 20px;
              padding: 15px;
              background-color: #F7F7F9;
              border-radius: 8px;
              border: 1px solid #E6E7EA;
            }
            .link-fallback-text {
              font-size: 12px;
              color: #6B7280;
              margin-bottom: 8px;
            }
            .link-fallback-url {
              font-size: 11px;
              color: #0B1220;
              word-break: break-all;
              font-family: 'Courier New', monospace;
            }
            .expiry-notice {
              margin-top: 25px;
              padding: 12px 16px;
              background-color: #FFF4E6;
              border-left: 3px solid #F59E0B;
              border-radius: 6px;
            }
            .expiry-notice-text {
              font-size: 13px;
              color: #92400E;
              line-height: 1.5;
            }
            .security-notice {
              margin-top: 20px;
              padding: 12px 16px;
              background-color: #F0F9FF;
              border-left: 3px solid #0EA5E9;
              border-radius: 6px;
            }
            .security-notice-text {
              font-size: 13px;
              color: #0C4A6E;
              line-height: 1.5;
            }
            .encouragement {
              margin-top: 30px;
              font-size: 15px;
              color: #0B1220;
              font-style: italic;
              text-align: center;
              padding: 20px;
              background-color: #F7F7F9;
              border-radius: 8px;
            }
            .email-footer {
              margin-top: 40px;
              padding-top: 30px;
              border-top: 1px solid #E6E7EA;
              text-align: center;
            }
            .support-message {
              font-size: 14px;
              color: #6B7280;
              margin-bottom: 20px;
              line-height: 1.6;
            }
            .support-link {
              color: #FF3B30;
              text-decoration: none;
            }
            .support-link:hover {
              text-decoration: underline;
            }
            .footer-text {
              font-size: 12px;
              color: #9AA0A6;
              margin-top: 20px;
              line-height: 1.5;
            }
            @media only screen and (max-width: 600px) {
              body {
                padding: 20px 10px;
              }
              .email-content {
                padding: 30px 20px;
              }
              .title {
                font-size: 20px;
              }
              .cta-button {
                padding: 12px 24px;
                font-size: 14px;
              }
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <!-- Header with Logo -->
            <div class="email-header">
              <div class="logo">
                <span class="logo-accent">V</span>iridial
              </div>
            </div>

            <!-- Main Content -->
            <div class="email-content">
              <h1 class="title">
                Réinitialisation de votre <span class="title-highlight">mot de passe</span>
              </h1>

              <p class="greeting">Bonjour,</p>

              <p class="message">
                Vous avez demandé à réinitialiser votre mot de passe pour votre compte <span class="message-highlight">Viridial</span>.
              </p>

              <p class="message">
                Cliquez sur le bouton ci-dessous pour créer un nouveau mot de passe sécurisé :
              </p>

              <!-- CTA Button -->
              <div class="cta-section">
                <a href="${resetUrl}" class="cta-button">
                  <span class="cta-icon">🔐</span>
                  Réinitialiser mon mot de passe
                </a>
              </div>

              <!-- Link Fallback -->
              <div class="link-fallback">
                <p class="link-fallback-text">Ou copiez ce lien dans votre navigateur :</p>
                <p class="link-fallback-url">${resetUrl}</p>
              </div>

              <!-- Expiry Notice -->
              <div class="expiry-notice">
                <p class="expiry-notice-text">
                  <strong>⏰ Important :</strong> Ce lien expirera dans <strong>1 heure</strong> pour votre sécurité.
                </p>
              </div>

              <!-- Security Notice -->
              <div class="security-notice">
                <p class="security-notice-text">
                  <strong>🔒 Sécurité :</strong> Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité. Votre compte reste protégé.
                </p>
              </div>

              <!-- Encouragement -->
              <div class="encouragement">
                "Votre sécurité est notre priorité — retrouvez rapidement l'accès à votre compte."
              </div>
            </div>

            <!-- Footer -->
            <div class="email-footer">
              <p class="support-message">
                Besoin d'aide ? <a href="mailto:${fromEmail}" class="support-link">Répondez à cet email</a> et nous serons ravis de vous assister.
              </p>
              <p class="footer-text">
                Cordialement,<br>
                <strong>L'équipe Viridial</strong><br><br>
                Cet email a été envoyé automatiquement, merci de ne pas y répondre directement.
              </p>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
        Réinitialisation de votre mot de passe - Viridial
        
        Bonjour,
        
        Vous avez demandé à réinitialiser votre mot de passe pour votre compte Viridial.
        
        Cliquez sur ce lien pour créer un nouveau mot de passe :
        ${resetUrl}
        
        Ce lien expirera dans 1 heure.
        
        Si vous n'avez pas demandé cette réinitialisation, vous pouvez ignorer cet email en toute sécurité.
        
        Cordialement,
        L'équipe Viridial
      `,
    };

    try {
      // Vérifier que les credentials SMTP sont configurés
      if (!process.env.SMTP_USER && !process.env.EMAIL_FROM) {
        throw new Error('SMTP_USER ou EMAIL_FROM non configuré');
      }
      if (!process.env.SMTP_PASS) {
        throw new Error('SMTP_PASS non configuré');
      }

      await this.transporter.sendMail(mailOptions);
    } catch (error: any) {
      console.error('Erreur lors de l\'envoi de l\'email:', error);
      
      // Erreur plus descriptive selon le type
      if (error.code === 'EAUTH' || error.message?.includes('credentials')) {
        throw new Error('Configuration SMTP invalide. Vérifiez SMTP_USER et SMTP_PASS dans les variables d\'environnement.');
      }
      
      throw new Error(`Impossible d'envoyer l'email de réinitialisation: ${error.message || error}`);
    }
  }

  /**
   * Vérifier la configuration SMTP
   */
  async verifyConnection(): Promise<boolean> {
    try {
      await this.transporter.verify();
      return true;
    } catch (error) {
      console.error('Erreur de vérification SMTP:', error);
      return false;
    }
  }
}
