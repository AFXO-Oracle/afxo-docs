# AFXO Methodology

How AFXO calculates and validates FX rates for emerging markets.

## Overview

AFXO aggregates FX data from multiple institutional sources, applies AI-powered quality control, and publishes validated rates on-chain through a decentralized verification network.

```
Data Sources → Aggregation → AI Validation → Consensus → On-Chain
```

---

## Data Sources

### Source Categories

| Category | Examples | Weight |
|----------|----------|--------|
| **Tier 1: Institutional** | OANDA, XE, Kaiko | High |
| **Tier 2: Central Banks** | CBK, CBN, SARB | High |
| **Tier 3: Market Data** | Reuters, Bloomberg | Medium |
| **Tier 4: Aggregators** | Open Exchange Rates, Fixer | Medium |
| **Tier 5: P2P/Market** | Binance P2P (validation only) | Low |

### Source Requirements

- Minimum 3 active sources per currency
- At least 1 Tier 1 or Tier 2 source
- Geographic diversity where possible
- Independent data paths (no circular dependencies)

### Anti-Circularity

AFXO explicitly avoids circular dependencies:

- **Primary**: External institutional FX sources
- **Validation only**: On-chain DEX prices (never used as primary input)
- **Halt condition**: If external sources drop below 3, updates are paused

---

## Aggregation

### Weighted Median

AFXO uses a weighted median algorithm to aggregate rates:

1. Collect rates from all active sources
2. Apply source-specific weights based on reliability
3. Calculate the weighted median (not mean)
4. Outliers beyond 2 standard deviations are flagged

```
Final Rate = WeightedMedian(source_rates, source_weights)
```

### Why Weighted Median?

- **Resistant to outliers**: Single bad source can't skew the result
- **Handles asymmetric data**: Works well with illiquid markets
- **Transparent**: Easy to audit and reproduce

---

## AI Quality Control

### Anomaly Detection

AFXO uses machine learning to detect anomalies:

| Model | Purpose |
|-------|---------|
| **Isolation Forest** | Detect unusual rate patterns |
| **LSTM Autoencoder** | Identify sequence anomalies |
| **Statistical Tests** | Z-score, IQR outlier detection |

### Anomaly Types Detected

- Sudden price spikes or crashes
- Stale data (source stopped updating)
- Source divergence (one source significantly different)
- Pattern anomalies (unusual volatility)

### Anomaly Response

| Severity | Action |
|----------|--------|
| Low | Flag for review, proceed with publication |
| Medium | Reduce confidence score, publish with warning |
| High | Exclude anomalous source, recalculate |
| Critical | Halt updates, alert operators |

---

## Confidence Scoring

Each rate receives a confidence score (0-100) based on multiple factors:

### Scoring Factors

| Factor | Weight | Description |
|--------|--------|-------------|
| **Source Agreement** | 30% | How closely sources agree |
| **Source Count** | 20% | Number of active sources |
| **Data Freshness** | 20% | Age of source data |
| **Historical Consistency** | 15% | Deviation from recent trend |
| **Source Quality** | 15% | Weighted by source tier |

### Confidence Bands

| Score | Band | Interpretation |
|-------|------|----------------|
| 85-100 | **High** | Settlement-grade reliability |
| 70-84 | **Medium** | Suitable for most applications |
| 50-69 | **Low** | Limited sources, use with caution |
| <50 | **Critical** | Insufficient data quality |

### Minimum Threshold

Rates with confidence below 70% are not published on-chain by default. This threshold is configurable per oracle.

---

## Decentralized Verification

### Operator Network

AFXO uses multiple independent operators to verify rates:

1. **Independent Fetching**: Each operator fetches data independently
2. **Independent Validation**: Each operator runs their own ML validation
3. **Consensus Required**: Minimum 2-of-3 operator agreement
4. **Divergence Detection**: Alerts if operators disagree significantly

### Consensus Process

```
Operator 1 → Rate A, Confidence X
Operator 2 → Rate B, Confidence Y
Operator 3 → Rate C, Confidence Z

If |A - B| < threshold AND |B - C| < threshold:
    Final Rate = Median(A, B, C)
    Publish to chain
Else:
    Flag divergence, investigate
```

### Benefits

- No single point of failure
- Resistant to data source manipulation
- Transparent and auditable
- Geographically distributed

---

## Update Frequency

### By Plan Tier

| Plan | Update Frequency |
|------|------------------|
| Sandbox | Daily (1x) |
| Starter | Hourly (24x) |
| Builder | Every 5 minutes (288x) |
| Growth | Every 1 minute (1,440x) |
| Enterprise | Sub-minute |

### Market Hours Awareness

- Updates more frequent during African market hours (6 AM - 6 PM local time zones)
- Reduced frequency during weekends for pegged currencies
- Real-time updates during high volatility events

---

## On-Chain Publication

### Avalanche C-Chain

- **Canonical root**: Source of truth for all AFXO rates
- **Sub-second finality**: Fast confirmation times
- **Low fees**: Cost-effective for frequent updates

### Safety Rails

| Protection | Description |
|------------|-------------|
| **Rate Bounds** | Maximum per-update change limit (e.g., 10%) |
| **Confidence Threshold** | Minimum 70% confidence required |
| **Multi-sig Updates** | No single key can push updates |
| **Pausable** | Emergency circuit breaker |

---

## Audit Trail

Every rate published includes:

- Source rates and weights used
- Anomaly detection results
- Confidence score breakdown
- Operator signatures
- Transaction hash

This data is stored off-chain and available via API for full reproducibility.

---

## Learn More

- [Network Status](https://afxo.ai/network)
- [API Reference](./api-reference.md)
- [Smart Contracts](./smart-contracts.md)
