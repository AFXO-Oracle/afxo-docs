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

### Avalanche C-Chain (Mainnet) — Chain ID: 43114

| Oracle | Address | Status |
|--------|---------|--------|
| KES/USD | `Coming Soon` | Pending |
| NGN/USD | `Coming Soon` | Pending |
| GHS/USD | `Coming Soon` | Pending |
| ZAR/USD | `Coming Soon` | Pending |
| AFXORegistry | `Coming Soon` | Pending |

### Avalanche Fuji Testnet — Chain ID: 43113

| Oracle | Address | Status |
|--------|---------|--------|
| KES/USD | See [afxo.ai/docs/contracts](https://afxo.ai/docs/contracts) | Live |
| NGN/USD | See [afxo.ai/docs/contracts](https://afxo.ai/docs/contracts) | Live |
| AFXORegistry | See [afxo.ai/docs/contracts](https://afxo.ai/docs/contracts) | Live |

> **Note**: Testnet addresses are updated frequently. Check the website for current addresses.

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
