# AFXO Smart Contracts

AFXO oracles are deployed on Avalanche C-Chain as the canonical root (source of truth), with expansion planned to Celo, Base, Arbitrum, and Solana.

## Interface

All AFXO oracles implement the `IAFXOOracle` interface, which is fully compatible with Chainlink's `AggregatorV3Interface` plus AFXO-specific extensions.

```solidity
interface IAFXOOracle {
    // AggregatorV3 Compatible
    function decimals() external view returns (uint8);
    function description() external view returns (string memory);
    function version() external view returns (uint256);
    function getRoundData(uint80 _roundId) external view returns (...);
    function latestRoundData() external view returns (...);

    // AFXO Extensions
    function getConfidence() external view returns (uint8);
    function getSourceCount() external view returns (uint8);
    function minConfidence() external view returns (uint8);
    function isActive() external view returns (bool);
}
```

See the full interface: [`IAFXOOracle.sol`](../contracts/interfaces/IAFXOOracle.sol)

---

## Contract Addresses

### Access Control

All AFXO oracles use subscription-based access control. Calling `latestRoundData()` or other data-reading functions without a valid subscription will revert with `SubscriptionRequired()`.

To get access:
1. **Testnet**: Contact us for whitelist access for testing
2. **Mainnet**: Subscribe via [afxo.ai/get-access](https://afxo.ai/get-access)

### Avalanche C-Chain (Mainnet) — Chain ID: 43114

| Oracle | Address | Status |
|--------|---------|--------|
| All currencies | `Coming Soon` | Pending |

### Avalanche Fuji Testnet — Chain ID: 43113

All oracles deployed. **Whitelisted access required** — contact us to get testnet access.

#### African Currencies

| Oracle | Proxy Address | Status |
|--------|---------------|--------|
| KES/USD | `0x62200Cc809D7B80665caCF314c46d3d638c775b1` | Live |
| NGN/USD | `0xCaf356b38100CE40EDC125513C375E3b42E11D17` | Live |
| GHS/USD | `0xbE894Aa75Fa1dd6fA6B945B99DB71B18172F1086` | Live |
| ZAR/USD | `0x6E506531DE2Ad22c34B3b828E5865f8f12b91027` | Live |
| EGP/USD | `0x5848583f49Cf89Ecdbf5133EC237310f05642CDA` | Live |
| ETB/USD | `0x8027f2a5DC69Ca1384e71691881ecDC889d71339` | Live |
| TZS/USD | `0xC127e6B2350385bEb3167357d8eBECAe0f53eB15` | Live |
| UGX/USD | `0x61E2525165e7f0821Eb66213CeA2499B5DaF22Aa` | Live |
| CDF/USD | `0x36ee1436885296C510Bca75d70757950eBF1f515` | Live |
| XOF/USD | `0x1EB65d675a267d5661bDfDCE1bEEc907914d0Be0` | Live |
| XAF/USD | `0x157Dc97a60F72589A796096E03003181d2c52E08` | Live |
| MAD/USD | `0xdBd34927bE3f01f4b33d5eE548248FFCdC139d1a` | Live |
| DZD/USD | `0x0305e08356a59a0F8770741f27E64D47cf457C8e` | Live |
| TND/USD | `0x5218C22CaD04f80F1885eF4e7fBd154C692d96f9` | Live |
| AOA/USD | `0xDc17EbA71070C4076136ee01A2e2Fd46Cd2C8B9B` | Live |
| ZMW/USD | `0x8F55972FE4C5738CF24F5107E88AD1e20Ee2F85F` | Live |
| RWF/USD | `0x04da49d1fd6B9505edce5EE1f9573CA530E6Df37` | Live |
| MWK/USD | `0x71ec2FE49A1B1c92FF83Ef7224515E9679791143` | Live |
| MZN/USD | `0x57DA1755f5b5ACe9CDCafC469E6d5ddB6a389568` | Live |
| BWP/USD | `0x75081F8Dc3B18EF8CE6b6Cacc8944180955e1083` | Live |
| SZL/USD | `0xB12343ae368b8fC8CcC8b09d7F59d0C56921dcF8` | Live |
| LSL/USD | `0x50Ee23F48299Eda8438cFf1DE7E1CDf82a515d3D` | Live |

#### Trade Partner Currencies

| Oracle | Proxy Address | Status |
|--------|---------------|--------|
| AED/USD | `0xAb8c78DE20f43049873A104D7252942a80936D7a` | Live |
| INR/USD | `0x70E43D295163a979c39F7f374F1464bE397E821C` | Live |
| CNY/USD | `0x39ABE8575BC92329324835e17c7B88FC2f3f2E9D` | Live |
| EUR/USD | `0x6745a4fb0D19Fa911BEbb7cDC2eb8A12138Cb149` | Live |
| GBP/USD | `0x0027BC8eEA7Adf7CeA70B7Fc60A935509501b41B` | Live |

> **Note**: All contracts share the same implementation: `0xdBFbFb8323A2170a3feD2f1f4D5c26A91aa58084`

---

## Integration Guide

### Basic Usage

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../interfaces/IAFXOOracle.sol";

contract PriceConsumer {
    IAFXOOracle public oracle;

    constructor(address _oracle) {
        oracle = IAFXOOracle(_oracle);
    }

    function getLatestPrice() public view returns (int256) {
        (
            ,
            int256 price,
            ,
            ,
        ) = oracle.latestRoundData();
        return price;
    }
}
```

### With Freshness Check

```solidity
function getPrice() public view returns (int256) {
    (
        ,
        int256 price,
        ,
        uint256 updatedAt,
    ) = oracle.latestRoundData();

    // Require data to be less than 1 hour old
    require(block.timestamp - updatedAt < 3600, "Stale price data");

    return price;
}
```

### With Confidence Check (Recommended)

```solidity
function getPriceWithConfidence() public view returns (int256 price, uint8 confidence) {
    (
        ,
        price,
        ,
        uint256 updatedAt,
    ) = oracle.latestRoundData();

    // Check freshness
    require(block.timestamp - updatedAt < 3600, "Stale price data");

    // Get confidence score
    confidence = oracle.getConfidence();

    // Require minimum confidence for critical operations
    require(confidence >= 70, "Confidence too low");

    return (price, confidence);
}
```

### Using the Registry

```solidity
interface IAFXORegistry {
    function getOracle(string memory pair) external view returns (address);
    function isSupported(string memory pair) external view returns (bool);
}

contract MultiCurrencyConsumer {
    IAFXORegistry public registry;

    constructor(address _registry) {
        registry = IAFXORegistry(_registry);
    }

    function getRate(string memory pair) public view returns (int256) {
        address oracleAddr = registry.getOracle(pair);
        require(oracleAddr != address(0), "Unsupported pair");

        IAFXOOracle oracle = IAFXOOracle(oracleAddr);
        (, int256 price,,,) = oracle.latestRoundData();

        return price;
    }
}
```

---

## Price Format

- **Decimals**: Always 8 (call `decimals()` to confirm)
- **Format**: Price of 1 unit of base currency in quote currency
- **Example**: KES/USD rate of `0.00770000` is stored as `770000`

```solidity
// To get human-readable price:
int256 rawPrice = 770000; // from oracle
uint8 decimals = oracle.decimals(); // 8
// Actual price = 770000 / 10^8 = 0.0077 USD per 1 KES
```

---

## Confidence Scores

AFXO provides confidence scores indicating data reliability:

| Score | Band | Meaning |
|-------|------|---------|
| 85-100 | High | Settlement-grade reliability |
| 70-84 | Medium | Suitable for most applications |
| 50-69 | Low | Limited sources, use with caution |
| <50 | Critical | Consider pausing operations |

```solidity
uint8 confidence = oracle.getConfidence();

if (confidence >= 85) {
    // High confidence - proceed normally
} else if (confidence >= 70) {
    // Medium confidence - proceed with caution
} else {
    // Low confidence - consider circuit breaker
    revert("Confidence below threshold");
}
```

---

## Security Best Practices

### 1. Always Check Freshness

```solidity
require(block.timestamp - updatedAt < MAX_STALENESS, "Stale data");
```

### 2. Implement Circuit Breakers

```solidity
modifier whenConfident() {
    require(oracle.getConfidence() >= MIN_CONFIDENCE, "Low confidence");
    _;
}
```

### 3. Handle Edge Cases

```solidity
function safeGetPrice() public view returns (int256) {
    require(oracle.isActive(), "Oracle inactive");

    (, int256 price,, uint256 updatedAt,) = oracle.latestRoundData();

    require(price > 0, "Invalid price");
    require(updatedAt > 0, "No data");
    require(block.timestamp - updatedAt < 3600, "Stale data");

    return price;
}
```

### 4. Consider Multiple Oracles for Critical Operations

For high-value operations, consider validating against multiple sources or implementing price deviation checks.

---

## Chain Roadmap

| Chain | Status | Chain ID |
|-------|--------|----------|
| Avalanche C-Chain | **Live** | 43114 |
| Celo | Next | 42220 |
| Base | Planned | 8453 |
| Arbitrum | Planned | 42161 |
| Solana | Future | N/A |

---

## Support

- **Documentation**: [afxo.ai/docs](https://afxo.ai/docs)
- **Network Status**: [afxo.ai/network](https://afxo.ai/network)
- **Contact**: [afxo.ai/contact](https://afxo.ai/contact)
