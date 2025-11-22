export const emailTemplates = {
  welcome: (customerName: string) => ({
    subject: 'Hoş Geldiniz!',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .button { display: inline-block; padding: 12px 24px; background-color: #3b82f6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Hoş Geldiniz!</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${customerName},</h2>
              <p>Sistemimize hoş geldiniz! Size hizmet vermekten mutluluk duyuyoruz.</p>
              <p>Bizimle çalışmayı tercih ettiğiniz için teşekkür ederiz. Herhangi bir sorunuz olursa lütfen bize ulaşın.</p>
              <a href="#" class="button">İletişime Geçin</a>
            </div>
            <div class="footer">
              <p>&copy; 2024 CRM Sistemi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  followUp: (customerName: string, message: string) => ({
    subject: 'Takip - CRM Sistemi',
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .message { background-color: white; padding: 20px; border-left: 4px solid #10b981; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Takip Mesajı</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${customerName},</h2>
              <p>Size ulaşmak istedik.</p>
              <div class="message">
                ${message}
              </div>
              <p>En kısa sürede size dönüş yapmayı bekliyoruz.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CRM Sistemi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  dealProposal: (customerName: string, dealTitle: string, dealValue: string) => ({
    subject: `Teklif: ${dealTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #8b5cf6; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .deal-box { background-color: white; padding: 20px; border-radius: 5px; margin: 20px 0; text-align: center; }
            .deal-value { font-size: 32px; font-weight: bold; color: #8b5cf6; }
            .button { display: inline-block; padding: 12px 24px; background-color: #8b5cf6; color: white; text-decoration: none; border-radius: 5px; margin-top: 20px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>📋 Yeni Teklif</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${customerName},</h2>
              <p>Size özel bir teklifimiz var!</p>
              <div class="deal-box">
                <h3>${dealTitle}</h3>
                <div class="deal-value">${dealValue}</div>
              </div>
              <p>Teklifimiz hakkında detaylı bilgi almak için bizimle iletişime geçebilirsiniz.</p>
              <a href="#" class="button">Teklifi İncele</a>
            </div>
            <div class="footer">
              <p>&copy; 2024 CRM Sistemi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  taskReminder: (customerName: string, taskTitle: string, dueDate: string) => ({
    subject: `Hatırlatma: ${taskTitle}`,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #f59e0b; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .task-box { background-color: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>⏰ Görev Hatırlatması</h1>
            </div>
            <div class="content">
              <h2>Merhaba ${customerName},</h2>
              <p>Sizinle ilgili bir görevimiz yaklaşıyor:</p>
              <div class="task-box">
                <h3>${taskTitle}</h3>
                <p><strong>Son Tarih:</strong> ${dueDate}</p>
              </div>
              <p>Bu konu hakkında sizinle iletişime geçeceğiz.</p>
            </div>
            <div class="footer">
              <p>&copy; 2024 CRM Sistemi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),

  custom: (subject: string, content: string) => ({
    subject,
    html: `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #6366f1; color: white; padding: 20px; text-align: center; border-radius: 5px 5px 0 0; }
            .content { background-color: #f9fafb; padding: 30px; border-radius: 0 0 5px 5px; }
            .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>CRM Sistemi</h1>
            </div>
            <div class="content">
              ${content}
            </div>
            <div class="footer">
              <p>&copy; 2024 CRM Sistemi. Tüm hakları saklıdır.</p>
            </div>
          </div>
        </body>
      </html>
    `,
  }),
}