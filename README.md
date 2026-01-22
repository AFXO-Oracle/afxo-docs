# AFXO — Emerging Markets FX Oracle

[![Website](https://img.shields.io/badge/Website-afxo.ai-C1A464)](https://afxo.ai)
[![Docs](https://img.shields.io/badge/Docs-Documentation-blue)](https://afxo.ai/docs)
[![Network](https://img.shields.io/badge/Network-Avalanche-E84142)](https://afxo.ai/network)

**The only institutional-grade FX oracle with deep emerging market coverage and economic intelligence.** Multi-source aggregation, AI quality control, and on-chain delivery for DeFi protocols and financial institutions.

## Overview

AFXO provides reliable, verifiable FX rates for **50+ currencies** that existing oracles don't adequately cover — including African, Latin American, and Asian emerging market currencies. Unlike Chainlink and Pyth, AFXO also provides **economic intelligence signals**: volatility regimes, carry trade recommendations, and interest rate data.

### Key Features

- **Multi-Source Aggregation** — Rates aggregated from 10+ institutional data sources per currency
- **AI Quality Control** — ML-powered anomaly detection and confidence scoring
- **On-Chain Delivery** — Avalanche C-Chain as canonical root, expanding to Celo, Base, Arbitrum, Solana
- **Industry-Standard Interface** — Drop-in compatible with existing DeFi protocols
- **Decentralized Verification** — Multi-operator consensus before any rate is published

## Supported Currencies (50+ Live)

### African Currencies (23)

#### East Africa
| Code | Currency |
|------|----------|
| KES | Kenyan Shilling |
| ETB | Ethiopian Birr |
| TZS | Tanzanian Shilling |
| UGX | Ugandan Shilling |
| RWF | Rwandan Franc |
| MUR | Mauritian Rupee |

#### West Africa
| Code | Currency |
|------|----------|
| NGN | Nigerian Naira |
| GHS | Ghanaian Cedi |
| XOF | CFA Franc (BCEAO) |

#### Central Africa
| Code | Currency |
|------|----------|
| CDF | Congolese Franc |
| XAF | CFA Franc (BEAC) |
| AOA | Angolan Kwanza |

#### Southern Africa
| Code | Currency |
|------|----------|
| ZAR | South African Rand |
| ZMW | Zambian Kwacha |
| MWK | Malawian Kwacha |
| MZN | Mozambican Metical |
| BWP | Botswana Pula |
| SZL | Swazi Lilangeni |
| LSL | Lesotho Loti |

#### North Africa
| Code | Currency |
|------|----------|
| EGP | Egyptian Pound |
| MAD | Moroccan Dirham |
| DZD | Algerian Dinar |
| TND | Tunisian Dinar |

### Latin America (6)
| Code | Currency |
|------|----------|
| BRL | Brazilian Real |
| MXN | Mexican Peso |
| ARS | Argentine Peso |
| COP | Colombian Peso |
| CLP | Chilean Peso |
| PEN | Peruvian Sol |

### Southeast Asia & East Asia (6)
| Code | Currency |
|------|----------|
| SGD | Singapore Dollar |
| HKD | Hong Kong Dollar |
| KRW | South Korean Won |
| THB | Thai Baht |
| PHP | Philippine Peso |
| VND | Vietnamese Dong |

### G10 Currencies (11)
| Code | Currency |
|------|----------|
| USD | US Dollar |
| EUR | Euro |
| GBP | British Pound |
| JPY | Japanese Yen |
| CHF | Swiss Franc |
| AUD | Australian Dollar |
| CAD | Canadian Dollar |
| NZD | New Zealand Dollar |
| SEK | Swedish Krona |
| NOK | Norwegian Krone |
| DKK | Danish Krone |

### Other Emerging Markets
| Code | Currency |
|------|----------|
| AED | UAE Dirham |
| INR | Indian Rupee |
| CNY | Chinese Yuan |
| TRY | Turkish Lira |

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

## Economic Intelligence (What Makes AFXO Different)

AFXO is more than a price feed — it's a **market intelligence platform**. Every currency pair includes economic signals that Chainlink and Pyth don't provide.

### Market Signals

| Signal | Description | Use Case |
|--------|-------------|----------|
| **Volatility Regime** | LOW / NORMAL / HIGH / EXTREME classification | Position sizing, risk limits |
| **Realized Volatility** | 7d, 30d, 90d annualized volatility | Hedging, options pricing |
| **Momentum** | 1d, 7d, 30d rate of change | Trend following strategies |
| **Mean Reversion** | Z-score, Bollinger band position | Mean reversion strategies |

### Carry Trade Signals

| Currency | Policy Rate | Spread vs USD | Signal |
|----------|-------------|---------------|--------|
| NGN | 27.50% | +23.00% | **LONG** |
| GHS | 27.00% | +22.50% | **LONG** |
| KES | 12.00% | +7.50% | **LONG** |
| ZAR | 7.75% | +3.25% | NEUTRAL |
| BRL | 13.25% | +8.75% | **LONG** |
| MXN | 10.25% | +5.75% | **LONG** |

### Economic Data

- Central bank policy rates (12 countries)
- Inflation data (CPI/core inflation)
- Real rate calculations
- Central bank meeting calendars

### API Example

```bash
curl -X GET "https://api.afxo.ai/v1/intelligence/KES" \
  -H "X-API-Key: your_api_key"
```

Response:
```json
{
  "currency": "KES",
  "volatility": {
    "regime": "NORMAL",
    "realized_7d": 8.2,
    "realized_30d": 12.4,
    "percentile": 45
  },
  "carryTrade": {
    "signal": "LONG",
    "policyRate": 12.0,
    "spreadVsUSD": 7.5,
    "realRate": 4.2
  },
  "momentum": {
    "direction": "BEARISH",
    "roc_7d": -0.8,
    "roc_30d": -2.1
  }
}
```

## Documentation

| Document | Description |
|----------|-------------|
| [Signed Price Feeds v2](./docs/signed-price-feeds-v2.md) | **NEW:** Complete technical specification - EIP-712 signed data standard |
| [v2 One-Page Summary](./docs/v2-one-page-summary.md) | Quick reference card for AFXO v2 (print-friendly) |
| [Quick Start: Signed Feeds](./docs/quick-start-signed-feeds.md) | Integration guide - get started in 5 minutes |
| [AFXO vs Chainlink vs Pyth](./docs/comparison-chainlink-pyth.md) | **NEW:** Detailed competitive analysis - why AFXO v2 wins |
| [Economic Intelligence](./docs/economic-intelligence.md) | **NEW:** Market signals, carry trade, and macro data |
| [API Reference](./docs/api-reference.md) | REST & WebSocket API documentation |
| [Smart Contracts](./docs/smart-contracts.md) | Contract addresses and integration guide |
| [Methodology](./docs/methodology.md) | How rates are calculated and validated |
| [Confidence Scoring](./docs/confidence-scoring.md) | Understanding confidence scores |

## Contract Addresses

> **Access Control**: All oracles require subscription or whitelist access. Unauthorized calls will revert with `SubscriptionRequired()`.

### Avalanche C-Chain (Mainnet) — Chain ID: 43114

| Oracle | Address |
|--------|---------|
| All currencies | `Coming Soon` |

### Avalanche Fuji (Testnet) — Chain ID: 43113

All 27 oracles deployed and live. [See full address list →](./docs/smart-contracts.md#avalanche-fuji-testnet--chain-id-43113)

Key addresses:
| Oracle | Proxy Address |
|--------|---------------|
| KES/USD | `0x62200Cc809D7B80665caCF314c46d3d638c775b1` |
| NGN/USD | `0xCaf356b38100CE40EDC125513C375E3b42E11D17` |
| GHS/USD | `0xbE894Aa75Fa1dd6fA6B945B99DB71B18172F1086` |
| ZAR/USD | `0x6E506531DE2Ad22c34B3b828E5865f8f12b91027` |
| ETB/USD | `0x8027f2a5DC69Ca1384e71691881ecDC889d71339` |

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
