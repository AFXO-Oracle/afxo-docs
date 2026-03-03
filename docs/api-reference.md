# AFXO API Reference

Base URL: `https://api.afxo.ai/v1`

## Authentication

All API requests require an API key passed in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_api_key" https://api.afxo.ai/v1/rates/KES/USD
```

Get your API key at [afxo.ai/get-access](https://afxo.ai/get-access).

---

## FX Oracle Endpoints

### Get Current Rate

```
GET /v1/rates/{currency}/{baseCurrency}
```

Returns the current exchange rate for a currency pair with confidence scoring and source breakdown.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `currency` | string | Quote currency code (e.g., `KES`) |
| `baseCurrency` | string | Base currency code (e.g., `USD`) |

**Example**

```bash
curl "https://api.afxo.ai/v1/rates/KES/USD" -H "X-API-Key: your_api_key"
```

**Response**

```json
{
  "quoteCurrency": "KES",
  "baseCurrency": "USD",
  "rate": 129.87,
  "confidence": 94,
  "timestamp": "2026-03-03T12:00:00Z",
  "sources": [
    {
      "sourceId": "fastforex",
      "rate": 129.85,
      "weight": 0.25,
      "included": true
    },
    {
      "sourceId": "xe",
      "rate": 129.90,
      "weight": 0.18,
      "included": true
    }
  ],
  "metadata": {
    "confidenceFactors": {
      "sourceQuality": 0.95,
      "agreement": 0.92,
      "consistency": 0.96,
      "freshness": 0.94
    },
    "antiCircularity": {
      "passed": true,
      "externalSourceCount": 6,
      "dexWeight": 0
    },
    "statistics": {
      "median": 129.87,
      "stdDev": 0.12,
      "coefficientOfVariation": 0.0009
    },
    "totalSources": 7
  }
}
```

---

### Get Multiple Rates (Batch)

```
GET /v1/rates/batch?pairs={pairs}
```

Returns rates for multiple currency pairs in a single request.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `pairs` | string | Comma-separated pairs (e.g., `KES/USD,NGN/USD,GHS/USD`) |

**Example**

```bash
curl "https://api.afxo.ai/v1/rates/batch?pairs=KES/USD,NGN/USD,GHS/USD" \
  -H "X-API-Key: your_api_key"
```

**Response**

```json
{
  "success": true,
  "data": {
    "rates": [
      {
        "pair": "KES/USD",
        "rate": 129.87,
        "confidence": 94,
        "sources": 6,
        "timestamp": "2026-03-03T12:00:00Z"
      },
      {
        "pair": "NGN/USD",
        "rate": 1580.50,
        "confidence": 91,
        "sources": 5,
        "timestamp": "2026-03-03T12:00:00Z"
      }
    ],
    "requestedAt": "2026-03-03T12:00:01Z"
  }
}
```

**Limits**: Maximum 20 pairs per batch request.

---

### Get Historical Rates

```
GET /v1/rates/{currency}/{baseCurrency}/history
```

Returns historical rate data with configurable time period and aggregation interval.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `period` | string | `24h` | Time period: `1h`, `6h`, `12h`, `24h`, `7d`, `30d`, `90d`, `365d` |
| `interval` | string | `raw` | Aggregation: `raw`, `hourly`, `daily` |

**Example**

```bash
curl "https://api.afxo.ai/v1/rates/KES/USD/history?period=7d&interval=daily" \
  -H "X-API-Key: your_api_key"
```

**Response (raw interval)**

```json
{
  "success": true,
  "data": {
    "pair": "KES/USD",
    "period": "24h",
    "interval": "raw",
    "count": 288,
    "rates": [
      {
        "time": "2026-03-02T12:00:00Z",
        "rate": 129.82,
        "confidence": 93
      }
    ]
  }
}
```

**Response (daily interval)**

```json
{
  "success": true,
  "data": {
    "pair": "KES/USD",
    "period": "7d",
    "interval": "daily",
    "count": 7,
    "rates": [
      {
        "time": "2026-02-25",
        "open": 129.68,
        "high": 130.12,
        "low": 129.45,
        "close": 129.87,
        "avgConfidence": 92,
        "dataPoints": 288
      }
    ]
  }
}
```

---

### Get Market Intelligence

```
GET /v1/rates/{currency}/{baseCurrency}/intelligence
```

Returns market intelligence including volatility analysis, momentum indicators, and statistical measures.

**Response**

```json
{
  "success": true,
  "data": {
    "currency": "KES",
    "baseCurrency": "USD",
    "volatility": {
      "realized7d": 8.2,
      "realized30d": 12.4,
      "regime": "NORMAL"
    },
    "momentum": {
      "direction": "STABLE",
      "roc7d": -0.8,
      "twap24h": 129.90
    },
    "statistics": {
      "zScore": -0.8,
      "bollingerPosition": 32,
      "classification": "WITHIN_NORM"
    }
  }
}
```

---

### Get EIP-712 Signed Rate

```
GET /v1/signed/{baseCurrency}/{quoteCurrency}/signed
```

Returns a cryptographically signed price feed using EIP-712 typed data signatures. Designed for on-chain consumption by smart contracts.

See [Signed Price Feeds v2](signed-price-feeds-v2.md) for detailed specification.

**Query Parameters**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `chainId` | number | 43114 | Target chain ID |
| `validity` | number | 300 | Signature validity in seconds |

**Response**

```json
{
  "success": true,
  "version": "2.0.0",
  "feed": {
    "feedId": "0x...",
    "pair": "USD/KES",
    "price": "12987000000",
    "decimals": 8,
    "confidence": 9400,
    "sourceCount": 6,
    "timestamp": 1709474400,
    "validUntil": 1709474700,
    "round": 12345,
    "chainId": 43114,
    "aggregationHash": "0x..."
  },
  "signature": "0x...",
  "signer": "0x..."
}
```

---

### Get Supported Currencies

```
GET /v1/currencies
```

Returns list of all supported currencies. **No authentication required.**

**Response**

```json
{
  "success": true,
  "data": {
    "baseCurrency": "USD",
    "currencies": ["KES", "NGN", "GHS", "ZAR", "EGP", "..."],
    "pairs": ["USD/KES", "USD/NGN", "..."],
    "count": 79
  }
}
```

---

### Get System Status

```
GET /v1/status
```

Returns current system status. **No authentication required.**

**Response**

```json
{
  "success": true,
  "data": {
    "status": "operational",
    "timestamp": "2026-03-03T12:00:00Z",
    "services": {
      "aggregator": "operational",
      "database": "operational",
      "signing": "operational",
      "marketIntelligence": "operational"
    },
    "apiAuth": "enabled"
  }
}
```

---

## Economic Intelligence Endpoints

### Get Full Intelligence Report

```
GET /v1/intelligence/{currency}
```

Returns complete economic intelligence package for a currency including carry trade signals, real rate analysis, and economic indicators.

**Response**

```json
{
  "success": true,
  "timestamp": "2026-03-03T12:00:00Z",
  "currency": "KES",
  "data": {
    "interestRate": {
      "policyRate": 12.0,
      "source": "CBK"
    },
    "inflation": {
      "rate": 7.8,
      "source": "KNBS"
    },
    "carryTrade": {
      "spread": 7.5,
      "signal": "MODERATE_BUY",
      "riskAdjustedReturn": 0.63
    },
    "realRate": {
      "nominal": 12.0,
      "real": 4.2,
      "signal": "POSITIVE"
    }
  }
}
```

---

### Get Interest Rates

```
GET /v1/rates/interest
GET /v1/rates/interest/{currency}
```

Returns central bank policy rates and yield tier classifications.

**Response**

```json
{
  "success": true,
  "timestamp": "2026-03-03T12:00:00Z",
  "count": 50,
  "rates": [
    {
      "currency": "NGN",
      "policyRate": 27.5,
      "spreadVsUSD": 23.0,
      "yieldTier": "HIGH",
      "realRate": 5.2,
      "inflationRate": 22.3,
      "source": "CBN"
    }
  ],
  "referenceRate": {
    "currency": "USD",
    "rate": 4.5,
    "source": "Federal Reserve"
  }
}
```

---

## Quantitative Analytics Endpoints

Advanced quantitative metrics for institutional analysis.

### Interest Rate Parity (IRP) Analysis

```
GET /v1/quant/irp
GET /v1/quant/irp/{currency}
```

Calculate implied forward premiums and covered interest differentials.

**Response**

```json
{
  "success": true,
  "timestamp": "2026-03-03T12:00:00Z",
  "currency": "KES",
  "baseCurrency": "USD",
  "domesticRate": 12.0,
  "foreignRate": 4.5,
  "rateDifferential": 7.5,
  "impliedForwardPremium": 7.5,
  "forwardPoints1M": 6250,
  "forwardPoints3M": 18750,
  "forwardPoints12M": 75000,
  "coveredCarry": 0,
  "uncoveredCarry": 7.5,
  "arbitrageOpportunity": false
}
```

---

### Carry-to-Volatility Ratios

```
GET /v1/quant/carry-vol
GET /v1/quant/carry-vol/{currency}
```

Risk-adjusted return metrics (Sharpe-like) for currency pairs.

**Response**

```json
{
  "success": true,
  "currency": "KES",
  "carrySpread": 7.5,
  "impliedVolatility": 12,
  "carryToVol": 0.63,
  "annualizedSharpe": 0.63,
  "breakEvenMove": 7.5,
  "probabilityOfProfit": 73.4,
  "riskTier": "MEDIUM"
}
```

---

### Z-Score Deviation Analysis

```
GET /v1/quant/zscore
GET /v1/quant/zscore/{currency}
```

Statistical deviation from historical norms.

**Response**

```json
{
  "success": true,
  "currency": "KES",
  "currentRate": 12.0,
  "historicalMean": 10.5,
  "historicalStdDev": 2.1,
  "zScore": 0.71,
  "percentile": 76,
  "meanReversionSignal": "NEUTRAL",
  "halfLife": 45,
  "confidence": 0.85
}
```

---

### Risk Parity Portfolio Weights

```
GET /v1/quant/risk-parity
```

Inverse-volatility weighted allocations for all supported currencies.

---

### Cross-Currency Spread Analysis

```
GET /v1/quant/cross-currency/{currency1}/{currency2}
```

Compare any two currencies with spread, relative value, and convergence signals.

---

### Quant Dashboard

```
GET /v1/quant/dashboard
```

Aggregate market overview with top opportunities.

**Response**

```json
{
  "success": true,
  "timestamp": "2026-03-03T12:00:00Z",
  "marketRegime": "RISK_ON",
  "globalCarryIndex": 6.93,
  "volatilityRegime": "NORMAL",
  "topCarryTrades": [
    {"currency": "ARS", "score": 2.27},
    {"currency": "AED", "score": 1.80}
  ],
  "topMeanReversionTrades": [
    {"currency": "NGN", "zScore": 2.25}
  ],
  "riskWarnings": ["ARS: Extreme volatility (50%)"]
}
```

---

## TrueRandom Endpoints

Verifiable randomness beacon on Avalanche C-Chain.

See [TrueRandom API Reference](truerandom-api.md) for full documentation.

### Quick Reference

| Endpoint | Description |
|----------|-------------|
| `GET /v1/truerandom/health` | Service health |
| `GET /v1/truerandom/beacon/latest` | Latest beacon |
| `GET /v1/truerandom/beacon/{round}` | Beacon by round |
| `GET /v1/truerandom/beacon/derive` | Derive random value |
| `GET /v1/truerandom/committee/status` | Committee info |

---

## WebSocket API

Connect to real-time updates via the unified WebSocket gateway.

**Endpoint**: `wss://api.afxo.ai/v1/ws`

### Subscribe to Channels

```javascript
const ws = new WebSocket('wss://api.afxo.ai/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['rates:KES/USD', 'rates:NGN/USD', 'truerandom:beacons']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);

  switch (data.type) {
    case 'rate':
      console.log(`${data.pair}: ${data.rate} (confidence: ${data.confidence})`);
      break;
    case 'beacon':
      console.log(`Beacon round ${data.round}: ${data.randomness}`);
      break;
    case 'heartbeat':
      // Connection alive
      break;
  }
};
```

### Available Channels

| Channel | Format | Description |
|---------|--------|-------------|
| `rates:{PAIR}` | `rates:KES/USD` | FX rate updates (~5s interval) |
| `truerandom:beacons` | — | New beacon events (~5min interval) |

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `subscribe` | Client → Server | Subscribe to channels |
| `unsubscribe` | Client → Server | Unsubscribe from channels |
| `subscribed` | Server → Client | Subscription confirmation |
| `unsubscribed` | Server → Client | Unsubscription confirmation |
| `rate` | Server → Client | FX rate update |
| `beacon` | Server → Client | TrueRandom beacon event |
| `heartbeat` | Server → Client | Keep-alive (every 30s) |
| `error` | Server → Client | Error message |

### Rate Update Format

```json
{
  "type": "rate",
  "pair": "KES/USD",
  "rate": 129.87,
  "confidence": 94,
  "sources": 6,
  "timestamp": "2026-03-03T12:00:05Z"
}
```

### Beacon Event Format

```json
{
  "type": "beacon",
  "round": 328,
  "randomness": "0x9c5f3a...",
  "timestamp": "2026-03-03T12:05:00Z",
  "beaconId": "0xdef789..."
}
```

---

## Rate Limits

| Plan | Requests/Day | Requests/Minute |
|------|--------------|-----------------|
| Sandbox | 100 | 5 |
| Starter | 1,000 | 30 |
| Builder | 10,000 | 60 |
| Growth | 100,000 | 300 |
| Enterprise | Unlimited | Custom |

Rate limit headers are included in responses:

```
X-RateLimit-Limit: 10000
X-RateLimit-Remaining: 9542
X-RateLimit-Reset: 1709474400
```

---

## Error Codes

| Code | Description |
|------|-------------|
| `400` | Bad request — invalid parameters |
| `401` | Unauthorized — invalid or missing API key |
| `403` | Forbidden — insufficient plan tier |
| `404` | Not found — unsupported currency pair |
| `429` | Rate limit exceeded |
| `500` | Internal server error |
| `503` | Service unavailable — feature not configured |

**Error Response Format**

```json
{
  "success": false,
  "error": "Rate limit exceeded. Upgrade your plan for higher limits."
}
```

---

## SDKs

Official SDKs are available:

### TypeScript / JavaScript

```bash
npm install @afxo/sdk
```

```typescript
import { AFXOClient } from '@afxo/sdk';

const client = new AFXOClient({ apiKey: 'your-key' });

// Get current rate
const rate = await client.getRate('KES', 'USD');
console.log(rate.rate, rate.confidence);

// Batch rates
const batch = await client.getRatesBatch(['KES/USD', 'NGN/USD']);

// Historical data
const history = await client.getHistory('KES', 'USD', '7d', 'daily');

// Signed feed (for smart contracts)
const signed = await client.getSignedRate('USD', 'KES');

// Economic intelligence
const intel = await client.getIntelligence('KES');

// Quant dashboard
const dashboard = await client.getQuantDashboard();

// TrueRandom beacon
const beacon = await client.getLatestBeacon();

// Real-time streaming
const stream = client.stream(['rates:KES/USD', 'truerandom:beacons']);
stream.onRate((data) => console.log(data.pair, data.rate));
stream.onBeacon((data) => console.log(data.round, data.randomness));
stream.connect();
```

### Python

```bash
pip install afxo-sdk
```

```python
from afxo import AFXOClient

client = AFXOClient(api_key="your-key")

# Get current rate
rate = client.get_rate("KES", "USD")
print(rate.rate, rate.confidence)

# Batch rates
batch = client.get_rates_batch(["KES/USD", "NGN/USD"])

# Historical data
history = client.get_history("KES", "USD", period="7d", interval="daily")

# Economic intelligence
intel = client.get_intelligence("KES")

# Quant dashboard
dashboard = client.get_quant_dashboard()

# TrueRandom beacon
beacon = client.get_latest_beacon()
```
