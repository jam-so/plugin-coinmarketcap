import { IAgentRuntime } from "@elizaos/core";
import { z } from "zod";

function parseTargetSymbols(targetSymbolsStr?: string | null): string[] {
    if (!targetSymbolsStr?.trim()) {
        return [];
    }
    return targetSymbolsStr
        .split(",")
        .map((symbol) => symbol.trim())
        .filter(Boolean);
}

export const coinmarketcapEnvSchema = z.object({
    COINMARKETCAP_API_KEY: z
        .string()
        .min(1, "CoinMarketCap API key is required"),
    COINMARKETCAP_PROVIDER_TARGET_SYMBOLS: z
        .array(
            z
                .string()
                .min(1, "CoinMarketCap provider target symbols is required")
        )
        .default(["BTC", "ETH", "BNB", "SOL"]),
});

export type CoinMarketCapConfig = z.infer<typeof coinmarketcapEnvSchema>;

export async function validateCoinMarketCapConfig(
    runtime: IAgentRuntime
): Promise<CoinMarketCapConfig> {
    try {
        const config = {
            COINMARKETCAP_API_KEY: runtime.getSetting("COINMARKETCAP_API_KEY"),
            COINMARKETCAP_PROVIDER_TARGET_SYMBOLS: parseTargetSymbols(
                runtime.getSetting("COINMARKETCAP_PROVIDER_TARGET_SYMBOLS") ||
                    "BTC,ETH,BNB,SOL"
            ),
        };

        return coinmarketcapEnvSchema.parse(config);
    } catch (error) {
        if (error instanceof z.ZodError) {
            const errorMessages = error.errors
                .map((err) => `${err.path.join(".")}: ${err.message}`)
                .join("\n");
            throw new Error(
                `CoinMarketCap configuration validation failed:\n${errorMessages}`
            );
        }
        throw error;
    }
}
