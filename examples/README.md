# AFXO Integration Examples

Example code for integrating with AFXO oracles.

## Contents

- [JavaScript](./javascript/) — Node.js and browser examples
- [Python](./python/) — Python integration examples
- [Solidity](./solidity/) — Smart contract integration patterns

## Getting Started

### JavaScript

```bash
# Set your API key
export AFXO_API_KEY=your_api_key

# Run the example
node javascript/basic-usage.js
```

### Python

```bash
# Install dependencies
pip install requests

# Set your API key
export AFXO_API_KEY=your_api_key

# Run the example
python python/basic_usage.py
```

### Solidity

Copy the interface and example contracts to your project:

```bash
cp contracts/interfaces/IAFXOOracle.sol your-project/contracts/interfaces/
cp examples/solidity/PriceConsumer.sol your-project/contracts/
```

## Get an API Key

Visit [afxo.ai/get-access](https://afxo.ai/get-access) to get your API key.

## Documentation

- [API Reference](../docs/api-reference.md)
- [Smart Contracts](../docs/smart-contracts.md)
- [Methodology](../docs/methodology.md)
