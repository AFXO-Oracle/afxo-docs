// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title IAFXOOracle
 * @notice AFXO Oracle interface - AggregatorV3 compatible with extensions
 * @dev Compatible with Chainlink's AggregatorV3Interface for easy integration
 */
interface IAFXOOracle {
    // ============ AggregatorV3 Interface ============

    /**
     * @notice Returns the number of decimals for the price feed
     * @return The number of decimals (always 8 for AFXO)
     */
    function decimals() external view returns (uint8);

    /**
     * @notice Returns a description of the price feed
     * @return Description string (e.g., "KES/USD")
     */
    function description() external view returns (string memory);

    /**
     * @notice Returns the version of the oracle
     * @return Version number
     */
    function version() external view returns (uint256);

    /**
     * @notice Returns data for a specific round
     * @param _roundId The round ID to retrieve
     * @return roundId The round ID
     * @return answer The price for this round
     * @return startedAt Timestamp when round started
     * @return updatedAt Timestamp when round was updated
     * @return answeredInRound The round ID in which the answer was computed
     */
    function getRoundData(uint80 _roundId)
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    /**
     * @notice Returns data for the latest round
     * @return roundId The current round ID
     * @return answer The current price (8 decimals)
     * @return startedAt Timestamp when round started
     * @return updatedAt Timestamp of last update
     * @return answeredInRound The round ID in which the answer was computed
     */
    function latestRoundData()
        external
        view
        returns (
            uint80 roundId,
            int256 answer,
            uint256 startedAt,
            uint256 updatedAt,
            uint80 answeredInRound
        );

    // ============ AFXO Extensions ============

    /**
     * @notice Returns the confidence score for the current rate
     * @return Confidence score (0-100)
     * @dev 85-100 = High, 70-84 = Medium, <70 = Low
     */
    function getConfidence() external view returns (uint8);

    /**
     * @notice Returns the number of active data sources
     * @return Number of sources contributing to the current rate
     */
    function getSourceCount() external view returns (uint8);

    /**
     * @notice Returns the minimum confidence threshold
     * @return Minimum confidence required for valid rates
     */
    function minConfidence() external view returns (uint8);

    /**
     * @notice Checks if the oracle is currently active and providing data
     * @return True if oracle is active
     */
    function isActive() external view returns (bool);

    // ============ Events ============

    /**
     * @notice Emitted when a new rate is published
     * @param roundId The round ID
     * @param price The new price
     * @param confidence The confidence score
     * @param sources Number of data sources
     * @param timestamp Update timestamp
     */
    event RateUpdated(
        uint80 indexed roundId,
        int256 price,
        uint8 confidence,
        uint8 sources,
        uint256 timestamp
    );
}
