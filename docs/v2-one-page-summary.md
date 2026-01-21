# AFXO Signed Price Feed Standard v2 - One Page Summary

**Version:** 2.0.0 | **Author:** Vincent Scaturchio | **Date:** 2026-01-21

---

## What is AFXO v2?

A world-class EIP-712 signed data standard for oracle price feeds, combining the best of Chainlink (reliability) and Pyth (signed data) while adding unique innovations.

---

## Core Data Structure (10 Fields)

```typescript
{
  feedId: bytes32;           // keccak256("AFXO:USD/KES:v2")
  price: int256;             // 770000 (with 8 decimals = 0.0077)
  decimals: uint8;           // 8 (Chainlink standard)
  confidence: uint16;        // 8750 (87.5% in basis points)
  sourceCount: uint8;        // 6 sources used
  timestamp: uint64;         // 1737460800 (when aggregated)
  validUntil: uint64;        // 1737461100 (expiry)
  round: uint64;             // 12345 (monotonic)
  chainId: uint64;           // 43114 (Avalanche)
  aggregationHash: bytes32;  // 0x... (provenance proof)
}
```

---

## Why AFXO v2 is Superior

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| Self-describing (explicit decimals) | ✅ | ❌ | ✅ |
| Confidence score | ✅ | ❌ | ✅ |
| Source count | ✅ | ❌ | ⚠️ |
| Simple monotonic rounds | ✅ | ❌ | ❌ |
| Explicit expiry | ✅ | ⚠️ | ❌ |
| Provenance hash | ✅ | ❌ | ❌ |
| Off-chain verification | ✅ | ❌ | ✅ |
| Emerging market coverage | ✅ | ❌ | ❌ |

**Unique to AFXO:** Provenance hash (only oracle with full auditability)

---

## Quick Integration

### 1. Fetch Signed Price

```bash
curl "https://api.afxo.ai/v2/rates/USD/KES/signed?chainId=43114"
```

### 2. Verify Signature (TypeScript)

```typescript
import { ethers } from 'ethers';

const recoveredSigner = ethers.verifyTypedData(
  domain,
  AFXO_PRICE_FEED_V2_TYPES,
  feed,
  signature.packed
);
```

### 3. Use Price

```typescript
const price = Number(feed.price) / 10 ** feed.decimals;
const confidence = feed.confidence / 100; // 87.5%
```

---

## Security Checklist

- ✅ Verify signature before using price
- ✅ Check `block.timestamp <= validUntil`
- ✅ Validate `feed.chainId === expectedChainId`
- ✅ Require `feed.confidence >= 7000` (70%)
- ✅ Track rounds to detect out-of-order data
- ✅ Check `feed.sourceCount >= 3`

---

## EIP-712 Types

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

---

## Use Cases

1. **DeFi Lending**: Quality metrics to pause if confidence drops
2. **Cross-Chain Bridge**: Off-chain verification before bridging
3. **Audit/Compliance**: Provenance hash proves sources used
4. **Emerging Markets**: 27 African currencies live

---

## Key Constants

```typescript
AFXO_API_URL = 'https://api.afxo.ai'
AFXO_SIGNER = '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd'
DOMAIN_NAME = 'AFXO Oracle'
DOMAIN_VERSION = '2'
STANDARD_DECIMALS = 8
MIN_CONFIDENCE = 7000 // 70%
```

---

## Documentation Links

- **Full Spec**: [signed-price-feeds-v2.md](./signed-price-feeds-v2.md)
- **Quick Start**: [quick-start-signed-feeds.md](./quick-start-signed-feeds.md)
- **Comparison**: [comparison-chainlink-pyth.md](./comparison-chainlink-pyth.md)
- **API Docs**: [api-reference.md](./api-reference.md)

---

## Get Started

1. Get API key: [afxo.ai/get-access](https://afxo.ai/get-access)
2. Read quick start: < 5 minutes to integration
3. Deploy and verify: Full working example in docs
4. Go live: Production-ready, used by FiatRails

---

**Support:** support@afxo.ai | **Website:** [afxo.ai](https://afxo.ai) | **Docs:** [afxo.ai/docs](https://afxo.ai/docs)
