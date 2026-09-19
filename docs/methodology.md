# AFXO Methodology

How AFXO calculates and validates FX rates for emerging markets.

## Overview

AFXO collects quotes for each currency pair from several independent sources, removes statistical outliers, publishes the weighted median of what remains, and signs the result. Every published rate carries a hash that commits to the exact quotes and weights behind it, so a holder of a signed rate can obtain those inputs and recompute the rate.

```
Sources → Outlier exclusion → Weighted median → Safeguards → Signed rate (+ stored inputs)
```

**Status:** AFXO is in pre-production (Avalanche Fuji testnet). The source set below is the pre-production set and will change before production launch. The build that is running is always stated at `GET https://api.afxo.ai/version`.

---

## Data Sources

### Source Categories (pre-production)

| Category | Role |
|----------|------|
| **Commercial FX data APIs** (licensed subscriptions) | Primary fiat quotes, refreshed every 60 seconds |
| **Publicly quoted rates of major FX and money-transfer providers** | Primary fiat quotes |
| **Free reference-rate APIs** | Secondary; refreshed daily |
| **P2P market quotes** | Selected African pairs |
| **Regulated crypto exchanges and a market-data aggregator** | Stablecoin pairs only |

No central-bank feed and no terminal-grade (Reuters/Bloomberg) feed is connected today.

### Source Floor

- A rate is published only when **at least three sources that carry weight** remain after outlier exclusion.
- The floor cannot be lowered by configuration: the service refuses to start if it is set below three.
- When a pair falls below the floor the API returns HTTP 503 for that pair rather than a rate.

### Anti-Circularity

- **Primary**: external off-chain FX sources.
- **Never an input**: on-chain DEX prices of any customer's tokens.

---

## Aggregation

### Outlier Exclusion

Quotes are compared using the median absolute deviation (modified Z-score, threshold 3.5). A quote beyond the threshold is excluded, unless excluding it would leave fewer than three. Excluded quotes are kept in the record with the reason for exclusion.

### Weighted Median

```
Published Rate = WeightedMedian(included_quotes, source_weights)
```

Sort the included quotes; walk the cumulative weight; the published rate is the quote at which the cumulative weight first passes half the total (if it lands exactly on half, the mean of that quote and the next). The weighted average is computed alongside and recorded, but it is not the published rate.

### Why Weighted Median?

- **Resistant to one bad source**: a single quote cannot move the result beyond its neighbours
- **Reproducible**: anyone holding the inputs gets the same number

---

## Quality Control

Quality control on the rate path is **statistical, not machine learning**: the outlier exclusion above, the source floor, and the safeguards below. Anomaly-detection models (Isolation Forest, LSTM autoencoder) are trained offline for research; they do not influence any published rate.

### Safeguards

| Safeguard | Behaviour |
|-----------|-----------|
| **Source floor** | Fewer than three weighted sources → no rate |
| **Deviation circuit breaker** | A move of more than 300 bps against the last published rate halts the pair. The halt is latched until an operator reviews and clears it |
| **Storage before publication** | If the record of inputs cannot be stored, the rate is withheld |

---

## Confidence Scoring

Each rate receives a confidence score (0-100):

| Factor | Weight | Description |
|--------|--------|-------------|
| **Source Quality** | 40% | Tier and reliability of the contributing sources |
| **Source Agreement** | 30% | Dispersion of the included quotes |
| **Historical Consistency** | 20% | Deviation from the recent moving average |
| **Data Freshness** | 10% | Age of the quotes at aggregation time |

The score is computed by AFXO. Freshness depends on the time of computation, so the score is an indicator, not something a third party can reproduce exactly. The rate itself is reproducible (see below).

### Confidence Bands

| Score | Band | Interpretation |
|-------|------|----------------|
| 85-100 | **High** | Sources agree closely and are fresh |
| 70-84 | **Medium** | Suitable for most applications |
| 50-69 | **Low** | Use with caution |
| <50 | **Critical** | Insufficient data quality |

### Minimum Threshold

Rates with confidence below 70% are not published on-chain by default. This threshold is configurable per oracle.

---

## Signing and Verification

### Who signs

Rates are signed by **one AFXO key** (EIP-712, domain `AFXO Oracle` version `2`). The current signer address is published in the [quick start](./quick-start-signed-feeds.md). There is no multi-operator consensus today: a multi-operator verification network is designed and not deployed. AFXO has not yet had an external review.

### How to check a rate without trusting AFXO's arithmetic

The `aggregationHash` inside every signed rate commits to each quote considered, its weight, whether it was included, and when it was observed:

```
afxo-aggregation-v2
<BASE>/<QUOTE>
weighted_median
<aggregation time, unix ms>
<sourceId>|<quote x 10^18>|<weight x 10^6>|<1 included, 0 excluded>|<quote time, unix ms>   (one line per source, ordered by sourceId)

aggregationHash = keccak256(the text above)
```

A participant or supervisor with an audit key calls `GET /audit/{currency}?hash=<aggregationHash>` and receives the stored inputs, that text, and an EIP-712 signature over the record. They can then:

1. confirm the signature recovers to the published signer;
2. confirm `keccak256(text)` equals the `aggregationHash` inside the signed rate they already hold;
3. recompute the weighted median from the included lines and compare it with the rate;
4. compare any quote with the named provider directly.

A ready-made script that performs steps 1 to 3 and lists the quotes for step 4 is in [`examples/javascript/verify-rate.js`](../examples/javascript/verify-rate.js).

Records are retained for seven years.

### What this does not prove

- That a recorded quote was truly received from the provider: providers do not sign their responses. Step 4 is the check.
- That the inputs were fixed before the rate was chosen: nothing outside AFXO timestamps the commitment yet.

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
| **Role-separated keys** | Signing, on-chain updating and contract administration use different keys; contract administration is held by a multisig and timelock |
| **Pausable** | Emergency circuit breaker |

---

## Audit Trail

For every published rate AFXO stores: each source quote with its weight, observation time and inclusion flag; the reason for any exclusion; the statistics and confidence factors; both the weighted median and the weighted average; and the aggregation hash. Access is through the audit endpoint described above, to holders of an audit key.

---

## Learn More

- [Network Status](https://afxo.ai/network)
- [API Reference](./api-reference.md)
- [Smart Contracts](./smart-contracts.md)
