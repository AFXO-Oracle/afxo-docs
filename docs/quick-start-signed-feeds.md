# Quick Start: AFXO Signed Price Feeds v2

**Author:** Vincent Scaturchio
**Last Updated:** 2026-01-21

Get up and running with AFXO Signed Price Feeds v2 in under 5 minutes.

---

## 1. Installation

```bash
npm install ethers@^6.13.0
```

---

## 2. Fetch a Signed Price Feed

```typescript
// Fetch USD/KES rate for Avalanche C-Chain
const response = await fetch(
  'https://api.afxo.ai/v2/rates/USD/KES/signed?chainId=43114',
  {
    headers: {
      'X-API-Key': 'your_api_key' // Get key at afxo.ai/get-access
    }
  }
);

const data = await response.json();
```

**Response:**
```json
{
  "success": true,
  "version": "2.0.0",
  "feed": {
    "feedId": "0x...",
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
  "signer": "0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd"
}
```

---

## 3. Verify the Signature

Copy `VerificationHelperV2.ts` from the AFXO aggregator to your project, or use this simplified version:

```typescript
import { ethers } from 'ethers';

const AFXO_TYPES = {
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

function verifySignature(data: any, expectedSigner: string, expectedChainId: number) {
  const feed = {
    feedId: data.feed.feedId,
    price: BigInt(data.feed.price),
    decimals: data.feed.decimals,
    confidence: data.feed.confidence,
    sourceCount: data.feed.sourceCount,
    timestamp: data.feed.timestamp,
    validUntil: data.feed.validUntil,
    round: data.feed.round,
    chainId: data.feed.chainId,
    aggregationHash: data.feed.aggregationHash,
  };

  const recoveredSigner = ethers.verifyTypedData(
    data.domain,
    AFXO_TYPES,
    feed,
    data.signature.packed
  );

  const signatureValid = recoveredSigner.toLowerCase() === expectedSigner.toLowerCase();
  const chainIdValid = feed.chainId === expectedChainId;
  const notExpired = Math.floor(Date.now() / 1000) <= feed.validUntil;

  return signatureValid && chainIdValid && notExpired;
}

// Usage
const AFXO_SIGNER = '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd';
const isValid = verifySignature(data, AFXO_SIGNER, 43114);

if (!isValid) {
  throw new Error('Invalid signature');
}
```

---

## 4. Use the Price

```typescript
// Convert price to decimal
const price = Number(data.feed.price) / 10 ** data.feed.decimals;
console.log(`USD/KES: ${price}`); // 0.0077

// Check confidence
const confidencePct = data.feed.confidence / 100;
console.log(`Confidence: ${confidencePct}%`); // 87.5%

// Check freshness
const age = Math.floor(Date.now() / 1000) - data.feed.timestamp;
console.log(`Data age: ${age} seconds`);
```

---

## 5. Complete Example

```typescript
import { ethers } from 'ethers';

const AFXO_API = 'https://api.afxo.ai';
const AFXO_SIGNER = '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd';
const CHAIN_ID = 43114; // Avalanche C-Chain

async function getVerifiedPrice(base: string, quote: string) {
  // 1. Fetch signed rate
  const response = await fetch(
    `${AFXO_API}/v2/rates/${base}/${quote}/signed?chainId=${CHAIN_ID}`,
    {
      headers: { 'X-API-Key': process.env.AFXO_API_KEY }
    }
  );

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();

  // 2. Verify signature
  const feed = {
    feedId: data.feed.feedId,
    price: BigInt(data.feed.price),
    decimals: data.feed.decimals,
    confidence: data.feed.confidence,
    sourceCount: data.feed.sourceCount,
    timestamp: data.feed.timestamp,
    validUntil: data.feed.validUntil,
    round: data.feed.round,
    chainId: data.feed.chainId,
    aggregationHash: data.feed.aggregationHash,
  };

  const recoveredSigner = ethers.verifyTypedData(
    data.domain,
    {
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
    },
    feed,
    data.signature.packed
  );

  if (recoveredSigner.toLowerCase() !== AFXO_SIGNER.toLowerCase()) {
    throw new Error('Invalid signature');
  }

  if (feed.chainId !== CHAIN_ID) {
    throw new Error('Wrong chain ID');
  }

  const now = Math.floor(Date.now() / 1000);
  if (now > feed.validUntil) {
    throw new Error('Signature expired');
  }

  // 3. Check quality
  if (feed.confidence < 7000) {
    console.warn(`Low confidence: ${feed.confidence / 100}%`);
  }

  if (feed.sourceCount < 3) {
    console.warn(`Low source count: ${feed.sourceCount}`);
  }

  // 4. Return price
  const price = Number(feed.price) / 10 ** feed.decimals;

  return {
    pair: data.feed.pair,
    price,
    confidence: feed.confidence / 100,
    sourceCount: feed.sourceCount,
    round: feed.round,
    timestamp: feed.timestamp,
  };
}

// Usage
const rate = await getVerifiedPrice('USD', 'KES');
console.log(rate);
// {
//   pair: 'USD/KES',
//   price: 0.0077,
//   confidence: 87.5,
//   sourceCount: 6,
//   round: 12345,
//   timestamp: 1737460800
// }
```

---

## 6. Solidity Integration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "@openzeppelin/contracts/utils/cryptography/EIP712.sol";

contract AFXOConsumer is EIP712 {
    using ECDSA for bytes32;

    address public constant AFXO_SIGNER = 0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd;

    bytes32 private constant TYPEHASH = keccak256(
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

    function useSignedPrice(
        AFXOPriceFeed calldata feed,
        bytes calldata signature
    ) external view returns (int256) {
        // Verify not expired
        require(block.timestamp <= feed.validUntil, "Expired");

        // Verify chain ID
        require(feed.chainId == block.chainid, "Wrong chain");

        // Verify minimum confidence
        require(feed.confidence >= 7000, "Low confidence");

        // Verify signature
        bytes32 structHash = keccak256(
            abi.encode(
                TYPEHASH,
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

## 7. Security Checklist

Before using signed price feeds in production:

- ✅ **Always verify signature** - Never trust API responses without verification
- ✅ **Check expiry** - Verify `block.timestamp <= validUntil` (Solidity) or `now <= validUntil` (TypeScript)
- ✅ **Validate chain ID** - Ensure `feed.chainId === expectedChainId`
- ✅ **Enforce confidence threshold** - Require `confidence >= 7000` (70%) minimum
- ✅ **Track rounds** - Detect out-of-order or duplicate data by tracking `round` numbers
- ✅ **Check source count** - Warn if `sourceCount < 3`
- ✅ **Use HTTPS** - Always use `https://api.afxo.ai` (never HTTP)
- ✅ **Store API key securely** - Use environment variables, never commit to git

---

## 8. Common Issues

### "Invalid signature"

- Check that `AFXO_SIGNER` address is correct
- Verify you're using the correct domain (name: "AFXO Oracle", version: "2")
- Ensure `chainId` matches between request and verification

### "Signature expired"

- Fetch a fresh signature from the API
- Check your system clock is correct
- Reduce `validity` query parameter if needed (default: 300 seconds)

### "Low confidence"

- This is a warning, not an error - data quality is below ideal
- Check `metadata.sources` to see which sources failed
- Consider using a different currency pair with better data availability
- Contact AFXO support if confidence is consistently low

### "Wrong chain"

- Ensure `chainId` query parameter matches your target chain
- Verify `feed.chainId` in response matches expected chain
- Check you're not accidentally mixing testnet/mainnet

---

## 9. Next Steps

- **Full Documentation**: [Signed Price Feeds v2](./signed-price-feeds-v2.md)
- **API Reference**: [API Documentation](./api-reference.md)
- **Smart Contracts**: [Contract Addresses](./smart-contracts.md)
- **Support**: support@afxo.ai

---

## 10. Reference Constants

```typescript
// AFXO Constants
export const AFXO = {
  API_URL: 'https://api.afxo.ai',
  SIGNER: '0xd06d98F345B0DD3E21F04CA9FD5e27f6835E03Fd',

  DOMAIN: {
    name: 'AFXO Oracle',
    version: '2',
  },

  CHAIN_IDS: {
    ETHEREUM: 1,
    AVALANCHE: 43114,
    POLYGON: 137,
    ARBITRUM: 42161,
    BASE: 8453,
    FSC_L1: 888888, // FiatRails
  },

  THRESHOLDS: {
    MIN_CONFIDENCE: 7000, // 70%
    RECOMMENDED_CONFIDENCE: 8000, // 80%
    MIN_SOURCE_COUNT: 3,
    MAX_AGE_SECONDS: 60,
  },

  DECIMALS: {
    STANDARD: 8, // Chainlink compatible
  },
};
```

---

**Get your API key**: [afxo.ai/get-access](https://afxo.ai/get-access)

**Questions?** Contact support@afxo.ai
