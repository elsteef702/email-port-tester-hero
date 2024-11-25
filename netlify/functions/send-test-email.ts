import { Handler } from '@netlify/functions';
import nodemailer from 'nodemailer';

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  const { server, port, from, to, username, password } = JSON.parse(event.body || '{}');

  try {
    const transporter = nodemailer.createTransport({
      host: server,
      port: port,
      secure: port === 465,
      auth: {
        user: username,
        pass: password,
      },
    });

    await transporter.sendMail({
      from: from,
      to: to,
      subject: 'SMTP Test Email',
      text: 'This is a test email to verify SMTP configuration.',
      html: '<p>This is a test email to verify SMTP configuration.</p>',
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true }),
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
}