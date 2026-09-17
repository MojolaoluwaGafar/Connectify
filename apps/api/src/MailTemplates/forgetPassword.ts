export function ForgetPassWordTemplate(firstName: string, resetCode: string): string {
  return `
  <!DOCTYPE html>
  <html>
    <head>
      <meta charset="UTF-8" />
      <title>Verification Code</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 2px 4px rgba(0,0,0,0.1);
        }
        h2 {
          color: #333333;
        }
        .code-box {
          font-size: 24px;
          font-weight: bold;
          color: #2c3e50;
          background: #eaf2f8;
          padding: 15px;
          text-align: center;
          border-radius: 6px;
          margin: 20px 0;
          letter-spacing: 4px;
        }
        p {
          color: #555555;
          line-height: 1.5;
        }
        .footer {
          font-size: 12px;
          color: #999999;
          margin-top: 20px;
          text-align: center;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h2>Hello ${firstName},</h2>
        <p>We received a request to reset the password for your <strong>Connectify</strong> account <br> Your password reset code is:</p>
        <div class="code-box">${resetCode}</div>
        <p>This code will expire in <strong>10 minutes</strong>. If you did not request this, you can safely ignore this email. Your password will remain unchanged.</p>
        <p>Best regards,<br/>The Connectify Team</p>
        <div class="footer">
          &copy; ${new Date().getFullYear()} Connectify. All rights reserved.
        </div>
      </div>
    </body>
  </html>
  `;
}