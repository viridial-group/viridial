import { Controller, Get, Param, Query, Res, Req } from '@nestjs/common';
import { EmailService } from '../services/email.service';
import { Response } from 'express';

@Controller('marketing/track')
export class TrackingController {
  constructor(private readonly emailService: EmailService) {}

  /**
   * Track l'ouverture d'un email (pixel de tracking)
   */
  @Get('open/:trackingId')
  async trackOpen(@Param('trackingId') trackingId: string, @Res() res: Response) {
    await this.emailService.trackEmailOpen(trackingId);

    // Retourner un pixel transparent 1x1
    const pixel = Buffer.from(
      'R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7',
      'base64',
    );
    res.set({
      'Content-Type': 'image/gif',
      'Content-Length': pixel.length,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      Pragma: 'no-cache',
      Expires: '0',
    });
    res.send(pixel);
  }

  /**
   * Track le clic sur un lien
   */
  @Get('click/:trackingId')
  async trackClick(
    @Param('trackingId') trackingId: string,
    @Query('url') url: string,
    @Res() res: Response,
  ) {
    await this.emailService.trackEmailClick(trackingId, url);

    // Rediriger vers l'URL originale
    res.redirect(url || '/');
  }

  /**
   * Désabonnement
   */
  @Get('unsubscribe/:leadId')
  async unsubscribe(@Param('leadId') leadId: string, @Res() res: Response) {
    await this.emailService.unsubscribe(leadId);

    // Retourner une page de confirmation
    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Désabonnement réussi</title>
        <meta charset="utf-8">
        <style>
          body { font-family: Arial, sans-serif; text-align: center; padding: 50px; }
          .container { max-width: 500px; margin: 0 auto; }
          .success { color: green; font-size: 24px; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="success">✓</div>
          <h1>Vous avez été désabonné avec succès</h1>
          <p>Vous ne recevrez plus d'emails de notre part.</p>
          <p>Merci de nous avoir accompagnés.</p>
        </div>
      </body>
      </html>
    `);
  }
}

