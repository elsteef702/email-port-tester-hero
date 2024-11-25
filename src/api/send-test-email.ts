import nodemailer from 'nodemailer';

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { server, port, from, to, username, password } = req.body;

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

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}