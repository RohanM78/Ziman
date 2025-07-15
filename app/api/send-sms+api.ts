export async function POST(request: Request) {
  try {
    const { to, message } = await request.json();

    if (!to || !message) {
      return new Response('Missing required fields: to, message', {
        status: 400,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Twilio configuration
    const accountSid = process.env.EXPO_PUBLIC_TWILIO_ACCOUNT_SID;
    const authToken = process.env.EXPO_PUBLIC_TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.EXPO_PUBLIC_TWILIO_PHONE_NUMBER;

    if (!accountSid || !authToken || !fromNumber) {
      console.error('Twilio configuration missing');
      return new Response('SMS service configuration error', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    // Create Twilio client
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`;
    const credentials = Buffer.from(`${accountSid}:${authToken}`).toString('base64');

    const response = await fetch(twilioUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To: to,
        From: fromNumber,
        Body: message,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Twilio API error:', errorText);
      return new Response('Failed to send SMS', {
        status: 500,
        headers: { 'Content-Type': 'text/plain' },
      });
    }

    const result = await response.json();
    
    return Response.json({
      success: true,
      messageId: result.sid,
      status: result.status,
    });

  } catch (error) {
    console.error('SMS API error:', error);
    return new Response('Internal server error', {
      status: 500,
      headers: { 'Content-Type': 'text/plain' },
    });
  }
}