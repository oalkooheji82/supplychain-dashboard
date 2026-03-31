exports.handler = async (event, context) => {
  const clientId = process.env.AZURE_CLIENT_ID;
  const clientSecret = process.env.AZURE_CLIENT_SECRET;
  const tenantId = process.env.AZURE_TENANT_ID;

  // Get app-only token via client credentials
  const tokenRes = await fetch(
    `https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
        scope: 'https://graph.microsoft.com/.default',
      }).toString(),
    }
  );

  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return { statusCode: 401, body: JSON.stringify({
      error: 'Auth failed',
      details: tokenData,
      client_id_set: !!clientId,
      secret_set: !!clientSecret,
      tenant_set: !!tenantId
    })};
  }

  // Fetch Excel file from OneDrive
  const graphUrl =
    'https://graph.microsoft.com/v1.0/users/omar@ajmkooheji.com/drive/root:' +
    '/AJMK%20Main/Supply%20Chain%20%26%20OB/Supply%20Chain%20Dashboard/Dashboard/SC_Dashboard_Input.xlsx' +
    ':/content';

  const fileRes = await fetch(graphUrl, {
    headers: { Authorization: `Bearer ${tokenData.access_token}` },
    redirect: 'follow',
  });

  if (!fileRes.ok) {
    const errText = await fileRes.text();
    return { statusCode: fileRes.status, body: errText };
  }

  const buffer = await fileRes.arrayBuffer();
  const base64 = Buffer.from(buffer).toString('base64');

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      'Access-Control-Allow-Origin': '*',
    },
    body: base64,
    isBase64Encoded: true,
  };
};
