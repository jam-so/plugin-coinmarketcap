import {
    elizaLogger,
    IAgentRuntime,
    Memory,
    Provider,
    State,
} from "@elizaos/core";
import { createPriceService } from "../actions/getPrice/service";
import { PriceData } from "../actions/getPrice/types";
import { validateCoinMarketCapConfig } from "../environment";

const COINMARKETCAP_PRICE_CACHE_KEY = "coinmarketcap/price";
const COINMARKETCAP_PRICE_CACHE_TTL = 60 * 60 * 1000; // 1 hour
const COINMARKETCAP_PROVIDER_CURRENCY = "USD";

const coinmarketcapProvider: Provider = {
    get: async (runtime: IAgentRuntime, _message: Memory, _state?: State) => {
        const config = await validateCoinMarketCapConfig(runtime);

        const cachedPrice = await runtime.cacheManager.get<PriceData[]>(
            COINMARKETCAP_PRICE_CACHE_KEY
        );

        let priceData: PriceData[] = [];
        const targetSymbols = config.COINMARKETCAP_PROVIDER_TARGET_SYMBOLS;

        if (cachedPrice?.length > 0) {
            elizaLogger.log("Using cached price data");
            priceData = cachedPrice;
        } else {
            elizaLogger.log("Fetching price data from CoinMarketCap", {
                config: config.COINMARKETCAP_PROVIDER_TARGET_SYMBOLS,
            });
            const priceService = createPriceService(
                config.COINMARKETCAP_API_KEY
            );
            try {
                const _priceData = await Promise.all(
                    targetSymbols.map(async (symbol) => {
                        return priceService.getPrice(
                            symbol,
                            COINMARKETCAP_PROVIDER_CURRENCY
                        );
                    })
                );
                elizaLogger.log("Price data fetched from CoinMarketCap", {
                    priceData: _priceData,
                });

                priceData = _priceData;
                await runtime.cacheManager.set(
                    COINMARKETCAP_PRICE_CACHE_KEY,
                    priceData,
                    {
                        expires: Date.now() + COINMARKETCAP_PRICE_CACHE_TTL,
                    }
                );
            } catch (error) {
                return [];
            }
        }

        return `The current price of ${priceData.map((price, index) => `${targetSymbols[index]}: ${price.price} ${COINMARKETCAP_PROVIDER_CURRENCY}`).join(", ")}`;
    },
};
export { coinmarketcapProvider };
