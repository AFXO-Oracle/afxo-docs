/**
 * AFXO JavaScript SDK - Basic Usage Examples
 *
 * Install: npm install @afxo/sdk
 */

// ============ REST API Examples ============

// Using fetch (no SDK required)
async function getRate(base, quote, apiKey) {
  const response = await fetch(
    `https://api.afxo.ai/v1/rates/${base}/${quote}`,
    {
      headers: {
        'X-API-Key': apiKey,
      },
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  return response.json();
}

// Example usage
async function main() {
  const apiKey = process.env.AFXO_API_KEY;

  // Get KES/USD rate
  const kesRate = await getRate('KES', 'USD', apiKey);
  console.log('KES/USD Rate:', kesRate.rate);
  console.log('Confidence:', kesRate.confidence);
  console.log('Sources:', kesRate.sources);

  // Get multiple rates
  const pairs = ['KES/USD', 'NGN/USD', 'GHS/USD'];
  const response = await fetch(
    `https://api.afxo.ai/v1/rates/batch?pairs=${pairs.join(',')}`,
    {
      headers: { 'X-API-Key': apiKey },
    }
  );
  const batchRates = await response.json();

  for (const rate of batchRates.rates) {
    console.log(`${rate.pair}: ${rate.rate} (confidence: ${rate.confidence})`);
  }
}

main().catch(console.error);

// ============ WebSocket Example ============

function subscribeToRates(apiKey, pairs, onUpdate) {
  const ws = new WebSocket('wss://api.afxo.ai/v1/ws');

  ws.onopen = () => {
    // Authenticate
    ws.send(JSON.stringify({ type: 'auth', apiKey }));

    // Subscribe to pairs
    ws.send(JSON.stringify({ type: 'subscribe', pairs }));
  };

  ws.onmessage = (event) => {
    const data = JSON.parse(event.data);

    switch (data.type) {
      case 'rate':
        onUpdate(data);
        break;
      case 'error':
        console.error('WebSocket error:', data.message);
        break;
      case 'heartbeat':
        // Keep-alive, no action needed
        break;
    }
  };

  ws.onerror = (error) => {
    console.error('WebSocket error:', error);
  };

  return ws;
}

// WebSocket usage
// const ws = subscribeToRates(
//   process.env.AFXO_API_KEY,
//   ['KES/USD', 'NGN/USD'],
//   (update) => {
//     console.log(`${update.pair} updated: ${update.rate}`);
//   }
// );
