async function notifyProbuyerApiKeyRevoked(payload) {
  const webhookUrl = process.env.PROBUYER_UNLINK_WEBHOOK_URL;
  if (!webhookUrl) {
    return;
  }

  const secret = process.env.PROBUYER_UNLINK_WEBHOOK_SECRET;
  const headers = {
    'Content-Type': 'application/json',
  };

  if (secret) {
    headers['x-probuyer-secret'] = secret;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        event: 'imeicheck2.api_key.revoked',
        triggered_at: new Date().toISOString(),
        ...payload,
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      console.error(`Probuyer unlink notification failed (${response.status}): ${body}`);
    }
  } catch (error) {
    console.error('Probuyer unlink notification error:', error.message || error);
  }
}

module.exports = {
  notifyProbuyerApiKeyRevoked,
};