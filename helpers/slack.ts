import axios from 'axios';

/**
 * Envía una notificación a Slack usando un webhook URL.
 * @param message - Mensaje a enviar
 */
export async function sendSlackNotification(message: string) {
  const webhookUrl = 'https://hooks.slack.com/services/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';

  try {
    await axios.post(webhookUrl, {
      text: message, // Mensaje a enviar
    });
  } catch (error) {
    console.error('Error enviando notificación a Slack:', error);
    throw new Error('No se pudo enviar la notificación a Slack');
  }
}
