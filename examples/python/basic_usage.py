"""
AFXO Python Examples - Basic Usage

Install requests: pip install requests
"""

import os
import requests
from typing import Optional

BASE_URL = "https://api.afxo.ai/v1"


class AFXOClient:
    """Simple AFXO API client."""

    def __init__(self, api_key: str):
        self.api_key = api_key
        self.session = requests.Session()
        self.session.headers.update({"X-API-Key": api_key})

    def get_rate(self, base: str, quote: str) -> dict:
        """Get current exchange rate for a currency pair."""
        response = self.session.get(f"{BASE_URL}/rates/{base}/{quote}")
        response.raise_for_status()
        return response.json()

    def get_batch_rates(self, pairs: list[str]) -> dict:
        """Get rates for multiple currency pairs."""
        pairs_param = ",".join(pairs)
        response = self.session.get(f"{BASE_URL}/rates/batch?pairs={pairs_param}")
        response.raise_for_status()
        return response.json()

    def get_history(
        self,
        base: str,
        quote: str,
        from_date: str,
        to_date: str,
        interval: str = "daily",
    ) -> dict:
        """Get historical rate data."""
        response = self.session.get(
            f"{BASE_URL}/rates/{base}/{quote}/history",
            params={"from": from_date, "to": to_date, "interval": interval},
        )
        response.raise_for_status()
        return response.json()

    def get_status(self) -> dict:
        """Get network status."""
        response = self.session.get(f"{BASE_URL}/status")
        response.raise_for_status()
        return response.json()


def main():
    # Get API key from environment
    api_key = os.environ.get("AFXO_API_KEY")
    if not api_key:
        print("Please set AFXO_API_KEY environment variable")
        return

    client = AFXOClient(api_key)

    # Get single rate
    print("=== KES/USD Rate ===")
    kes_rate = client.get_rate("KES", "USD")
    print(f"Rate: {kes_rate['rate']}")
    print(f"Confidence: {kes_rate['confidence']}%")
    print(f"Sources: {kes_rate['sources']}")
    print()

    # Get batch rates
    print("=== Batch Rates ===")
    batch = client.get_batch_rates(["KES/USD", "NGN/USD", "GHS/USD", "ZAR/USD"])
    for rate in batch["rates"]:
        print(f"{rate['pair']}: {rate['rate']} (confidence: {rate['confidence']}%)")
    print()

    # Check network status
    print("=== Network Status ===")
    status = client.get_status()
    print(f"Status: {status['status']}")
    print(f"Operators: {status['operators']}")
    print(f"Currencies: {status['currencies']}")


if __name__ == "__main__":
    main()
