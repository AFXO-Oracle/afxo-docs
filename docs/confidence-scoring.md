# Confidence Scoring

Understanding AFXO's confidence scores and how to use them in your applications.

## Overview

Every AFXO rate includes a **confidence score** (0-100) that indicates the reliability of the data. This score helps consumers make informed decisions about how to use the rate.

---

## Confidence Bands

| Score | Band | Color | Meaning |
|-------|------|-------|---------|
| 85-100 | **High** | Green | Settlement-grade reliability. Multiple high-quality sources in strong agreement. |
| 70-84 | **Medium** | Yellow | Suitable for most applications. Minor source disagreement or reduced freshness. |
| 50-69 | **Low** | Orange | Use with caution. Limited sources or significant disagreement. |
| <50 | **Critical** | Red | Insufficient data quality. Consider pausing operations. |

---

## Scoring Factors

The confidence score is calculated from five weighted factors:

### 1. Source Agreement (30%)

How closely do the data sources agree?

```
Agreement Score = 100 - (Standard Deviation / Mean * 100)
```

| Condition | Score Impact |
|-----------|--------------|
| Sources within 0.1% | Full points |
| Sources within 0.5% | 80% of points |
| Sources within 1% | 50% of points |
| Sources differ >2% | Minimum points |

### 2. Source Count (20%)

How many active sources are providing data?

| Sources | Score Impact |
|---------|--------------|
| 6+ sources | Full points |
| 5 sources | 90% of points |
| 4 sources | 75% of points |
| 3 sources | 50% of points |
| <3 sources | No publication |

### 3. Data Freshness (20%)

How recent is the source data?

| Age | Score Impact |
|-----|--------------|
| <1 minute | Full points |
| 1-5 minutes | 90% of points |
| 5-15 minutes | 70% of points |
| 15-60 minutes | 50% of points |
| >60 minutes | Minimum points |

### 4. Historical Consistency (15%)

Does the rate align with recent trends?

```
Consistency = 100 - |Current - 24h Moving Average| / Volatility * 100
```

Sudden deviations from historical patterns reduce this score.

### 5. Source Quality (15%)

Weighted by source tier:

| Tier | Weight |
|------|--------|
| Tier 1 (Institutional) | 1.0x |
| Tier 2 (Central Banks) | 1.0x |
| Tier 3 (Market Data) | 0.8x |
| Tier 4 (Aggregators) | 0.6x |
| Tier 5 (P2P/Market) | 0.3x |

---

## Using Confidence in Smart Contracts

### Basic Check

```solidity
uint8 confidence = oracle.getConfidence();
require(confidence >= 70, "Confidence too low");
```

### Tiered Response

```solidity
function executeWithConfidence() external {
    uint8 confidence = oracle.getConfidence();

    if (confidence >= 85) {
        // High confidence - full operation
        executeTrade(fullAmount);
    } else if (confidence >= 70) {
        // Medium confidence - reduced exposure
        executeTrade(fullAmount * 50 / 100);
    } else {
        // Low confidence - pause
        revert("Market conditions uncertain");
    }
}
```

### Circuit Breaker Pattern

```solidity
contract SafeConsumer {
    uint8 public minConfidence = 70;
    bool public paused = false;

    modifier whenConfident() {
        require(!paused, "Operations paused");
        require(oracle.getConfidence() >= minConfidence, "Low confidence");
        _;
    }

    function updateMinConfidence(uint8 _min) external onlyOwner {
        require(_min >= 50 && _min <= 100, "Invalid threshold");
        minConfidence = _min;
    }

    function pause() external onlyOwner {
        paused = true;
    }
}
```

---

## Using Confidence in APIs

### REST API Response

```json
{
  "pair": "KES/USD",
  "rate": "0.00770000",
  "confidence": 94,
  "confidenceBand": "high",
  "confidenceFactors": {
    "sourceAgreement": 98,
    "sourceCount": 90,
    "freshness": 95,
    "historicalConsistency": 92,
    "sourceQuality": 95
  }
}
```

### Application Logic

```javascript
const rate = await client.getRate('KES', 'USD');

if (rate.confidence >= 85) {
  // Proceed with high-value operations
  processPayment(rate.rate);
} else if (rate.confidence >= 70) {
  // Add warning to user
  processPayment(rate.rate, { warning: 'Rate confidence is medium' });
} else {
  // Show error, suggest retry later
  showError('Unable to get reliable rate. Please try again.');
}
```

---

## When Confidence Drops

### Common Causes

| Cause | Impact | Resolution |
|-------|--------|------------|
| Source outage | Reduced source count | Automatic reweighting |
| Market volatility | Increased disagreement | Wider confidence bands |
| Stale data | Freshness penalty | Source health monitoring |
| Anomaly detected | Manual review flag | Operator investigation |

### What AFXO Does

1. **Automatic reweighting**: If a source fails, others are reweighted
2. **Alerting**: Operators notified of confidence drops
3. **Publication hold**: Below 70%, rates not published on-chain
4. **Transparency**: All factors visible via API

### What You Should Do

1. **Monitor confidence**: Set up alerts for confidence drops
2. **Implement thresholds**: Don't proceed below your minimum
3. **Have fallbacks**: Consider backup data sources
4. **Communicate**: Inform users when confidence is low

---

## Historical Confidence

Query historical confidence via the API:

```bash
curl "https://api.afxo.ai/v1/rates/KES/USD/history?from=2025-01-01&to=2025-01-20" \
  -H "X-API-Key: your_key"
```

Response includes average confidence per period:

```json
{
  "data": [
    {
      "date": "2025-01-01",
      "avgConfidence": 92,
      "minConfidence": 87,
      "maxConfidence": 96
    }
  ]
}
```

---

## FAQ

**Q: Why is confidence lower for some currencies?**
A: Currencies with fewer data sources or less liquid markets naturally have lower confidence. This is accurate—it reflects real-world data availability.

**Q: Can confidence change quickly?**
A: Yes, confidence updates with each rate calculation. Source outages or market events can cause rapid changes.

**Q: What's the minimum confidence for on-chain publication?**
A: 70% by default. This is configurable per oracle.

**Q: How do I get confidence factor breakdown?**
A: Available via the REST API with `?includeFactors=true` parameter.

---

## Learn More

- [Methodology](./methodology.md)
- [API Reference](./api-reference.md)
- [Smart Contracts](./smart-contracts.md)
