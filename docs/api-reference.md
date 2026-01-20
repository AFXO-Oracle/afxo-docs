# AFXO API Reference

Base URL: `https://api.afxo.ai/v1`

## Authentication

All API requests require an API key passed in the `X-API-Key` header:

```bash
curl -H "X-API-Key: your_api_key" https://api.afxo.ai/v1/rates/KES/USD
```

Get your API key at [afxo.ai/get-access](https://afxo.ai/get-access).

---

## Endpoints

### Get Current Rate

```
GET /rates/{base}/{quote}
```

Returns the current exchange rate for a currency pair.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `base` | string | Base currency code (e.g., `KES`) |
| `quote` | string | Quote currency code (e.g., `USD`) |

**Response**

```json
{
  "pair": "KES/USD",
  "rate": "0.00770000",
  "inverseRate": "129.87012987",
  "confidence": 94,
  "confidenceBand": "high",
  "sources": 6,
  "timestamp": "2025-01-20T12:00:00Z",
  "updatedAt": "2025-01-20T12:00:00Z"
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `pair` | string | Currency pair |
| `rate` | string | Exchange rate (8 decimal precision) |
| `inverseRate` | string | Inverse rate |
| `confidence` | number | Confidence score (0-100) |
| `confidenceBand` | string | `high` (85-100), `medium` (70-84), `low` (<70) |
| `sources` | number | Number of active data sources |
| `timestamp` | string | Rate timestamp (ISO 8601) |
| `updatedAt` | string | Last update time |

---

### Get Multiple Rates

```
GET /rates/batch
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
  "rates": [
    {
      "pair": "KES/USD",
      "rate": "0.00770000",
      "confidence": 94,
      "sources": 6,
      "timestamp": "2025-01-20T12:00:00Z"
    },
    {
      "pair": "NGN/USD",
      "rate": "0.00063000",
      "confidence": 91,
      "sources": 5,
      "timestamp": "2025-01-20T12:00:00Z"
    }
  ],
  "requestedAt": "2025-01-20T12:00:01Z"
}
```

---

### Get Historical Rates

```
GET /rates/{base}/{quote}/history
```

Returns historical rate data. Requires Historical Data add-on.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `from` | string | Start date (ISO 8601) |
| `to` | string | End date (ISO 8601) |
| `interval` | string | `hourly` or `daily` |

**Example**

```bash
curl "https://api.afxo.ai/v1/rates/KES/USD/history?from=2025-01-01&to=2025-01-20&interval=daily" \
  -H "X-API-Key: your_api_key"
```

**Response**

```json
{
  "pair": "KES/USD",
  "interval": "daily",
  "data": [
    {
      "date": "2025-01-01",
      "open": "0.00768000",
      "high": "0.00772000",
      "low": "0.00765000",
      "close": "0.00770000",
      "avgConfidence": 92
    }
  ]
}
```

---

### Get Supported Currencies

```
GET /currencies
```

Returns list of all supported currencies.

**Response**

```json
{
  "currencies": [
    {
      "code": "KES",
      "name": "Kenyan Shilling",
      "country": "Kenya",
      "region": "East Africa",
      "supported": true,
      "sources": 6
    }
  ]
}
```

---

### Get Network Status

```
GET /status
```

Returns current network and oracle status.

**Response**

```json
{
  "status": "operational",
  "operators": 3,
  "currencies": 27,
  "avgConfidence": 92,
  "lastUpdate": "2025-01-20T12:00:00Z"
}
```

---

## WebSocket API

Connect to real-time rate updates via WebSocket.

**Endpoint**: `wss://api.afxo.ai/v1/ws`

### Connection

```javascript
const ws = new WebSocket('wss://api.afxo.ai/v1/ws');

ws.onopen = () => {
  // Authenticate
  ws.send(JSON.stringify({
    type: 'auth',
    apiKey: 'your_api_key'
  }));
};
```

### Subscribe to Rates

```javascript
// Subscribe to specific pairs
ws.send(JSON.stringify({
  type: 'subscribe',
  pairs: ['KES/USD', 'NGN/USD']
}));

// Receive updates
ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'rate') {
    console.log(data.pair, data.rate, data.confidence);
  }
};
```

### Message Types

| Type | Direction | Description |
|------|-----------|-------------|
| `auth` | Client → Server | Authenticate connection |
| `subscribe` | Client → Server | Subscribe to pairs |
| `unsubscribe` | Client → Server | Unsubscribe from pairs |
| `rate` | Server → Client | Rate update |
| `heartbeat` | Server → Client | Keep-alive ping |
| `error` | Server → Client | Error message |

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
X-RateLimit-Reset: 1705766400
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

**Error Response Format**

```json
{
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Daily rate limit exceeded. Upgrade your plan for higher limits.",
    "retryAfter": 3600
  }
}
```

---

## SDKs

Official SDKs are available:

- **JavaScript/TypeScript**: `npm install @afxo/sdk`
- **Python**: `pip install afxo-sdk` (coming soon)

See [examples](../examples/) for usage patterns.
