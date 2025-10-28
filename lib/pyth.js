import axios from 'axios';

const PYTH_ENDPOINT = process.env.PYTH_ENDPOINT || 'https://hermes.pyth.network';

/**
 * Get price from Pyth at a specific timestamp with retry logic
 * @param {string} priceId - Pyth price feed ID
 * @param {number} timestamp - Unix timestamp in seconds
 * @param {number} retries - Number of retries on failure
 * @returns {Promise<number|null>} Price or null if unavailable
 */
export async function getPythPriceAt(priceId, timestamp, retries = 3) {
  const MAX_SKEW_SEC = parseInt(process.env.MAX_PRICE_SKEW_SEC || '15', 10);

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      // Try exact timestamp first, then with skew tolerance
      const timestamps = [timestamp];
      if (attempt > 0) {
        // On retry, try timestamps within skew window
        timestamps.push(timestamp - MAX_SKEW_SEC, timestamp + MAX_SKEW_SEC);
      }

      for (const ts of timestamps) {
        const url = `${PYTH_ENDPOINT}/v2/updates/price/${ts}`;

        const response = await axios.get(url, {
          params: {
            ids: [priceId],
            parsed: true,
          },
          timeout: 10000,
        });

        if (response.data?.parsed?.[0]?.price?.price) {
          const price = parseFloat(response.data.parsed[0].price.price);
          const expo = response.data.parsed[0].price.expo;
          const adjustedPrice = price * Math.pow(10, expo);

          console.log(`Pyth price fetched for ${priceId} at ${ts}: ${adjustedPrice}`);
          return adjustedPrice;
        }
      }

      // Wait before retry
      if (attempt < retries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (attempt + 1)));
      }
    } catch (error) {
      console.error(`Attempt ${attempt + 1}/${retries + 1} failed for ${priceId} at ${timestamp}:`, error.message);

      if (attempt === retries) {
        return null;
      }
    }
  }

  return null;
}

/**
 * Get current/latest price from Pyth
 * @param {string} priceId - Pyth price feed ID
 * @returns {Promise<number|null>}
 */
export async function getPythLatestPrice(priceId) {
  try {
    const url = `${PYTH_ENDPOINT}/v2/updates/price/latest`;

    const response = await axios.get(url, {
      params: {
        ids: [priceId],
        parsed: true,
      },
      timeout: 10000,
    });

    if (response.data?.parsed?.[0]?.price?.price) {
      const price = parseFloat(response.data.parsed[0].price.price);
      const expo = response.data.parsed[0].price.expo;
      return price * Math.pow(10, expo);
    }

    return null;
  } catch (error) {
    console.error(`Error fetching latest Pyth price for ${priceId}:`, error.message);
    return null;
  }
}

/**
 * Calculate percentage change
 */
export function calculatePctChange(priceStart, priceEnd) {
  if (!priceStart || priceStart === 0) return null;
  return ((priceEnd - priceStart) / priceStart) * 100;
}

/**
 * Determine battle winner based on price changes
 * @returns {{ winner: 'A'|'B'|'TIE'|null, reason: string }}
 */
export function determineBattleWinner(deltaA, deltaB) {
  const TIE_THRESHOLD_BPS = parseInt(process.env.TIE_BPS || '10', 10);
  const TIE_THRESHOLD_PCT = TIE_THRESHOLD_BPS / 100; // 0.10%

  if (deltaA === null || deltaB === null) {
    return { winner: null, reason: 'INSUFFICIENT_DATA' };
  }

  const diff = Math.abs(deltaA - deltaB);

  if (diff < TIE_THRESHOLD_PCT) {
    return { winner: 'TIE', reason: 'TIE' };
  }

  if (deltaA > deltaB) {
    return { winner: 'A', reason: 'OK' };
  } else {
    return { winner: 'B', reason: 'OK' };
  }
}

/**
 * Fetch prices for both tokens and determine winner
 */
export async function settleBattle(tokenAFeedId, tokenBFeedId, startsAt, endsAt) {
  const startTimestamp = Math.floor(new Date(startsAt).getTime() / 1000);
  const endTimestamp = Math.floor(new Date(endsAt).getTime() / 1000);

  // Fetch prices at start and end
  const [priceAStart, priceAEnd, priceBStart, priceBEnd] = await Promise.all([
    getPythPriceAt(tokenAFeedId, startTimestamp),
    getPythPriceAt(tokenAFeedId, endTimestamp),
    getPythPriceAt(tokenBFeedId, startTimestamp),
    getPythPriceAt(tokenBFeedId, endTimestamp),
  ]);

  // Calculate percentage changes
  const deltaA = calculatePctChange(priceAStart, priceAEnd);
  const deltaB = calculatePctChange(priceBStart, priceBEnd);

  // Determine winner
  const result = determineBattleWinner(deltaA, deltaB);

  return {
    priceAStart,
    priceAEnd,
    priceBStart,
    priceBEnd,
    deltaA,
    deltaB,
    winner: result.winner,
    reason: result.reason,
  };
}
