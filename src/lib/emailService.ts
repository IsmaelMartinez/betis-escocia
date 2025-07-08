// Email notification service for admin alerts
// This service sends notifications when new RSVPs or contacts are submitted

interface EmailNotification {
  type: 'rsvp' | 'contact';
  data: any;
  timestamp: string;
}

interface RSVPEmailData {
  name: string;
  email: string;
  attendees: number;
  matchDate: string;
  message?: string;
  whatsappInterest: boolean;
}

interface ContactEmailData {
  name: string;
  email: string;
  phone?: string;
  type: string;
  subject: string;
  message: string;
}

class EmailService {
  private adminEmail: string;
  private fromEmail: string;
  private apiKey?: string;
  
  constructor() {
    this.adminEmail = process.env.ADMIN_EMAIL || 'admin@betis-escocia.com';
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@betis-escocia.com';
    this.apiKey = process.env.EMAIL_API_KEY;
  }

  private formatRSVPEmail(data: RSVPEmailData): { subject: string; html: string; text: string } {
    const subject = `🎉 Nuevo RSVP: ${data.name} (${data.attendees} asistentes)`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #00A651; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Nuevo RSVP - Peña Bética Escocesa</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #00A651; margin-top: 0;">Detalles del RSVP</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <strong>Nombre:</strong> ${data.name}<br>
            <strong>Email:</strong> ${data.email}<br>
            <strong>Número de asistentes:</strong> ${data.attendees}<br>
            <strong>Fecha del partido:</strong> ${new Date(data.matchDate).toLocaleDateString('es-ES')}<br>
            <strong>Interés en WhatsApp:</strong> ${data.whatsappInterest ? 'Sí' : 'No'}
          </div>
          
          ${data.message ? `
            <div style="background: white; padding: 15px; border-radius: 8px;">
              <strong>Mensaje:</strong><br>
              <em>"${data.message}"</em>
            </div>
          ` : ''}
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #008542;">
              💡 <strong>Acción requerida:</strong> Puedes ver todos los RSVPs en el 
              <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color: #00A651;">panel de administración</a>.
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: #ccc; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Peña Bética Escocesa - No busques más que no hay</p>
          <p style="margin: 0;">Este es un email automático del sistema RSVP</p>
        </div>
      </div>
    `;

    const text = `
Nuevo RSVP - Peña Bética Escocesa

Detalles del RSVP:
- Nombre: ${data.name}
- Email: ${data.email}
- Asistentes: ${data.attendees}
- Fecha del partido: ${new Date(data.matchDate).toLocaleDateString('es-ES')}
- Interés en WhatsApp: ${data.whatsappInterest ? 'Sí' : 'No'}
${data.message ? `- Mensaje: "${data.message}"` : ''}

Puedes ver todos los RSVPs en el panel de administración: ${process.env.NEXT_PUBLIC_SITE_URL}/admin

---
Peña Bética Escocesa - No busques más que no hay
    `;

    return { subject, html, text };
  }

  private formatContactEmail(data: ContactEmailData): { subject: string; html: string; text: string } {
    const subject = `📧 Nuevo contacto: ${data.subject}`;
    
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <div style="background: #00A651; color: white; padding: 20px; text-align: center;">
          <h1 style="margin: 0;">📧 Nuevo Contacto - Peña Bética Escocesa</h1>
        </div>
        
        <div style="padding: 20px; background: #f9f9f9;">
          <h2 style="color: #00A651; margin-top: 0;">Detalles del Contacto</h2>
          
          <div style="background: white; padding: 15px; border-radius: 8px; margin-bottom: 15px;">
            <strong>Nombre:</strong> ${data.name}<br>
            <strong>Email:</strong> ${data.email}<br>
            ${data.phone ? `<strong>Teléfono:</strong> ${data.phone}<br>` : ''}
            <strong>Tipo:</strong> ${data.type}<br>
            <strong>Asunto:</strong> ${data.subject}
          </div>
          
          <div style="background: white; padding: 15px; border-radius: 8px;">
            <strong>Mensaje:</strong><br>
            <div style="padding: 10px; background: #f5f5f5; border-radius: 4px; margin-top: 8px;">
              ${data.message.replace(/\n/g, '<br>')}
            </div>
          </div>
          
          <div style="margin-top: 20px; padding: 15px; background: #e8f5e8; border-radius: 8px;">
            <p style="margin: 0; color: #008542;">
              💡 <strong>Acción requerida:</strong> Puedes responder directamente a ${data.email} o 
              ver todos los contactos en el <a href="${process.env.NEXT_PUBLIC_SITE_URL}/admin" style="color: #00A651;">panel de administración</a>.
            </p>
          </div>
        </div>
        
        <div style="background: #333; color: #ccc; padding: 15px; text-align: center; font-size: 12px;">
          <p style="margin: 0;">Peña Bética Escocesa - No busques más que no hay</p>
          <p style="margin: 0;">Este es un email automático del sistema de contacto</p>
        </div>
      </div>
    `;

    const text = `
Nuevo Contacto - Peña Bética Escocesa

Detalles del Contacto:
- Nombre: ${data.name}
- Email: ${data.email}
${data.phone ? `- Teléfono: ${data.phone}` : ''}
- Tipo: ${data.type}
- Asunto: ${data.subject}

Mensaje:
${data.message}

Puedes responder directamente a ${data.email} o ver todos los contactos en el panel de administración: ${process.env.NEXT_PUBLIC_SITE_URL}/admin

---
Peña Bética Escocesa - No busques más que no hay
    `;

    return { subject, html, text };
  }

  async sendRSVPNotification(data: RSVPEmailData): Promise<boolean> {
    if (!this.apiKey) {
      console.log('Email notifications disabled: No API key configured');
      return false;
    }

    try {
      const { subject, html, text } = this.formatRSVPEmail(data);
      
      // Using Resend API (you can replace with SendGrid or other service)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: this.adminEmail,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      console.log('RSVP notification email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send RSVP notification email:', error);
      return false;
    }
  }

  async sendContactNotification(data: ContactEmailData): Promise<boolean> {
    if (!this.apiKey) {
      console.log('Email notifications disabled: No API key configured');
      return false;
    }

    try {
      const { subject, html, text } = this.formatContactEmail(data);
      
      // Using Resend API (you can replace with SendGrid or other service)
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: this.fromEmail,
          to: this.adminEmail,
          subject,
          html,
          text,
        }),
      });

      if (!response.ok) {
        throw new Error(`Email API error: ${response.status}`);
      }

      console.log('Contact notification email sent successfully');
      return true;
    } catch (error) {
      console.error('Failed to send contact notification email:', error);
      return false;
    }
  }

  // Test email functionality (useful for setup verification)
  async sendTestEmail(): Promise<boolean> {
    const testData: ContactEmailData = {
      name: 'Sistema de Prueba',
      email: 'test@betis-escocia.com',
      type: 'test',
      subject: 'Prueba del Sistema de Notificaciones',
      message: 'Este es un email de prueba para verificar que las notificaciones están funcionando correctamente.',
    };

    return this.sendContactNotification(testData);
  }
}

// Export singleton instance
export const emailService = new EmailService();

// Export types for use in API routes
export type { RSVPEmailData, ContactEmailData };
