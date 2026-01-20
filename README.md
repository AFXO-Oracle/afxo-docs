# AFXO — Emerging Markets FX Oracle

[![Website](https://img.shields.io/badge/Website-afxo.ai-C1A464)](https://afxo.ai)
[![Docs](https://img.shields.io/badge/Docs-Documentation-blue)](https://afxo.ai/docs)
[![Network](https://img.shields.io/badge/Network-Avalanche-E84142)](https://afxo.ai/network)

**Institutional-grade FX data infrastructure for emerging markets.** Multi-source aggregation, AI quality control, and on-chain delivery for DeFi protocols and financial institutions.

## Overview

AFXO provides reliable, verifiable FX rates for 27+ currencies that existing oracles don't adequately cover — including African, Middle Eastern, and Asian emerging market currencies.

### Key Features

- **Multi-Source Aggregation** — Rates aggregated from 10+ institutional data sources per currency
- **AI Quality Control** — ML-powered anomaly detection and confidence scoring
- **On-Chain Delivery** — Avalanche C-Chain as canonical root, expanding to Celo, Base, Arbitrum, Solana
- **AggregatorV3 Compatible** — Drop-in replacement for Chainlink-compatible protocols
- **Decentralized Verification** — Multi-operator consensus before any rate is published

## Supported Currencies

### African Currencies
| Code | Currency | Code | Currency |
|------|----------|------|----------|
| KES | Kenyan Shilling | NGN | Nigerian Naira |
| GHS | Ghanaian Cedi | ZAR | South African Rand |
| EGP | Egyptian Pound | ETB | Ethiopian Birr |
| TZS | Tanzanian Shilling | UGX | Ugandan Shilling |
| XOF | CFA Franc (BCEAO) | XAF | CFA Franc (BEAC) |
| MAD | Moroccan Dirham | CDF | Congolese Franc |
| ... | And more | | |

### Reference Currencies
AED, INR, CNY, EUR, GBP

## Quick Start

### Solidity Integration

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "./interfaces/IAFXOOracle.sol";

contract MyProtocol {
    IAFXOOracle public kesOracle;

    constructor(address _kesOracle) {
        kesOracle = IAFXOOracle(_kesOracle);
    }

    function getKESPrice() external view returns (int256) {
        (
            ,
            int256 price,
            ,
            uint256 updatedAt,
        ) = kesOracle.latestRoundData();

        // Check data freshness
        require(block.timestamp - updatedAt < 3600, "Stale data");

        // Check confidence (recommended)
        require(kesOracle.getConfidence() >= 70, "Low confidence");

        return price; // 8 decimals
    }
}
```

### REST API

```bash
curl -X GET "https://api.afxo.ai/v1/rates/KES/USD" \
  -H "X-API-Key: your_api_key"
```

Response:
```json
{
  "pair": "KES/USD",
  "rate": "0.00770000",
  "confidence": 94,
  "sources": 6,
  "timestamp": "2025-01-20T12:00:00Z"
}
```

### JavaScript/TypeScript

```typescript
import { AFXOClient } from '@afxo/sdk';

const client = new AFXOClient({ apiKey: 'your_api_key' });

// Get current rate
const rate = await client.getRate('KES', 'USD');
console.log(rate.price, rate.confidence);

// Subscribe to updates
client.subscribe('KES/USD', (update) => {
  console.log('New rate:', update.price);
});
```

## Documentation

| Document | Description |
|----------|-------------|
| [API Reference](./docs/api-reference.md) | REST & WebSocket API documentation |
| [Smart Contracts](./docs/smart-contracts.md) | Contract addresses and integration guide |
| [Methodology](./docs/methodology.md) | How rates are calculated and validated |
| [Confidence Scoring](./docs/confidence-scoring.md) | Understanding confidence scores |

## Contract Addresses

### Avalanche C-Chain (Mainnet)

| Oracle | Address |
|--------|---------|
| KES/USD | `Coming Soon` |
| NGN/USD | `Coming Soon` |
| Registry | `Coming Soon` |

### Avalanche Fuji (Testnet)

| Oracle | Address |
|--------|---------|
| KES/USD | See [contracts page](https://afxo.ai/docs/contracts) |
| NGN/USD | See [contracts page](https://afxo.ai/docs/contracts) |

## Examples

- [JavaScript Examples](./examples/javascript/) — Node.js and browser integration
- [Python Examples](./examples/python/) — Python SDK usage
- [Solidity Examples](./examples/solidity/) — Smart contract integration patterns

## Pricing

| Plan | Update Frequency | Rate Limit |
|------|------------------|------------|
| Sandbox | Daily | 100 req/day |
| Starter ($49/mo) | Hourly | 1,000 req/day |
| Builder ($99/mo) | 5-minute | 10,000 req/day |
| Growth ($299/mo) | 1-minute | 100,000 req/day |
| Enterprise | Sub-minute | Unlimited |

[View full pricing →](https://afxo.ai/get-access)

## Security

- Multi-signature on-chain updates
- Rate change limits enforced on-chain
- Minimum confidence thresholds
- Full audit trail for all updates

## Links

- **Website**: [afxo.ai](https://afxo.ai)
- **Documentation**: [afxo.ai/docs](https://afxo.ai/docs)
- **Network Status**: [afxo.ai/network](https://afxo.ai/network)
- **API Access**: [afxo.ai/get-access](https://afxo.ai/get-access)

## License

This documentation and example code is provided under the MIT License for integration purposes.

**Note**: The AFXO oracle smart contracts and backend services are proprietary software owned by Digitalyze Labs Ltd.

---

Built with Avalanche. Powered by institutional-grade data infrastructure.
