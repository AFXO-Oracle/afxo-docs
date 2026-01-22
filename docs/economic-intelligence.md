# AFXO Economic Intelligence

> **Comprehensive Quantitative FX Analytics for Emerging Markets**

AFXO is more than a price feed — it's a **market data and analytics platform**. Every currency pair includes economic data and quantitative metrics that support informed decision-making.

## Overview

| Feature | AFXO | Chainlink | Pyth |
|---------|------|-----------|------|
| FX Prices | ✅ | ✅ | ✅ |
| Confidence Scores | ✅ | ❌ | ✅ |
| Volatility Analytics | ✅ | ❌ | ❌ |
| Interest Rate Differentials | ✅ | ❌ | ❌ |
| IMF Economic Data | ✅ | ❌ | ❌ |
| Momentum Metrics | ✅ | ❌ | ❌ |
| Quant Analytics (IRP, Sharpe) | ✅ | ❌ | ❌ |
| African Currencies | ✅ (23) | ❌ | ❌ |
| LatAm Currencies | ✅ (6) | ❌ | ❌ |
| Asian EM Currencies | ✅ (6) | ❌ | ❌ |
| G10 + Major Currencies | ✅ (15) | ✅ | ✅ |

**Total Coverage: 50 currencies with full economic intelligence**

## Market Analytics Categories

### 1. Volatility Analytics

Every AFXO price feed includes real-time volatility metrics:

| Metric | Description | Update Frequency |
|--------|-------------|------------------|
| `volatility.regime` | LOW / NORMAL / HIGH / EXTREME | Per update |
| `volatility.realized_7d` | 7-day annualized volatility | Hourly |
| `volatility.realized_30d` | 30-day annualized volatility | Hourly |
| `volatility.realized_90d` | 90-day annualized volatility | Daily |
| `volatility.percentile` | Current vol vs historical (0-100) | Hourly |

**Use Cases:**
- **Position Sizing**: Adjust exposure based on volatility regime
- **Risk Calibration**: Set parameters appropriate to market conditions
- **Collateral Management**: Adjust requirements based on regime

### 2. Momentum Metrics

Track trend direction and strength:

| Metric | Description |
|--------|-------------|
| `momentum.direction` | STRENGTHENING / WEAKENING / STABLE |
| `momentum.roc_1d` | 1-day rate of change (%) |
| `momentum.roc_7d` | 7-day rate of change (%) |
| `momentum.roc_30d` | 30-day rate of change (%) |
| `momentum.twap_24h` | 24-hour time-weighted average price |
| `momentum.ewma` | Exponential weighted moving average |

### 3. Statistical Deviation Analysis

Z-score and standard deviation metrics:

| Metric | Description |
|--------|-------------|
| `statisticalAnalysis.zScore` | Standard deviations from mean (-3 to +3) |
| `statisticalAnalysis.bollingerPosition` | Position within statistical bands (0-100) |
| `statisticalAnalysis.deviationFromMA20` | % deviation from 20-day MA |
| `statisticalAnalysis.classification` | WITHIN_NORM / ELEVATED / EXTREME |

**Interpretation:**
- Z-score > +2: Statistically elevated
- Z-score < -2: Statistically depressed
- Position > 95: Near upper statistical bound
- Position < 5: Near lower statistical bound

## Interest Rate Differentials

### Current Data (50 Currencies)

| Currency | Central Bank | Policy Rate | Spread vs USD | Yield Tier |
|----------|--------------|-------------|---------------|------------|
| NGN | CBN | 27.50% | +23.00% | **HIGH** |
| GHS | BOG | 27.00% | +22.50% | **HIGH** |
| ARS | BCRA | 118.00% | +113.50% | **EXTREME** |
| TRY | TCMB | 50.00% | +45.50% | **HIGH** |
| KES | CBK | 12.00% | +7.50% | **MEDIUM** |
| BRL | BCB | 13.25% | +8.75% | **MEDIUM** |
| MXN | Banxico | 10.25% | +5.75% | **MEDIUM** |
| ZAR | SARB | 7.75% | +3.25% | **LOW** |
| INR | RBI | 6.50% | +2.00% | **LOW** |
| USD | Fed | 4.50% | — | Reference |

### Interest Rate API

```bash
curl -X GET "https://api.afxo.ai/api/v1/rates/interest" \
  -H "X-API-Key: your_api_key"
```

Response:
```json
{
  "rates": [
    {
      "currency": "NGN",
      "baseCurrency": "USD",
      "policyRate": 27.5,
      "spreadVsUSD": 23.0,
      "yieldTier": "HIGH",
      "realRate": 5.2,
      "inflationRate": 22.3,
      "source": "CBN",
      "lastUpdated": "2026-01-22T00:00:00Z"
    }
  ],
  "referenceRate": {
    "currency": "USD",
    "rate": 4.5,
    "source": "Federal Reserve"
  }
}
```

### Yield Tier Classification

| Tier | Spread vs USD | Description |
|------|---------------|-------------|
| **EXTREME** | > 50% | Very high yield differential |
| **HIGH** | 10-50% | Significant yield differential |
| **MEDIUM** | 3-10% | Moderate yield differential |
| **LOW** | 0-3% | Minimal yield differential |
| **NEGATIVE** | < 0% | Lower yield than USD |

## Quantitative Analytics Suite

### NEW: Institutional-Grade Quant Endpoints

AFXO provides advanced quantitative metrics typically available only to institutional investors.

### Interest Rate Parity (IRP) Analysis

```bash
GET /api/v1/quant/irp
GET /api/v1/quant/irp/:currency
```

Calculate implied forward premiums and covered interest differentials:

```json
{
  "currency": "KES",
  "baseCurrency": "USD",
  "domesticRate": 12.0,
  "foreignRate": 4.5,
  "rateDifferential": 7.5,
  "impliedForwardPremium": 7.5,
  "forwardPoints1M": 6250,
  "forwardPoints3M": 18750,
  "forwardPoints12M": 75000,
  "coveredCarry": 0,
  "uncoveredCarry": 7.5,
  "irpDeviation": 0.375,
  "arbitrageOpportunity": false
}
```

### Carry-to-Volatility Ratios (Sharpe-like Metrics)

```bash
GET /api/v1/quant/carry-vol
```

Risk-adjusted return metrics for every currency pair:

```json
{
  "currency": "KES",
  "carrySpread": 7.5,
  "impliedVolatility": 12,
  "carryToVol": 0.63,
  "annualizedSharpe": 0.63,
  "breakEvenMove": 7.5,
  "probabilityOfProfit": 73.4,
  "expectedReturn": 3.75,
  "maxDrawdownEstimate": 31.5,
  "kellyFraction": 0.5,
  "riskTier": "MEDIUM"
}
```

### Z-Score Deviation Analysis

```bash
GET /api/v1/quant/zscore
```

Statistical deviation from historical norms:

```json
{
  "currency": "KES",
  "currentRate": 12.0,
  "historicalMean": 10.5,
  "historicalStdDev": 2.1,
  "zScore": 0.71,
  "percentile": 76,
  "meanReversionSignal": "NEUTRAL",
  "expectedReversion": -0.35,
  "halfLife": 45,
  "confidence": 0.85
}
```

### Risk Parity Portfolio Weights

```bash
GET /api/v1/quant/risk-parity
```

Inverse-volatility weighted allocations:

```json
{
  "currency": "KES",
  "volatility": 12,
  "inverseVol": 0.083,
  "riskParityWeight": 1.07,
  "equalWeight": 2.0,
  "carryWeightedAllocation": 3.68,
  "optimalAllocation": 2.12,
  "maxPosition": 15
}
```

### Cross-Currency Spread Analysis

```bash
GET /api/v1/quant/cross-currency/:currency1/:currency2
```

Compare any two currencies:

```json
{
  "currency1": "KES",
  "currency2": "NGN",
  "rate1": 12.0,
  "rate2": 27.5,
  "spread": -15.5,
  "spreadZScore": -1.69,
  "convergenceSignal": "CONVERGE",
  "relativeValue": "CHEAP",
  "pairAnalysis": "KES vs NGN",
  "expectedSpreadChange": 0.85
}
```

### Quant Dashboard

```bash
GET /api/v1/quant/dashboard
```

Aggregate market overview:

```json
{
  "timestamp": "2026-01-22T14:30:00Z",
  "marketRegime": "RISK_ON",
  "globalCarryIndex": 6.93,
  "emCarryIndex": 9.08,
  "g10CarryIndex": -0.66,
  "volatilityRegime": "NORMAL",
  "correlationRegime": "NORMAL",
  "topCarryTrades": [
    {"currency": "ARS", "score": 2.27},
    {"currency": "AED", "score": 1.80},
    {"currency": "TRY", "score": 1.52}
  ],
  "topMeanReversionTrades": [
    {"currency": "NGN", "zScore": 2.25},
    {"currency": "ARS", "zScore": 2.09}
  ],
  "riskWarnings": ["ARS: Extreme volatility (50%)"]
}
```

## Economic Data Endpoints

### Interest Rates

```bash
GET /api/v1/rates/interest
GET /api/v1/rates/interest/:currency
```

### Real Rate Analysis

```bash
GET /api/v1/signals/real-rate
GET /api/v1/signals/real-rate/:currency
```

### Full Intelligence Report

```bash
GET /api/v1/intelligence/:currency
```

Returns complete intelligence package:

```json
{
  "currency": "KES",
  "timestamp": "2026-01-22T12:00:00Z",
  "price": {
    "rate": 0.00770,
    "confidence": 94,
    "sources": 5
  },
  "volatility": {
    "regime": "NORMAL",
    "realized_7d": 8.2,
    "realized_30d": 12.4,
    "percentile": 45
  },
  "momentum": {
    "direction": "STABLE",
    "roc_7d": -0.8,
    "twap_24h": 0.00772
  },
  "statisticalAnalysis": {
    "zScore": -0.8,
    "bollingerPosition": 32,
    "classification": "WITHIN_NORM"
  },
  "interestRates": {
    "policyRate": 12.0,
    "spreadVsUSD": 7.5,
    "realRate": 4.2,
    "inflationRate": 7.8,
    "yieldTier": "MEDIUM"
  },
  "stability": {
    "sourceAgreement": 0.94,
    "consistency": 0.92,
    "manipulationRisk": "LOW"
  }
}
```

## Data Sources

### Central Banks & Official Sources (50 Currencies)

**Africa (23 currencies):**
- Kenya (CBK), Nigeria (CBN), Ghana (BOG), South Africa (SARB)
- Tanzania (BOT), Ethiopia (NBE), Uganda (BOU), Rwanda (BNR)
- Egypt (CBE), Morocco (BAM), Tunisia (BCT), Algeria (BA)
- DRC (BCC), Zambia (BOZ), Mozambique (BM), Malawi (RBM)
- Botswana (BOB), Mauritius (BOM), and more

**Latin America (6 currencies):**
- Brazil (BCB), Mexico (Banxico), Argentina (BCRA)
- Colombia (BR), Chile (BCCh), Peru (BCRP)

**Asia & Middle East (6 currencies):**
- India (RBI), China (PBOC), UAE (CBUAE)
- Thailand (BOT), Philippines (BSP), Vietnam (SBV)

**G10 & Major (15 currencies):**
- US (Fed), Eurozone (ECB), UK (BoE), Japan (BoJ)
- Switzerland (SNB), Australia (RBA), Canada (BoC)
- And more

### IMF Integration

AFXO integrates with the IMF DataMapper API for:
- Inflation data (PCPIPCH) for all 50 currencies
- GDP growth data (NGDP_RPCH)
- Foreign reserves data (Reserves_M)

### Update Frequency

| Data Type | Update Frequency |
|-----------|------------------|
| Policy Rates | Within 1 hour of announcement |
| Inflation Data | Within 24 hours of release |
| IMF Data | As released (typically quarterly projections) |
| Volatility Metrics | Hourly |
| Momentum Metrics | Per price update |
| Quant Analytics | Real-time calculation |

## Integration Examples

### Smart Contract: Volatility-Aware Collateral

```solidity
function calculateCollateralRequirement(
    uint256 baseCollateral,
    address oracle
) external view returns (uint256) {
    IAFXOOracle afxo = IAFXOOracle(oracle);

    // Get volatility regime
    uint8 regime = afxo.getVolatilityRegime();

    // Increase collateral in high volatility
    if (regime == 3) { // EXTREME
        return baseCollateral * 200 / 100; // 2x
    } else if (regime == 2) { // HIGH
        return baseCollateral * 150 / 100; // 1.5x
    } else if (regime == 1) { // NORMAL
        return baseCollateral * 125 / 100; // 1.25x
    }

    return baseCollateral; // LOW volatility
}
```

### TypeScript: Interest Rate Differential Screener

```typescript
import { AFXOClient } from '@afxo/sdk';

const client = new AFXOClient({ apiKey: 'your_key' });

async function screenYieldOpportunities() {
  const rates = await client.getInterestRates();

  const highYield = rates.filter(r =>
    r.yieldTier === 'HIGH' &&
    r.realRate > 0
  );

  console.log('High yield currencies with positive real rates:');
  highYield
    .sort((a, b) => b.spreadVsUSD - a.spreadVsUSD)
    .forEach(r => {
      console.log(`${r.currency}: ${r.spreadVsUSD}% spread, ${r.realRate}% real rate`);
    });
}
```

## Why This Matters

Traditional oracles like Chainlink and Pyth provide **prices**. AFXO provides **comprehensive market data**.

For emerging market currencies, price alone isn't enough:
- **Volatility** can spike 3x overnight on central bank announcements
- **Yield spreads** of 20%+ create significant differentials
- **Statistical deviations** are more pronounced in less liquid EM pairs
- **Official vs market rates** can diverge significantly

AFXO's economic intelligence layer provides the quantitative context for better analysis — whether you're building a DeFi protocol, institutional system, or risk management framework.

---

## Disclaimer

AFXO provides market data and quantitative analytics for informational purposes only. This data does not constitute investment advice, financial advice, or any recommendation to buy, sell, or hold any financial instrument. All investment decisions are solely the responsibility of the user.

---

## Next Steps

- [API Reference](./api-reference.md) — Full API documentation
- [Quick Start](./quick-start-signed-feeds.md) — Get started in 5 minutes
- [Pricing](https://afxo.ai/get-access) — Subscription plans
