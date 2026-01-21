# AFXO Signed Price Feed Standard v2

**Author:** Vincent Scaturchio
**Version:** 2.0.0
**Last Updated:** 2026-01-21

---

## Table of Contents

1. [Overview](#overview)
2. [Why AFXO v2 is Superior](#why-afxo-v2-is-superior)
3. [Technical Specification](#technical-specification)
4. [Field Descriptions](#field-descriptions)
5. [EIP-712 Type Definition](#eip-712-type-definition)
6. [Feed ID Generation](#feed-id-generation)
7. [API Integration](#api-integration)
8. [Signature Verification](#signature-verification)
9. [Integration Examples](#integration-examples)
10. [Security Considerations](#security-considerations)
11. [Migration from v1](#migration-from-v1)

---

## Overview

The **AFXO Signed Price Feed Standard v2** is a world-class EIP-712 signed data format for oracle price feeds. It represents the definitive standard for institutional-grade signed oracle data, combining security, transparency, and developer experience in a single, elegant specification.

### Key Innovations

- **Self-Describing Data**: Every field needed to interpret the price is included in the signed payload
- **Provenance Tracking**: Cryptographic proof of which data sources were used
- **Cross-Chain Safety**: Chain ID embedded in signed data prevents replay attacks
- **Monotonic Rounds**: Detect out-of-order or duplicate data instantly
- **Quality Metrics**: Confidence scores and source counts built into the standard
- **Universal Compatibility**: EIP-712 standard ensures compatibility with all major wallets and tools

---

## Why AFXO v2 is Superior

AFXO v2 was designed from first principles to address shortcomings in existing oracle standards (Chainlink, Pyth) while maintaining backward compatibility where sensible.

### Comparison Table

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| **Feed Identifier** | ✅ `feedId` (bytes32) | ✅ Proxy address | ✅ Price ID |
| **Explicit Decimals** | ✅ Self-describing | ❌ External lookup required | ✅ Self-describing |
| **Confidence Score** | ✅ Built-in (0-10000 bps) | ❌ Not provided | ✅ Provided |
| **Source Count** | ✅ Transparency metric | ❌ Not provided | ✅ Publisher count |
| **Round/Sequence** | ✅ Monotonic `round` field | ❌ Phase ID + aggregation | ❌ Not provided |
| **Expiry Timestamp** | ✅ `validUntil` | ✅ Staleness check | ❌ Application-level |
| **Chain Safety** | ✅ `chainId` in signed data | ❌ Domain only | ✅ In signed data |
| **Provenance Hash** | ✅ `aggregationHash` | ❌ Not provided | ❌ Not provided |
| **EIP-712 Compliance** | ✅ Full compliance | ⚠️ Partial | ✅ Full compliance |
| **Auditable Pipeline** | ✅ Reproducible from hash | ❌ Opaque | ⚠️ Limited |

### Key Differentiators

1. **Provenance Hash (`aggregationHash`)**: AFXO v2 is the only standard that includes a cryptographic hash of the sources used, allowing full auditability of the aggregation process.

2. **Explicit Decimals**: Unlike Chainlink (which requires external contract calls to determine precision), AFXO v2 includes decimals in the signed data. This makes the price self-describing.

3. **Monotonic Rounds**: AFXO uses a simple, monotonically increasing round number per feed. This is cleaner than Chainlink's phase ID system and more robust than Pyth's sequence-free approach.

4. **Quality Metrics**: Both confidence (quality of data) and sourceCount (transparency) are built into the standard, giving consumers visibility into data quality.

5. **Universal Design**: AFXO v2 works across any EVM chain with the same standard. No special adapters or modifications needed.

---

## Technical Specification

### Data Structure

```typescript
interface AFXOPriceFeedV2 {
  feedId: string;          // bytes32 - Unique identifier per currency pair
  price: bigint;           // int256 - Price with `decimals` precision
  decimals: number;        // uint8 - Decimal places (default: 8)
  confidence: number;      // uint16 - Quality metric in basis points (0-10000)
  sourceCount: number;     // uint8 - Number of data sources used
  timestamp: number;       // uint64 - Aggregation timestamp (Unix seconds)
  validUntil: number;      // uint64 - Signature expiry (Unix seconds)
  round: number;           // uint64 - Monotonically increasing sequence
  chainId: number;         // uint64 - Target blockchain ID
  aggregationHash: string; // bytes32 - Provenance hash for auditability
}
```

### Domain Parameters

```typescript
interface EIP712DomainV2 {
  name: 'AFXO Oracle';
  version: '2';
  chainId: number;           // Target chain ID
  verifyingContract?: string; // Optional: consumer contract address
}
```

---

## Field Descriptions

### `feedId` (bytes32)

Unique identifier for the currency pair, generated as:

```
feedId = keccak256("AFXO:<BASE>/<QUOTE>:v2")
```

**Examples:**
- `USD/KES`: `keccak256("AFXO:USD/KES:v2")` → `0x...`
- `USD/NGN`: `keccak256("AFXO:USD/NGN:v2")` → `0x...`

**Benefits:**
- Deterministic: Same pair always produces same ID
- Gas-efficient: `bytes32` is cheaper than string comparison
- Self-identifying: Can be decoded if needed
- Collision-resistant: Cryptographic uniqueness guarantee

### `price` (int256)

The exchange rate as a fixed-point integer with precision determined by `decimals`.

**Example:**
- Rate: `0.0077 USD/KES`
- Decimals: `8`
- Price: `0.0077 × 10^8 = 770000`

**Why int256?**
- Supports negative prices (future-proof for interest rates, basis, etc.)
- Standard Solidity type (no special handling needed)
- Compatible with Chainlink's `int256` interface

### `decimals` (uint8)

Number of decimal places in the `price` field. Default: `8` (Chainlink standard).

**Why explicit?**
- Self-describing: No external call needed to interpret price
- Flexible: Different feeds can use different precision
- Universal: Works identically across all chains

### `confidence` (uint16)

Quality score in basis points (0-10000, where 10000 = 100%).

**Calculation:**
```
confidence = min(
  sourceAgreement * 40% +
  sourceQuality * 30% +
  historicalConsistency * 20% +
  dataFreshness * 10%,
  10000
)
```

**Recommended Thresholds:**
- `>= 7000` (70%): Safe for production use
- `>= 8000` (80%): High confidence
- `>= 9000` (90%): Exceptional quality

### `sourceCount` (uint8)

Number of data sources that passed quality checks and were included in the aggregation.

**Why it matters:**
- Transparency: Know how many independent sources confirmed the price
- Quality signal: More sources generally means higher confidence
- Anti-manipulation: Harder to manipulate with more sources

**AFXO Standards:**
- Minimum: 3 sources (enforced)
- Target: 5-8 sources per currency
- Maximum: 15 sources (practical limit)

### `timestamp` (uint64)

Unix timestamp (seconds) when the aggregation occurred.

**Usage:**
```solidity
require(block.timestamp - feed.timestamp < 3600, "Data too old");
```

### `validUntil` (uint64)

Unix timestamp (seconds) when the signature expires.

**Typical Values:**
- Development: `timestamp + 300` (5 minutes)
- Production: `timestamp + 120` (2 minutes)
- High-frequency: `timestamp + 60` (1 minute)

**Why explicit expiry?**
- Security: Prevents indefinite replay of old signatures
- Clarity: Consumer knows exactly how long data is valid
- Flexibility: Different feeds can have different validity periods

### `round` (uint64)

Monotonically increasing sequence number per feed. Never resets, even on service restart.

**Benefits:**
- **Ordering**: Detect out-of-order updates
- **Replay Protection**: Each round is unique
- **Historical Queries**: "Give me round 12345 for USD/KES"
- **Simplicity**: No complex phase IDs or aggregation round logic

**Implementation:**
```typescript
// Backed by Redis or Postgres (NOT in-memory)
const round = await roundManager.getNextRound(feedId);
```

### `chainId` (uint64)

The blockchain network ID where this signature is intended to be used.

**Common Chain IDs:**
- Ethereum Mainnet: `1`
- Avalanche C-Chain: `43114`
- Polygon: `137`
- Arbitrum One: `42161`
- Base: `8453`

**Why in signed data?**
- Prevents cross-chain replay attacks
- Embedded in both domain AND feed data (defense in depth)
- Consumer can verify chain safety before accepting data

### `aggregationHash` (bytes32)

Cryptographic provenance hash proving which sources were used.

**Generation:**
```typescript
aggregationHash = keccak256(
  sortedSourceIds.join(',') + '|' +
  aggregationMethod + '|' +
  timestamp
)
```

**Example:**
```typescript
// Sources: ["oanda", "xe", "cbk", "binance-p2p"]
// Method: "weighted_average"
// Timestamp: 1737460800
aggregationHash = keccak256(
  "binance-p2p,cbk,oanda,xe|weighted_average|1737460800"
)
```

**Benefits:**
- **Auditability**: Verify which sources were used without exposing raw data
- **Reproducibility**: Oracle operator can prove aggregation was correct
- **Transparency**: Consumers can request source breakdown via API
- **Integrity**: Tampering with sources invalidates the hash

---

## EIP-712 Type Definition

The authoritative EIP-712 type definition for AFXO v2:

```typescript
const AFXO_PRICE_FEED_V2_TYPES = {
  AFXOPriceFeed: [
    { name: 'feedId', type: 'bytes32' },
    { name: 'price', type: 'int256' },
    { name: 'decimals', type: 'uint8' },
    { name: 'confidence', type: 'uint16' },
    { name: 'sourceCount', type: 'uint8' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'validUntil', type: 'uint64' },
    { name: 'round', type: 'uint64' },
    { name: 'chainId', type: 'uint64' },
    { name: 'aggregationHash', type: 'bytes32' },
  ],
};
```

**Domain:**

```typescript
const domain = {
  name: 'AFXO Oracle',
  version: '2',
  chainId: 43114, // Target chain
  verifyingContract: '0x...', // Optional
};
```

**Signature Generation (ethers.js v6):**

```typescript
const signature = await wallet.signTypedData(
  domain,
  AFXO_PRICE_FEED_V2_TYPES,
  feed
);
```

---

## Feed ID Generation

### Standard Format

```
feedId = keccak256("AFXO:<BASE>/<QUOTE>:v2")
```

### TypeScript Implementation

```typescript
import { ethers } from 'ethers';

function generateFeedId(base: string, quote: string): string {
  const pair = `${base.toUpperCase()}/${quote.toUpperCase()}`;
  const feedIdString = `AFXO:${pair}:v2`;
  return ethers.keccak256(ethers.toUtf8Bytes(feedIdString));
}

// Examples
const kesUsdFeedId = generateFeedId('USD', 'KES');
const ngnUsdFeedId = generateFeedId('USD', 'NGN');
```

### Solidity Implementation

```solidity
function generateFeedId(
    string memory base,
    string memory quote
) public pure returns (bytes32) {
    return keccak256(
        abi.encodePacked(
            "AFXO:",
            base,
            "/",
            quote,
            ":v2"
        )
    );
}
```

### Standard AFXO Feed IDs

| Pair | Feed ID |
|------|---------|
| USD/KES | `0x...` (example) |
| USD/NGN | `0x...` (example) |
| USD/GHS | `0x...` (example) |

Full list available via API: `GET /v2/feeds`

---

## API Integration

### Endpoint

```
GET /v2/rates/:baseCurrency/:quoteCurrency/signed
```

### Query Parameters

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `chainId` | number | No | Target chain ID (default: 43114) |
| `validity` | number | No | Validity duration in seconds (default: 300) |
| `verifyingContract` | string | No | Consumer contract address |

### Example Request

```bash
curl -X GET "https://api.afxo.ai/v2/rates/USD/KES/signed?chainId=43114&validity=300" \
  -H "X-API-Key: your_api_key"
```

### Response Format

```json
{
  "success": true,
  "version": "2.0.0",
  "feed": {
    "feedId": "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb1",
    "pair": "USD/KES",
    "price": "770000",
    "decimals": 8,
    "confidence": 8750,
    "sourceCount": 6,
    "timestamp": 1737460800,
    "validUntil": 1737461100,
    "round": 12345,
    "chainId": 43114,
    "aggregationHash": "0x..."
  },
  "signature": {
    "v": 28,
    "r": "0x...",
    "s": "0x...",
    "packed": "0x..."
  },
  "signer": "0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd",
  "domain": {
    "name": "AFXO Oracle",
    "version": "2",
    "chainId": 43114,
    "verifyingContract": null
  },
  "metadata": {
    "humanReadable": {
      "pair": "USD/KES",
      "price": "0.00770000 USD/KES",
      "confidence": "87.5%",
      "validFor": "300 seconds"
    },
    "sources": [
      { "id": "oanda", "weight": 0.25, "included": true, "rate": 0.0077 },
      { "id": "xe", "weight": 0.25, "included": true, "rate": 0.00771 },
      { "id": "cbk", "weight": 0.20, "included": true, "rate": 0.00769 }
    ],
    "statistics": {
      "median": 0.0077,
      "stdDev": 0.00001,
      "coefficientOfVariation": 0.0013
    }
  }
}
```

---

## Signature Verification

### Off-Chain Verification (TypeScript)

**Installation:**

```bash
npm install ethers@^6.13.0
```

**Verification Function:**

```typescript
import { ethers } from 'ethers';

const AFXO_PRICE_FEED_V2_TYPES = {
  AFXOPriceFeed: [
    { name: 'feedId', type: 'bytes32' },
    { name: 'price', type: 'int256' },
    { name: 'decimals', type: 'uint8' },
    { name: 'confidence', type: 'uint16' },
    { name: 'sourceCount', type: 'uint8' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'validUntil', type: 'uint64' },
    { name: 'round', type: 'uint64' },
    { name: 'chainId', type: 'uint64' },
    { name: 'aggregationHash', type: 'bytes32' },
  ],
};

function verifyAFXOSignature(
  apiResponse: any,
  expectedSigner: string,
  expectedChainId: number
): boolean {
  // Convert API response to typed data
  const feed = {
    feedId: apiResponse.feed.feedId,
    price: BigInt(apiResponse.feed.price),
    decimals: apiResponse.feed.decimals,
    confidence: apiResponse.feed.confidence,
    sourceCount: apiResponse.feed.sourceCount,
    timestamp: apiResponse.feed.timestamp,
    validUntil: apiResponse.feed.validUntil,
    round: apiResponse.feed.round,
    chainId: apiResponse.feed.chainId,
    aggregationHash: apiResponse.feed.aggregationHash,
  };

  // Recover signer
  const recoveredSigner = ethers.verifyTypedData(
    apiResponse.domain,
    AFXO_PRICE_FEED_V2_TYPES,
    feed,
    apiResponse.signature.packed
  );

  // Validate
  const signatureValid = recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
  const chainIdValid = feed.chainId === expectedChainId;
  const notExpired = Math.floor(Date.now() / 1000) <= feed.validUntil;

  return signatureValid && chainIdValid && notExpired;
}

// Usage
const response = await fetch('https://api.afxo.ai/v2/rates/USD/KES/signed?chainId=43114');
const data = await response.json();

const isValid = verifyAFXOSignature(
  data,
  '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd', // AFXO signer
  43114 // Avalanche C-Chain
);

console.log('Signature valid:', isValid);
```

### On-Chain Verification (Solidity)

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract AFXOConsumer is EIP712 {
    using ECDSA for bytes32;

    address public constant AFXO_SIGNER = 0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd;

    bytes32 private constant AFXO_PRICE_FEED_TYPEHASH = keccak256(
        "AFXOPriceFeed(bytes32 feedId,int256 price,uint8 decimals,uint16 confidence,uint8 sourceCount,uint64 timestamp,uint64 validUntil,uint64 round,uint64 chainId,bytes32 aggregationHash)"
    );

    struct AFXOPriceFeed {
        bytes32 feedId;
        int256 price;
        uint8 decimals;
        uint16 confidence;
        uint8 sourceCount;
        uint64 timestamp;
        uint64 validUntil;
        uint64 round;
        uint64 chainId;
        bytes32 aggregationHash;
    }

    constructor() EIP712("AFXO Oracle", "2") {}

    function verifyAndUsePrice(
        AFXOPriceFeed calldata feed,
        bytes calldata signature
    ) external view returns (int256 price) {
        // Verify expiry
        require(block.timestamp <= feed.validUntil, "Signature expired");

        // Verify chain ID
        require(feed.chainId == block.chainid, "Wrong chain");

        // Verify confidence
        require(feed.confidence >= 7000, "Low confidence");

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                AFXO_PRICE_FEED_TYPEHASH,
                feed.feedId,
                feed.price,
                feed.decimals,
                feed.confidence,
                feed.sourceCount,
                feed.timestamp,
                feed.validUntil,
                feed.round,
                feed.chainId,
                feed.aggregationHash
            )
        );

        bytes32 digest = _hashTypedDataV4(structHash);
        address signer = digest.recover(signature);

        require(signer == AFXO_SIGNER, "Invalid signer");

        return feed.price;
    }
}
```

---

## Integration Examples

### Example 1: FiatRails Integration

FiatRails uses AFXO v2 signed feeds to validate external FX rates before adjusting on-chain reserves.

```typescript
import { verifyAFXOPriceFeed, formatPrice } from './VerificationHelperV2';

async function validateKESRate() {
  // Fetch signed rate
  const response = await fetch(
    'https://api.afxo.ai/v2/rates/USD/KES/signed?chainId=888888'
  );
  const data = await response.json();

  // Verify signature
  const verification = verifyAFXOPriceFeed(
    data,
    '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd',
    888888 // FSC L1
  );

  if (!verification.valid) {
    console.error('Verification failed:', verification.error);
    return null;
  }

  // Check confidence
  if (data.feed.confidence < 7000) {
    console.error('Confidence too low:', data.feed.confidence);
    return null;
  }

  // Use the rate
  const rate = formatPrice(data.feed.price, data.feed.decimals);
  console.log(`Verified USD/KES rate: ${rate} (${data.feed.confidence / 100}% confidence)`);

  return rate;
}
```

### Example 2: DeFi Lending Protocol

A lending protocol uses AFXO v2 for collateral valuation.

```solidity
contract LendingPool {
    IAFXOVerifier public afxo;
    mapping(bytes32 => uint64) public lastRound; // Track rounds per feed

    function updateCollateralValue(
        AFXOPriceFeed calldata feed,
        bytes calldata signature
    ) external {
        // Verify with AFXO
        require(afxo.verify(feed, signature), "Invalid signature");

        // Check round ordering
        require(feed.round > lastRound[feed.feedId], "Stale round");
        lastRound[feed.feedId] = feed.round;

        // Update collateral value
        updateAssetPrice(feed.feedId, feed.price, feed.decimals);
    }
}
```

### Example 3: Cross-Chain Bridge

A bridge protocol uses AFXO v2 for accurate cross-chain asset pricing.

```typescript
async function bridgeAsset(fromChain: number, toChain: number, asset: string) {
  // Fetch rates for both chains
  const [rateFrom, rateTo] = await Promise.all([
    fetch(`https://api.afxo.ai/v2/rates/USD/${asset}/signed?chainId=${fromChain}`),
    fetch(`https://api.afxo.ai/v2/rates/USD/${asset}/signed?chainId=${toChain}`),
  ]);

  const [dataFrom, dataTo] = await Promise.all([rateFrom.json(), rateTo.json()]);

  // Verify both
  const [validFrom, validTo] = [
    verifyAFXOPriceFeed(dataFrom, AFXO_SIGNER, fromChain),
    verifyAFXOPriceFeed(dataTo, AFXO_SIGNER, toChain),
  ];

  if (!validFrom.valid || !validTo.valid) {
    throw new Error('Price verification failed');
  }

  // Calculate exchange rate
  const priceFrom = formatPrice(dataFrom.feed.price, dataFrom.feed.decimals);
  const priceTo = formatPrice(dataTo.feed.price, dataTo.feed.decimals);

  return { priceFrom, priceTo, exchangeRate: priceTo / priceFrom };
}
```

---

## Security Considerations

### 1. Always Verify Signatures

**Never trust API responses without verification.**

```typescript
// ❌ WRONG - Dangerous!
const price = apiResponse.feed.price;

// ✅ CORRECT - Always verify first
const verification = verifyAFXOPriceFeed(apiResponse, AFXO_SIGNER, chainId);
if (!verification.valid) throw new Error('Invalid signature');
const price = apiResponse.feed.price;
```

### 2. Check Expiry

```typescript
const now = Math.floor(Date.now() / 1000);
if (now > feed.validUntil) {
  throw new Error('Signature expired');
}
```

### 3. Validate Chain ID

```typescript
if (feed.chainId !== expectedChainId) {
  throw new Error('Wrong chain');
}
```

### 4. Track Rounds

Prevent replay and detect out-of-order data:

```typescript
const lastRound = localStorage.getItem(`afxo:round:${feed.feedId}`);
if (lastRound && feed.round <= parseInt(lastRound)) {
  throw new Error('Stale or duplicate round');
}
localStorage.setItem(`afxo:round:${feed.feedId}`, feed.round.toString());
```

### 5. Enforce Confidence Thresholds

```typescript
const MIN_CONFIDENCE = 7000; // 70%
if (feed.confidence < MIN_CONFIDENCE) {
  throw new Error('Confidence too low');
}
```

### 6. Verify Provenance (Advanced)

Request source breakdown and verify aggregation hash:

```typescript
const receipt = await fetch(
  `https://api.afxo.ai/v2/rates/USD/KES/receipt?round=${feed.round}`
);
const { sources, method, timestamp } = await receipt.json();

// Recompute hash
const recomputedHash = keccak256(
  sources.sort().join(',') + '|' + method + '|' + timestamp
);

if (recomputedHash !== feed.aggregationHash) {
  throw new Error('Provenance mismatch');
}
```

---

## Migration from v1

### Breaking Changes

| v1 Field | v2 Equivalent | Notes |
|----------|---------------|-------|
| `pair` (string) | `feedId` (bytes32) | Now a hash instead of string |
| `rate` (number) | `price` (int256) | Now bigint with explicit decimals |
| (implicit) | `decimals` (uint8) | Now explicit in signed data |
| `confidence` (0-100) | `confidence` (0-10000) | Now in basis points |
| (none) | `sourceCount` | New field |
| `timestamp` | `timestamp` | Unchanged |
| `nonce` | `round` | Renamed and persisted across restarts |
| (implicit) | `validUntil` | Now explicit |
| (implicit) | `chainId` | Now in signed data |
| (none) | `aggregationHash` | New provenance field |

### Migration Guide

**Step 1: Update Type Definitions**

Replace v1 types with v2:

```typescript
// Old (v1)
interface OldFeed {
  pair: string;
  rate: number;
  confidence: number;
  timestamp: number;
}

// New (v2)
import { AFXOPriceFeedV2 } from './types';
```

**Step 2: Update Verification Logic**

```typescript
// Old (v1)
const signer = ethers.verifyMessage(message, signature);

// New (v2)
const signer = ethers.verifyTypedData(domain, types, feed, signature);
```

**Step 3: Update Price Handling**

```typescript
// Old (v1)
const price = feed.rate;

// New (v2)
const price = Number(feed.price) / 10 ** feed.decimals;
```

**Step 4: Update Confidence Checks**

```typescript
// Old (v1)
if (feed.confidence < 70) throw new Error('Low confidence');

// New (v2)
if (feed.confidence < 7000) throw new Error('Low confidence');
```

**Step 5: Add Round Tracking**

```typescript
// New requirement in v2
const lastRound = await db.getLastRound(feed.feedId);
if (feed.round <= lastRound) throw new Error('Stale round');
await db.setLastRound(feed.feedId, feed.round);
```

---

## Conclusion

The AFXO Signed Price Feed Standard v2 represents the state-of-the-art in oracle data formats. By combining:

- **Self-describing data** (explicit decimals, confidence, source counts)
- **Cryptographic provenance** (aggregation hashes)
- **Cross-chain safety** (embedded chain IDs)
- **Quality metrics** (confidence scores)
- **Replay protection** (monotonic rounds, expiry timestamps)

...AFXO v2 delivers the most complete, secure, and developer-friendly oracle standard available.

For integration support, visit [afxo.ai/docs](https://afxo.ai/docs) or contact [support@afxo.ai](mailto:support@afxo.ai).

---

**Document Version:** 2.0.0
**Copyright:** © 2025 Digitalyze Labs Ltd. All rights reserved.
**License:** This documentation is provided under MIT License for integration purposes. AFXO oracle services and smart contracts are proprietary.
