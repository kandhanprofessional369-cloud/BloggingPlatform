import { BrevoClient } from '@getbrevo/brevo';

const sendEmail = async (options) => {
  try {
    const brevo = new BrevoClient({
      apiKey: process.env.BREVO_API_KEY,
    });

    const response = await brevo.transactionalEmails.sendTransacEmail({
      sender: {
        name: process.env.BREVO_SENDER_NAME,
        email: process.env.BREVO_SENDER_EMAIL,
      },
      to: [
        {
          email: options.to,
        },
      ],
      subject: options.subject,
      htmlContent: options.html,
    });

    console.log('Email sent successfully:', response.messageId);

    return response;
  } catch (error) {
    console.error(
      'Brevo email error:',
      error?.response?.body || error.message
    );

    throw error;
  }
};

export default sendEmail;