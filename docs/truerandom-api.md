# TrueRandom API Reference

AFXO TrueRandom is a verifiable randomness beacon that produces cryptographically secure, publicly auditable random values on a regular cadence.

Base URL: `https://api.afxo.ai/v1/truerandom`

---

## Overview

TrueRandom generates random beacons every 5 minutes using multiple entropy sources (system, blockchain, timing), aggregated through a BLS threshold signature committee. Each beacon is committed on-chain to the Avalanche C-Chain for independent verification.

**Key properties:**
- Unpredictable: entropy is collected from multiple independent sources
- Verifiable: beacons are committed on-chain with cryptographic proofs
- Unbiasable: BLS threshold signatures prevent any single party from influencing output
- Publicly auditable: all beacons are queryable via API and verifiable on-chain

---

## Endpoints

### Get Service Health

```
GET /health
```

Returns the health status of the TrueRandom coordinator.

**Response**

```json
{
  "status": "healthy",
  "timestamp": "2026-03-03T12:00:00Z",
  "service": "truerandom-coordinator",
  "version": "1.0.0"
}
```

---

### Get Latest Beacon

```
GET /beacon/latest
```

Returns the most recently generated random beacon.

**Response**

```json
{
  "success": true,
  "data": {
    "round": 327,
    "randomness": "0x8a4f2e1d...",
    "timestamp": "2026-03-03T12:00:00Z",
    "beaconId": "0xabc123...",
    "entropy": {
      "quality": 85,
      "sources": 3
    },
    "committee": {
      "threshold": 1,
      "signers": 1
    },
    "onChain": {
      "committed": true,
      "txHash": "0xdef456...",
      "chainId": 43113
    }
  }
}
```

**Response Fields**

| Field | Type | Description |
|-------|------|-------------|
| `round` | number | Sequential round number |
| `randomness` | string | The generated random value (hex-encoded) |
| `timestamp` | string | When the beacon was generated (ISO 8601) |
| `beaconId` | string | On-chain beacon identifier (keccak256 hash) |
| `entropy.quality` | number | Entropy quality score (0-100) |
| `entropy.sources` | number | Number of entropy sources used |
| `onChain.committed` | boolean | Whether beacon has been committed on-chain |
| `onChain.txHash` | string | Transaction hash of on-chain commitment |
| `onChain.chainId` | number | Chain ID (43113 = Fuji testnet, 43114 = Avalanche mainnet) |

---

### Get Beacon by Round

```
GET /beacon/{round}
```

Returns a specific beacon by its round number.

**Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `round` | number | The round number to retrieve |

**Response**

Same format as `/beacon/latest`.

**Error Response (404)**

```json
{
  "success": false,
  "error": "Beacon not found for round 999"
}
```

---

### Derive Random Value

```
GET /beacon/derive?input={input}
```

Derives a deterministic random value from the latest beacon and a user-provided input. Useful for applications that need reproducible randomness seeded from a beacon round.

**Query Parameters**

| Parameter | Type | Description |
|-----------|------|-------------|
| `input` | string | User-provided input for derivation |

**Response**

```json
{
  "success": true,
  "data": {
    "derivedValue": "0x7b3e...",
    "sourceRound": 327,
    "input": "my-lottery-draw-2026-03-03"
  }
}
```

---

### Get Committee Status

```
GET /committee/status
```

Returns information about the BLS threshold signature committee.

**Response**

```json
{
  "success": true,
  "data": {
    "total": 1,
    "active": 1,
    "threshold": 1,
    "members": [
      {
        "id": "beacon-node-1",
        "status": "active",
        "lastSeen": "2026-03-03T12:00:00Z"
      }
    ]
  }
}
```

---

### Get Usage Statistics

```
GET /usage
```

Returns API usage statistics (requires API key with admin access).

---

## WebSocket Streaming

Connect to real-time beacon updates via the unified WebSocket gateway.

**Endpoint**: `wss://api.afxo.ai/v1/ws`

### Subscribe to Beacons

```javascript
const ws = new WebSocket('wss://api.afxo.ai/v1/ws');

ws.onopen = () => {
  ws.send(JSON.stringify({
    type: 'subscribe',
    channels: ['truerandom:beacons']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  if (data.type === 'beacon') {
    console.log(`Round ${data.round}: ${data.randomness}`);
  }
};
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

## On-Chain Verification

Every beacon is committed to the Avalanche C-Chain smart contract. You can verify any beacon independently.

### Contract Addresses

| Network | Contract | Address |
|---------|----------|---------|
| Fuji Testnet | TrueRandom Proxy | `0x4c74067aA49f3d7E9DF0b2cDE5655A0dA495bbC9` |
| Fuji Testnet | Provenance Anchor | `0x263827fbC15e9F1CD9e4c19A9027d98F499A1AFf` |

### Verification with ethers.js

```javascript
import { ethers } from 'ethers';

const provider = new ethers.JsonRpcProvider('https://api.avax-test.network/ext/bc/C/rpc');

const abi = [
  'function getBeacon(bytes32 beaconId) view returns (uint256 round, bytes32 randomness, uint256 timestamp)',
  'function verifyBeacon(bytes32 beaconId) view returns (bool)',
];

const contract = new ethers.Contract(
  '0x4c74067aA49f3d7E9DF0b2cDE5655A0dA495bbC9',
  abi,
  provider
);

// Verify a beacon exists on-chain
const isValid = await contract.verifyBeacon(beaconId);
console.log('Beacon verified:', isValid);
```

---

## SDK Usage

### TypeScript

```typescript
import { AFXOClient } from '@afxo/sdk';

const client = new AFXOClient({ apiKey: 'your-key' });

// Get latest beacon
const beacon = await client.getLatestBeacon();
console.log(`Round ${beacon.round}: ${beacon.randomness}`);

// Get specific round
const specific = await client.getBeacon(100);

// Stream beacons in real-time
const stream = client.stream(['truerandom:beacons']);
stream.onBeacon((data) => {
  console.log(`New beacon: round ${data.round}`);
});
stream.connect();
```

### Python

```python
from afxo import AFXOClient

client = AFXOClient(api_key="your-key")

# Get latest beacon
beacon = client.get_latest_beacon()
print(f"Round {beacon.round}: {beacon.randomness}")

# Get specific round
specific = client.get_beacon(100)
```

---

## Rate Limits

TrueRandom endpoints follow the same rate limits as other AFXO API endpoints. See [API Reference](api-reference.md#rate-limits) for details.

Beacon generation occurs on a fixed 5-minute cadence and cannot be accelerated by API requests.

---

## Use Cases

- **Lottery & Gaming**: Provably fair random number generation
- **NFT Minting**: Random trait assignment with verifiable seed
- **DeFi**: Random selection for governance, validator rotation
- **Auditing**: Timestamped, immutable random values for compliance
