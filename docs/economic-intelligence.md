# AFXO Economic Intelligence

> **What makes AFXO different from Chainlink and Pyth**

AFXO is more than a price feed — it's a **market intelligence platform**. Every currency pair includes economic signals that help you make better trading and risk management decisions.

## Overview

| Feature | AFXO | Chainlink | Pyth |
|---------|------|-----------|------|
| FX Prices | ✅ | ✅ | ✅ |
| Confidence Scores | ✅ | ❌ | ✅ |
| Volatility Signals | ✅ | ❌ | ❌ |
| Carry Trade Signals | ✅ | ❌ | ❌ |
| Interest Rate Data | ✅ | ❌ | ❌ |
| Momentum Indicators | ✅ | ❌ | ❌ |
| African Currencies | ✅ (20) | ❌ | ❌ |
| LatAm Currencies | ✅ (6) | ❌ | ❌ |

## Market Intelligence Signals

### Volatility Analysis

Every AFXO price feed includes real-time volatility metrics:

| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| `volatility.regime` | LOW / NORMAL / HIGH / EXTREME | Per update |
| `volatility.realized_7d` | 7-day annualized volatility | Hourly |
| `volatility.realized_30d` | 30-day annualized volatility | Hourly |
| `volatility.realized_90d` | 90-day annualized volatility | Daily |
| `volatility.percentile` | Current vol vs historical (0-100) | Hourly |

**Use Cases:**
- **Position Sizing**: Reduce position size when volatility is HIGH/EXTREME
- **Stop Loss Calibration**: Wider stops in high-vol regimes
- **Options Pricing**: Use realized vol for delta hedging
- **Risk Limits**: Automatic position limits based on regime

### Momentum Indicators

Track trend direction and strength:

| Metric | Description |
|--------|-------------|
| `momentum.direction` | BULLISH / BEARISH / NEUTRAL |
| `momentum.roc_1d` | 1-day rate of change (%) |
| `momentum.roc_7d` | 7-day rate of change (%) |
| `momentum.roc_30d` | 30-day rate of change (%) |
| `momentum.twap_24h` | 24-hour time-weighted average price |
| `momentum.ewma` | Exponential weighted moving average |

**Use Cases:**
- **Trend Following**: Enter positions aligned with momentum
- **Mean Reversion**: Counter-trade extreme momentum readings
- **TWAP Execution**: Use TWAP for large order execution

### Mean Reversion Signals

Statistical indicators for mean reversion strategies:

| Metric | Description |
|--------|-------------|
| `meanReversion.zScore` | Standard deviations from mean (-3 to +3) |
| `meanReversion.bollingerPosition` | Position within Bollinger bands (0-100) |
| `meanReversion.deviationFromMA20` | % deviation from 20-day MA |
| `meanReversion.deviationFromMA50` | % deviation from 50-day MA |

**Interpretation:**
- Z-score > +2: Overbought, consider short
- Z-score < -2: Oversold, consider long
- Bollinger > 95: Near upper band (overbought)
- Bollinger < 5: Near lower band (oversold)

## Carry Trade Intelligence

### Current Interest Rates (January 2026)

| Currency | Central Bank | Policy Rate | Spread vs USD | Signal |
|----------|--------------|-------------|---------------|--------|
| NGN | CBN | 27.50% | +23.00% | **LONG** |
| GHS | BOG | 27.00% | +22.50% | **LONG** |
| KES | CBK | 12.00% | +7.50% | **LONG** |
| BRL | BCB | 13.25% | +8.75% | **LONG** |
| MXN | Banxico | 10.25% | +5.75% | **LONG** |
| ZAR | SARB | 7.75% | +3.25% | NEUTRAL |
| TZS | BOT | 6.00% | +1.50% | NEUTRAL |
| ETB | NBE | 7.00% | +2.50% | NEUTRAL |
| USD | Fed | 4.50% | — | Reference |

### Carry Trade API

```bash
curl -X GET "https://api.afxo.ai/v1/signals/carry-trade" \
  -H "X-API-Key: your_api_key"
```

Response:
```json
{
  "signals": [
    {
      "currency": "NGN",
      "baseCurrency": "USD",
      "policyRate": 27.5,
      "spreadVsUSD": 23.0,
      "signal": "LONG",
      "realRate": 5.2,
      "inflationRate": 22.3,
      "lastUpdated": "2026-01-21T00:00:00Z"
    },
    {
      "currency": "KES",
      "baseCurrency": "USD",
      "policyRate": 12.0,
      "spreadVsUSD": 7.5,
      "signal": "LONG",
      "realRate": 4.2,
      "inflationRate": 7.8,
      "lastUpdated": "2026-01-21T00:00:00Z"
    }
  ],
  "referenceRate": {
    "currency": "USD",
    "rate": 4.5,
    "source": "Federal Reserve"
  }
}
```

### Signal Interpretation

| Signal | Meaning | Suggested Action |
|--------|---------|------------------|
| **LONG** | Positive carry > 5% | Consider long EM currency, short USD |
| **NEUTRAL** | Carry 0-5% | No clear directional bias |
| **SHORT** | Negative carry | Consider short EM currency, long USD |

## Economic Data Endpoints

### Interest Rates

```bash
GET /api/v1/rates/interest
GET /api/v1/rates/interest/:currency
```

### Inflation Data

```bash
GET /api/v1/data/inflation/:currency
```

### Full Intelligence Report

```bash
GET /api/v1/intelligence/:currency
```

Returns complete intelligence package:

```json
{
  "currency": "KES",
  "timestamp": "2026-01-21T12:00:00Z",
  "price": {
    "rate": 0.00770,
    "confidence": 94,
    "sources": 5
  },
  "volatility": {
    "regime": "NORMAL",
    "realized_7d": 8.2,
    "realized_30d": 12.4,
    "realized_90d": 11.8,
    "percentile": 45
  },
  "momentum": {
    "direction": "BEARISH",
    "roc_1d": -0.2,
    "roc_7d": -0.8,
    "roc_30d": -2.1,
    "twap_24h": 0.00772
  },
  "meanReversion": {
    "zScore": -0.8,
    "bollingerPosition": 32,
    "deviationFromMA20": -1.2,
    "deviationFromMA50": -2.4
  },
  "carryTrade": {
    "signal": "LONG",
    "policyRate": 12.0,
    "spreadVsUSD": 7.5,
    "realRate": 4.2,
    "inflationRate": 7.8
  },
  "stability": {
    "sourceAgreement": 0.94,
    "consistency": 0.92,
    "manipulationRisk": "LOW"
  }
}
```

## Data Sources

### Central Banks Monitored

| Country | Central Bank | Data Points |
|---------|--------------|-------------|
| Kenya | CBK | Policy rate, forex reserves, inflation |
| Nigeria | CBN | MPR, CRR, inflation, FX policy |
| Ghana | BOG | Policy rate, inflation, T-bill rates |
| South Africa | SARB | Repo rate, prime rate, CPI |
| Tanzania | BOT | Discount rate, inflation |
| Ethiopia | NBE | Policy rate, inflation |
| Egypt | CBE | Overnight rate, inflation |
| Morocco | BAM | Key rate, inflation |
| Brazil | BCB | Selic rate, IPCA inflation |
| Mexico | Banxico | Funding rate, CPI |

### Update Frequency

| Data Type | Update Frequency |
|-----------|------------------|
| Policy Rates | Within 1 hour of announcement |
| Inflation Data | Within 24 hours of release |
| Volatility Metrics | Hourly |
| Momentum Signals | Per price update |
| Carry Trade Signals | Daily |

## Integration Examples

### Smart Contract: Volatility-Aware Position Sizing

```solidity
function calculatePositionSize(
    uint256 baseSize,
    address oracle
) external view returns (uint256) {
    IAFXOOracle afxo = IAFXOOracle(oracle);

    // Get volatility regime
    uint8 regime = afxo.getVolatilityRegime();

    // Reduce position in high volatility
    if (regime == 3) { // EXTREME
        return baseSize / 4;
    } else if (regime == 2) { // HIGH
        return baseSize / 2;
    } else if (regime == 1) { // NORMAL
        return baseSize * 75 / 100;
    }

    return baseSize; // LOW volatility
}
```

### TypeScript: Carry Trade Screener

```typescript
import { AFXOClient } from '@afxo/sdk';

const client = new AFXOClient({ apiKey: 'your_key' });

async function screenCarryTrades() {
  const signals = await client.getCarryTradeSignals();

  const opportunities = signals.filter(s =>
    s.signal === 'LONG' &&
    s.spreadVsUSD > 5 &&
    s.realRate > 0
  );

  console.log('Top carry trade opportunities:');
  opportunities
    .sort((a, b) => b.spreadVsUSD - a.spreadVsUSD)
    .slice(0, 5)
    .forEach(s => {
      console.log(`${s.currency}: ${s.spreadVsUSD}% spread, ${s.realRate}% real rate`);
    });
}
```

## Why This Matters

Traditional oracles like Chainlink and Pyth provide **prices**. AFXO provides **intelligence**.

For emerging market currencies, price alone isn't enough:
- **Volatility** can spike 3x overnight on central bank announcements
- **Carry spreads** of 20%+ create massive yield opportunities
- **Mean reversion** is stronger in illiquid EM pairs
- **Official vs market rates** can diverge significantly

AFXO's economic intelligence layer gives you the context to make better decisions — whether you're building a DeFi protocol, trading desk, or risk management system.

---

## Next Steps

- [API Reference](./api-reference.md) — Full API documentation
- [Quick Start](./quick-start-signed-feeds.md) — Get started in 5 minutes
- [Pricing](https://afxo.ai/get-access) — Subscription plans
