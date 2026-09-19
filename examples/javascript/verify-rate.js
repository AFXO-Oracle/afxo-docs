/**
 * AFXO — verify a signed rate against its inputs, without trusting AFXO's arithmetic.
 *
 * What it checks:
 *   1. the signed rate's EIP-712 signature recovers to the signer you expect
 *   2. the audit record for that rate is signed by the same signer
 *   3. keccak256(preimage) equals the aggregationHash INSIDE the signed rate you hold
 *   4. the rate recomputed from the included quotes equals the signed price
 *
 * What it cannot check: that each recorded quote really came from the named
 * provider. Compare a few against the provider directly (step 5 prints them).
 *
 * Install:  npm install ethers
 * Run:      AFXO_API_KEY=... AFXO_AUDIT_KEY=... node verify-rate.js USD/KES
 * Options:  AFXO_SIGNER=0x...   (pin the signer; defaults to the address in the quick start)
 *           AFXO_API=https://api.afxo.ai   CHAIN_ID=43113
 */

const { ethers } = require('ethers');

const API = process.env.AFXO_API || 'https://api.afxo.ai';
const EXPECTED_SIGNER = process.env.AFXO_SIGNER || '0x92e975Ce2C6bCC6B9D6f59E5a7293e7B6A8A70A9';
const CHAIN_ID = process.env.CHAIN_ID;

const PRICE_FEED_TYPES = {
  AFXOPriceFeed: [
    { name: 'feedId', type: 'bytes32' },
    { name: 'price', type: 'int256' },
    { name: 'decimals', type: 'uint8' },
    { name: 'confidence', type: 'uint16' },
    { name: 'sourceCount', type: 'uint8' },
    { name: 'timestamp', type: 'uint64' },
    { name: 'validUntil', type: 'uint64' },
    { name: 'round', type: 'uint64' },
    { name: 'chainId', type: 'uint64' },
    { name: 'aggregationHash', type: 'bytes32' },
  ],
};

async function getJson(url, key) {
  const res = await fetch(url, { headers: { 'X-API-Key': key } });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || body.success === false) {
    throw new Error(`${url} -> HTTP ${res.status} ${body.error || ''}`);
  }
  return body;
}

// Integer arithmetic throughout, so the result does not depend on floating point.
function recompute(preimage) {
  const [, , method, , ...lines] = preimage.split('\n');
  const included = lines
    .map((l) => l.split('|'))
    .filter((f) => f[3] === '1' && BigInt(f[2]) > 0n)
    .map((f) => ({ id: f[0], rate: BigInt(f[1]), weight: BigInt(f[2]) }));

  if (method === 'weighted_median') {
    included.sort((a, b) => (a.rate < b.rate ? -1 : a.rate > b.rate ? 1 : 0));
    const total = included.reduce((acc, s) => acc + s.weight, 0n);
    let running = 0n;
    for (let i = 0; i < included.length; i++) {
      running += included[i].weight;
      if (running * 2n === total && i + 1 < included.length) {
        return { method, rate18: (included[i].rate + included[i + 1].rate) / 2n, included };
      }
      if (running * 2n > total) return { method, rate18: included[i].rate, included };
    }
  }
  const num = included.reduce((acc, s) => acc + s.rate * s.weight, 0n);
  const den = included.reduce((acc, s) => acc + s.weight, 0n);
  return { method, rate18: num / den, included };
}

async function main() {
  const [base, quote] = (process.argv[2] || 'USD/KES').toUpperCase().split('/');
  const results = [];
  const check = (name, ok, detail) => {
    results.push(ok);
    console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${detail ? '  — ' + detail : ''}`);
  };

  // The signed rate, exactly as a consumer receives it
  const signed = await getJson(
    `${API}/v2/rates/${base}/${quote}/signed${CHAIN_ID ? `?chainId=${CHAIN_ID}` : ''}`,
    process.env.AFXO_API_KEY
  );
  const feed = signed.feed;
  const domain = { name: signed.domain.name, version: signed.domain.version, chainId: signed.domain.chainId };
  if (signed.domain.verifyingContract) domain.verifyingContract = signed.domain.verifyingContract;
  const message = { ...feed };
  delete message.pair;

  const feedSigner = ethers.verifyTypedData(domain, PRICE_FEED_TYPES, message, signed.signature.packed);
  check('1. signed rate recovers to the expected signer', feedSigner === EXPECTED_SIGNER, feedSigner);

  // The inputs behind it, looked up by the hash inside the signed rate
  const audit = await getJson(
    `${API}/audit/${quote}?quote=${base}&hash=${feed.aggregationHash}`,
    process.env.AFXO_AUDIT_KEY
  );
  const record = audit.data.records[0];
  if (!record) {
    check('2. audit record found for this aggregationHash', false, 'none returned (hash version 1 feeds cannot be looked up by inputs)');
    process.exit(1);
  }
  const auditSigner = ethers.verifyTypedData(
    audit.verification.domain, audit.verification.types, record.signed.message, record.signed.signature
  );
  check('2. audit record is signed by the same signer', auditSigner === EXPECTED_SIGNER, auditSigner);

  const hash = ethers.keccak256(ethers.toUtf8Bytes(record.preimageV2));
  check('3. keccak256(inputs) equals the hash inside the signed rate', hash === feed.aggregationHash, hash);

  const { method, rate18, included } = recompute(record.preimageV2);
  const scale = 10n ** BigInt(18 - Number(feed.decimals));
  const recomputedPrice = (rate18 + scale / 2n) / scale; // round to the feed's decimals
  check(
    `4. ${method} of the included quotes equals the signed price`,
    recomputedPrice === BigInt(feed.price),
    `recomputed ${recomputedPrice} vs signed ${feed.price} (${feed.decimals} decimals)`
  );

  console.log('\n5. Quotes to spot-check against the providers yourself:');
  for (const s of record.sourceBreakdown) {
    console.log(
      `   ${s.included ? 'included' : 'EXCLUDED'}  ${s.sourceId.padEnd(18)} ${s.rate}  weight ${s.weight}  at ${s.timestamp}` +
        (s.exclusionReason ? `  (${s.exclusionReason})` : '')
    );
  }
  console.log(`\nBuild that produced this: ${audit.build.commit} (${API}/version)`);
  process.exit(results.every(Boolean) ? 0 : 1);
}

main().catch((err) => {
  console.error('ERROR', err.message);
  process.exit(2);
});
