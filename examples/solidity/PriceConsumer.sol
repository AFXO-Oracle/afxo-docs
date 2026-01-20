// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../../contracts/interfaces/IAFXOOracle.sol";

/**
 * @title PriceConsumer
 * @notice Example contract demonstrating AFXO oracle integration
 * @dev Shows basic usage, freshness checks, and confidence validation
 */
contract PriceConsumer {
    IAFXOOracle public oracle;

    // Configuration
    uint256 public constant MAX_STALENESS = 1 hours;
    uint8 public constant MIN_CONFIDENCE = 70;

    // Events
    event PriceRead(int256 price, uint8 confidence, uint256 timestamp);

    constructor(address _oracle) {
        oracle = IAFXOOracle(_oracle);
    }

    /**
     * @notice Get the latest price (basic usage)
     * @return price The current price with 8 decimals
     */
    function getLatestPrice() public view returns (int256 price) {
        (, price, , , ) = oracle.latestRoundData();
        return price;
    }

    /**
     * @notice Get price with freshness validation
     * @return price The current price
     * @return updatedAt When the price was last updated
     */
    function getPriceWithFreshness()
        public
        view
        returns (int256 price, uint256 updatedAt)
    {
        (, price, , updatedAt, ) = oracle.latestRoundData();

        require(
            block.timestamp - updatedAt < MAX_STALENESS,
            "Price data is stale"
        );

        return (price, updatedAt);
    }

    /**
     * @notice Get price with full validation (recommended for production)
     * @return price The current price
     * @return confidence The confidence score
     * @return sources Number of data sources
     */
    function getValidatedPrice()
        public
        view
        returns (int256 price, uint8 confidence, uint8 sources)
    {
        // Check oracle is active
        require(oracle.isActive(), "Oracle is not active");

        // Get price data
        (, price, , uint256 updatedAt, ) = oracle.latestRoundData();

        // Validate price
        require(price > 0, "Invalid price");

        // Check freshness
        require(
            block.timestamp - updatedAt < MAX_STALENESS,
            "Price data is stale"
        );

        // Get and validate confidence
        confidence = oracle.getConfidence();
        require(confidence >= MIN_CONFIDENCE, "Confidence too low");

        // Get source count
        sources = oracle.getSourceCount();

        return (price, confidence, sources);
    }

    /**
     * @notice Convert amount from base to quote currency
     * @param baseAmount Amount in base currency (e.g., KES)
     * @return quoteAmount Amount in quote currency (e.g., USD)
     */
    function convert(uint256 baseAmount) public view returns (uint256 quoteAmount) {
        (int256 price, , ) = getValidatedPrice();

        // Price has 8 decimals
        // baseAmount * price / 10^8 = quoteAmount
        quoteAmount = (baseAmount * uint256(price)) / 1e8;

        return quoteAmount;
    }

    /**
     * @notice Example: Check if price moved significantly
     * @param previousPrice The previous price to compare against
     * @param maxDeviation Maximum allowed deviation in basis points (1 bp = 0.01%)
     * @return withinBounds True if current price is within deviation bounds
     */
    function isPriceWithinBounds(
        int256 previousPrice,
        uint256 maxDeviation
    ) public view returns (bool withinBounds) {
        int256 currentPrice = getLatestPrice();

        // Calculate deviation in basis points
        int256 deviation = ((currentPrice - previousPrice) * 10000) / previousPrice;

        // Check if absolute deviation is within bounds
        if (deviation < 0) deviation = -deviation;

        return uint256(deviation) <= maxDeviation;
    }
}
