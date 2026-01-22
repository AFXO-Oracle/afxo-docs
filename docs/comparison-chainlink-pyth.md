# AFXO v2 vs Chainlink vs Pyth: Technical Comparison

**Author:** Vincent Scaturchio
**Last Updated:** 2026-01-21

A detailed technical comparison of oracle data standards and why AFXO v2 represents the state-of-the-art.

---

## Executive Summary

AFXO Signed Price Feed Standard v2 combines the best features of Chainlink (reliability, EVM-native design) and Pyth (signed data, confidence scores) while adding unique innovations:

- **Provenance hashing** for full auditability
- **Explicit decimals** for self-describing data
- **Monotonic rounds** for ordering guarantees
- **Source transparency** with count metrics

**Result**: The most complete, secure, and developer-friendly oracle standard available.

---

## Feature Comparison Matrix

| Feature | AFXO v2 | Chainlink | Pyth | Winner |
|---------|---------|-----------|------|--------|
| **Data Format** |
| Signed data standard | ✅ EIP-712 | ⚠️ On-chain only | ✅ Custom | AFXO/Pyth |
| Self-describing (includes decimals) | ✅ Yes | ❌ No | ✅ Yes | AFXO/Pyth |
| Confidence score | ✅ 0-10000 bps | ❌ No | ✅ Yes | AFXO/Pyth |
| Source count | ✅ Yes | ❌ No | ✅ Publisher count | AFXO/Pyth |
| Unique feed identifier | ✅ `feedId` (bytes32) | ✅ Proxy address | ✅ Price ID | Tie |
| Round/sequence tracking | ✅ Monotonic `round` | ⚠️ Complex phase system | ❌ No | **AFXO** |
| Expiry timestamp | ✅ `validUntil` | ⚠️ Implicit staleness | ❌ No | **AFXO** |
| Chain safety | ✅ In signed data | ⚠️ Domain only | ✅ In signed data | AFXO/Pyth |
| Provenance hash | ✅ `aggregationHash` | ❌ No | ❌ No | **AFXO** |
| **Integration** |
| EVM-native | ✅ Yes | ✅ Yes | ⚠️ Requires adapter | AFXO/Chainlink |
| Off-chain verification | ✅ Full support | ⚠️ Limited | ✅ Full support | AFXO/Pyth |
| Developer experience | ✅ Excellent | ⚠️ Complex | ✅ Good | **AFXO** |
| Documentation quality | ✅ Comprehensive | ✅ Good | ⚠️ Fragmented | **AFXO** |
| **Security** |
| Replay attack protection | ✅ Multi-layered | ✅ Yes | ⚠️ Limited | **AFXO** |
| Cross-chain safety | ✅ Explicit chainId | ⚠️ Implicit | ✅ Yes | AFXO/Pyth |
| Staleness protection | ✅ `validUntil` field | ⚠️ Application-level | ⚠️ Application-level | **AFXO** |
| Auditability | ✅ Full provenance | ⚠️ Limited | ⚠️ Limited | **AFXO** |
| **Data Quality** |
| Multi-source aggregation | ✅ 3-10 sources | ✅ Yes | ✅ Yes | Tie |
| Quality metrics | ✅ Confidence + count | ❌ No | ✅ Confidence | AFXO/Pyth |
| Emerging market coverage | ✅ 50 currencies | ⚠️ Limited | ⚠️ Limited | **AFXO** |
| African FX rates | ✅ Best-in-class (23 currencies) | ❌ Poor | ❌ Poor | **AFXO** |

**Legend:**
- ✅ Fully supported
- ⚠️ Partially supported or complex
- ❌ Not supported

---

## Detailed Feature Analysis

### 1. Signed Data Format

#### AFXO v2: EIP-712 Fully Typed

```typescript
interface AFXOPriceFeedV2 {
  feedId: bytes32;           // Unique identifier
  price: int256;             // Price with explicit decimals
  decimals: uint8;           // Self-describing precision
  confidence: uint16;        // Quality metric (0-10000)
  sourceCount: uint8;        // Transparency metric
  timestamp: uint64;         // When aggregated
  validUntil: uint64;        // Explicit expiry
  round: uint64;             // Monotonic sequence
  chainId: uint64;           // Chain safety
  aggregationHash: bytes32;  // Provenance proof
}
```

**Benefits:**
- Self-describing: All information to interpret price is included
- Universal: Works identically across all EVM chains
- Auditable: Provenance hash proves sources used
- Ordered: Rounds provide sequence guarantees

#### Chainlink: On-Chain Only

```solidity
// Chainlink doesn't use signed data
// Prices are written on-chain by oracles directly
function latestRoundData() returns (
  uint80 roundId,
  int256 answer,
  uint256 startedAt,
  uint256 updatedAt,
  uint80 answeredInRound
);

// Decimals require separate call
function decimals() returns (uint8);
```

**Limitations:**
- Not self-describing: Must call `decimals()` separately
- On-chain only: No off-chain verification possible
- Complex round system: Phase ID + aggregation round
- No quality metrics: No confidence or source counts
- Limited auditability: Opaque aggregation process

#### Pyth: Custom Binary Format

```rust
struct PriceFeed {
    price: i64,
    conf: u64,
    expo: i32,
    publish_time: i64,
}
```

**Limitations:**
- Custom format: Not standard EIP-712
- No round tracking: Cannot detect out-of-order data
- No expiry: Application must implement staleness checks
- No provenance: Cannot verify sources used

---

### 2. Self-Describing Data

**Problem**: Without explicit decimals, you need external context to interpret the price.

#### AFXO v2: Explicit Decimals ✅

```typescript
// Everything needed to interpret price is in signed data
const price = Number(feed.price) / 10 ** feed.decimals;
// No external calls needed!
```

#### Chainlink: External Lookup Required ❌

```solidity
// Must make TWO calls
int256 price = oracle.latestAnswer();
uint8 decimals = oracle.decimals(); // Separate call!
```

**Impact**: Gas cost, complexity, potential for errors if decimals change.

#### Pyth: Exponent Field ✅

```rust
let price = price_feed.price * 10^price_feed.expo;
```

**Verdict**: AFXO and Pyth both solve this correctly. Chainlink is behind.

---

### 3. Quality Metrics

#### AFXO v2: Dual Metrics ✅

```typescript
confidence: 8750  // 87.5% quality score
sourceCount: 6    // 6 sources used
```

**Benefits:**
- **Confidence**: How good is this price?
- **Source Count**: How many independent sources confirmed it?
- **Combined**: Strong signal of data quality

**Calculation:**
```typescript
confidence = min(
  sourceAgreement * 40% +     // Do sources agree?
  sourceQuality * 30% +       // Are sources reliable?
  historicalConsistency * 20% + // Does it match history?
  dataFreshness * 10%,        // How fresh is data?
  10000
);
```

#### Chainlink: No Quality Metrics ❌

Chainlink provides no quality score. You must trust the price blindly.

#### Pyth: Confidence Interval ✅

```rust
conf: 50  // ±$50 confidence interval
```

**Limitation**: Confidence is absolute (dollar amount), not relative (percentage). Hard to compare across assets.

**Verdict**: AFXO provides the most comprehensive quality metrics.

---

### 4. Round/Sequence Tracking

#### AFXO v2: Monotonic Rounds ✅

```typescript
round: 12345  // Simple, monotonically increasing
```

**Benefits:**
- Detect out-of-order data: `if (newRound <= lastRound) reject`
- Detect duplicates: `if (newRound === lastRound) skip`
- Historical queries: "Give me round 12345"
- Never resets: Survives restarts (backed by Redis/Postgres)

**Implementation:**
```typescript
// Consumer tracks last round per feed
const lastRound = db.getLastRound(feedId);
if (feed.round <= lastRound) {
  throw new Error('Stale or duplicate round');
}
db.setLastRound(feedId, feed.round);
```

#### Chainlink: Complex Phase System ⚠️

```solidity
uint80 roundId; // Actually: phaseId (16 bits) + aggregatorRoundId (64 bits)
```

**Problems:**
- Complex: Must understand phase system
- Resets: Rounds reset when aggregator changes
- Historical: Difficult to query across phases

#### Pyth: No Sequence Tracking ❌

Pyth doesn't provide sequence numbers. You cannot detect:
- Out-of-order updates
- Duplicate updates
- Missing updates

**Verdict**: AFXO's monotonic rounds are the cleanest and most robust solution.

---

### 5. Expiry / Staleness Protection

#### AFXO v2: Explicit `validUntil` ✅

```typescript
validUntil: 1737461100  // Signature expires at this Unix timestamp
```

**Benefits:**
- Explicit: Consumer knows exactly when data expires
- Enforced: Can reject expired data
- Flexible: Different feeds can have different validity periods

**Verification:**
```solidity
require(block.timestamp <= feed.validUntil, "Signature expired");
```

#### Chainlink: Implicit Staleness ⚠️

```solidity
// Application must implement staleness check
require(block.timestamp - updatedAt < MAX_DELAY, "Stale data");
```

**Problem**: No standard staleness threshold. Every consumer implements it differently.

#### Pyth: No Expiry ❌

Pyth signatures don't expire. Application must check `publish_time` and reject stale data.

**Verdict**: AFXO's explicit expiry is the most secure and developer-friendly approach.

---

### 6. Provenance & Auditability

#### AFXO v2: Cryptographic Provenance ✅

```typescript
aggregationHash: "0x..."  // Proves which sources were used
```

**Generation:**
```typescript
aggregationHash = keccak256(
  sortedSourceIds + "|" + method + "|" + timestamp
);
```

**Benefits:**
- **Auditability**: Can verify sources used without exposing raw data
- **Integrity**: Tampering invalidates hash
- **Reproducibility**: Oracle operator can prove aggregation was correct
- **Transparency**: Consumers can request full breakdown via API

**Example:**
```typescript
// Consumer requests receipt
const receipt = await fetch(
  `https://api.afxo.ai/v2/rates/USD/KES/receipt?round=12345`
);

const { sources, method, timestamp } = await receipt.json();
// sources: ["oanda", "xe", "cbk", "binance-p2p"]
// method: "weighted_average"
// timestamp: 1737460800

// Verify hash
const recomputed = keccak256(sources.sort().join(',') + '|' + method + '|' + timestamp);
if (recomputed !== feed.aggregationHash) {
  throw new Error('Provenance mismatch - data was tampered!');
}
```

#### Chainlink: No Provenance ❌

Chainlink doesn't provide any proof of which oracles or sources were used. Aggregation is opaque.

#### Pyth: No Provenance ❌

Pyth provides publisher count but no cryptographic proof of which publishers were used.

**Verdict**: AFXO is the ONLY oracle with full cryptographic provenance.

---

### 7. Chain Safety

#### AFXO v2: Defense in Depth ✅

```typescript
// chainId in BOTH domain AND signed data
domain: { chainId: 43114 }
feed: { chainId: 43114 }
```

**Benefits:**
- EIP-712 domain prevents cross-chain replay
- Explicit field allows consumer-side validation
- Double protection against misconfiguration

#### Chainlink: Domain Only ⚠️

Chainlink relies on contract deployment per chain. No explicit chain safety in data.

#### Pyth: In Signed Data ✅

Pyth includes chain ID in signed data.

**Verdict**: AFXO and Pyth both handle this well. Chainlink is weaker.

---

## Use Case Comparison

### Use Case 1: DeFi Lending Protocol

**Requirements:**
- Reliable price feeds
- Quality metrics to pause lending if data quality drops
- Detect out-of-order updates

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| Price reliability | ✅ Excellent | ✅ Excellent | ✅ Good |
| Quality metrics | ✅ Confidence + count | ❌ No | ⚠️ Confidence only |
| Ordering detection | ✅ Rounds | ⚠️ Complex | ❌ No |
| Emerging markets | ✅ Best | ⚠️ Limited | ⚠️ Limited |

**Winner**: **AFXO v2** - Only oracle with both quality metrics and ordering guarantees.

---

### Use Case 2: Cross-Chain Bridge

**Requirements:**
- Same price on multiple chains
- Verify signature off-chain before bridging
- Prevent replay attacks

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| Off-chain verification | ✅ Full EIP-712 | ❌ On-chain only | ✅ Custom |
| Cross-chain safety | ✅ Explicit chainId | ⚠️ Implicit | ✅ Yes |
| Replay protection | ✅ Multi-layered | ⚠️ Limited | ⚠️ Limited |

**Winner**: **AFXO v2** - Best combination of off-chain verification and security.

---

### Use Case 3: Audit & Compliance

**Requirements:**
- Prove which sources were used for each price
- Verify aggregation was correct
- Historical queryability

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| Provenance proof | ✅ `aggregationHash` | ❌ No | ❌ No |
| Source transparency | ✅ Full | ❌ Opaque | ⚠️ Limited |
| Historical queries | ✅ By round | ⚠️ Complex | ❌ No |

**Winner**: **AFXO v2** - ONLY oracle with full provenance and auditability.

---

### Use Case 4: Emerging Market FX

**Requirements:**
- African currencies (KES, NGN, GHS, etc.)
- Multi-source aggregation
- High confidence scores

| Feature | AFXO v2 | Chainlink | Pyth |
|---------|---------|-----------|------|
| African currencies | ✅ 23 live (50 total) | ❌ Poor coverage | ❌ Poor coverage |
| Source diversity | ✅ 8+ sources/currency | ⚠️ Limited | ⚠️ Limited |
| Central bank data | ✅ Integrated | ❌ No | ❌ No |

**Winner**: **AFXO v2** - Purpose-built for emerging markets.

---

## Migration Path

### From Chainlink to AFXO v2

**Step 1: Understand Data Format Differences**

```solidity
// Chainlink
(, int256 price, , uint256 updatedAt, ) = oracle.latestRoundData();
uint8 decimals = oracle.decimals();

// AFXO v2
AFXOPriceFeed memory feed = fetchAndVerify();
int256 price = feed.price;
uint8 decimals = feed.decimals; // Included in signed data
```

**Step 2: Add Signature Verification**

```solidity
// AFXO requires signature verification
bytes32 digest = _hashTypedDataV4(structHash);
address signer = digest.recover(signature);
require(signer == AFXO_SIGNER, "Invalid");
```

**Step 3: Add Quality Checks**

```solidity
// Now you can check quality!
require(feed.confidence >= 7000, "Low confidence");
require(feed.sourceCount >= 3, "Too few sources");
```

**Benefits:**
- Better data quality visibility
- Explicit expiry protection
- Provenance auditability
- Same or better pricing for emerging markets

---

### From Pyth to AFXO v2

**Step 1: Switch to EIP-712**

```typescript
// Pyth (custom format)
const priceFeed = pythClient.parsePriceFeed(data);

// AFXO v2 (standard EIP-712)
const signer = ethers.verifyTypedData(domain, types, feed, signature);
```

**Step 2: Add Round Tracking**

```typescript
// AFXO adds ordering guarantees
const lastRound = db.getLastRound(feedId);
if (feed.round <= lastRound) throw new Error('Stale');
```

**Step 3: Use Provenance Hash**

```typescript
// AFXO adds full auditability
const receipt = await fetchReceipt(feed.round);
verifyAggregationHash(feed.aggregationHash, receipt);
```

**Benefits:**
- Standard EIP-712 (better tooling)
- Ordering guarantees (round tracking)
- Full provenance (aggregationHash)
- Better emerging market coverage

---

## Conclusion

### AFXO v2 Advantages

1. **Most Complete Standard**: Only oracle with confidence, source count, rounds, expiry, and provenance
2. **Best Developer Experience**: Self-describing, EIP-712, simple verification
3. **Superior Auditability**: Only oracle with cryptographic provenance
4. **Emerging Market Leader**: Best coverage for African and emerging market currencies
5. **Production-Ready**: Used by FiatRails in production

### When to Use Each Oracle

**Use AFXO v2 when:**
- You need emerging market currencies (especially African)
- Data quality visibility is critical
- Auditability/compliance is required
- You want the best developer experience
- You need off-chain signature verification

**Use Chainlink when:**
- You need mature DeFi integration (existing ecosystem)
- You're on Ethereum mainnet with established assets
- You don't need quality metrics or auditability

**Use Pyth when:**
- You need ultra-high-frequency updates
- You're on Solana or non-EVM chains
- You need low-latency price feeds

---

## Technical Contact

For migration support or technical questions:
- **Email**: support@afxo.ai
- **Documentation**: [afxo.ai/docs](https://afxo.ai/docs)
- **API Access**: [afxo.ai/get-access](https://afxo.ai/get-access)

---

**Document Version:** 1.0.0
**Copyright:** © 2025 Digitalyze Labs Ltd. All rights reserved.
