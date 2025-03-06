import { Plugin } from "@elizaos/core";
import getPrice from "./actions/getPrice";
import { coinmarketcapProvider } from "./providers";

export const coinmarketcapPlugin: Plugin = {
    name: "coinmarketcap",
    description: "CoinMarketCap Plugin for Eliza",
    actions: [getPrice],
    evaluators: [],
    providers: [coinmarketcapProvider],
};

export default coinmarketcapPlugin;
