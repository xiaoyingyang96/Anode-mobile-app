export type ChatbotPricePayload = {
  symbol: string;
  assetId: string;
  name: string | null;
  price: number;
  currency: string;
  open: number;
  high: number;
  low: number;
  close: number;
  changePct: number;
  asOf: string;
  source: string;
};

export type ChatbotAssistantPayload = {
  reply: string;
  source: "openai";
  model: string;
};

const CHATBOT_SUPABASE_URL = process.env.EXPO_PUBLIC_CHATBOT_SUPABASE_URL;
const CHATBOT_SUPABASE_ANON_KEY =
  process.env.EXPO_PUBLIC_CHATBOT_SUPABASE_ANON_KEY;

const KNOWN_PRICE_WORDS = [
  "price",
  "trading",
  "trade",
  "worth",
  "cost",
  "quote",
  "latest",
  "current",
  "today",
  "doing",
  "valued",
];

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "are",
  "at",
  "be",
  "for",
  "get",
  "how",
  "i",
  "in",
  "is",
  "it",
  "me",
  "of",
  "on",
  "price",
  "show",
  "tell",
  "the",
  "today",
  "trade",
  "trading",
  "value",
  "what",
  "whats",
  "worth",
]);

const SYMBOL_ALIASES: Record<string, string> = {
  bitcoin: "BTC",
  btc: "BTC",
  ethereum: "ETH",
  eth: "ETH",
  solana: "SOL",
  sol: "SOL",
  ripple: "XRP",
  xrp: "XRP",
  dogecoin: "DOGE",
  doge: "DOGE",
  avalanche: "AVAX",
  avax: "AVAX",
  aave: "AAVE",
  chainlink: "LINK",
  link: "LINK",
};

export function extractPriceSymbol(message: string): string | null {
  const normalized = message.trim().toLowerCase();
  if (!normalized) return null;

  const hasPriceIntent = KNOWN_PRICE_WORDS.some((word) =>
    normalized.includes(word)
  );

  if (!hasPriceIntent) return null;

  const tokens = normalized.match(/[a-z0-9-]+/g) ?? [];
  for (const token of tokens) {
    if (SYMBOL_ALIASES[token]) {
      return SYMBOL_ALIASES[token];
    }

    if (/^[a-z]{2,10}-usd$/.test(token)) {
      return token.replace(/-usd$/, "").toUpperCase();
    }

    if (/^[a-z]{2,10}$/.test(token) && !STOP_WORDS.has(token)) {
      const upper = token.toUpperCase();
      if (upper.length <= 5) return upper;
    }
  }

  return null;
}

export function formatPriceReply(payload: ChatbotPricePayload): string {
  const amount = payload.price.toLocaleString("en-US", {
    minimumFractionDigits: payload.price >= 1 ? 2 : 4,
    maximumFractionDigits: payload.price >= 1 ? 2 : 6,
  });
  const direction = payload.changePct >= 0 ? "up" : "down";
  const change = Math.abs(payload.changePct).toFixed(2);

  return `${payload.symbol} is $${amount} ${payload.currency}. It is ${direction} ${change}% over the current 1d window, as of ${payload.asOf}.`;
}

export async function fetchChatbotPrice(
  symbol: string
): Promise<ChatbotPricePayload> {
  if (!CHATBOT_SUPABASE_URL || !CHATBOT_SUPABASE_ANON_KEY) {
    throw new Error("Chatbot Supabase environment variables are not set.");
  }

  const res = await fetch(
    `${CHATBOT_SUPABASE_URL}/functions/v1/chatbot_price`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CHATBOT_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ symbol }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ?? `Chatbot price request failed with HTTP ${res.status}.`
    );
  }

  return data as ChatbotPricePayload;
}

export async function fetchChatbotAssistant(
  message: string
): Promise<ChatbotAssistantPayload> {
  if (!CHATBOT_SUPABASE_URL || !CHATBOT_SUPABASE_ANON_KEY) {
    throw new Error("Chatbot Supabase environment variables are not set.");
  }

  const res = await fetch(
    `${CHATBOT_SUPABASE_URL}/functions/v1/chatbot_assistant`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: CHATBOT_SUPABASE_ANON_KEY,
      },
      body: JSON.stringify({ message }),
    }
  );

  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error?.message ??
        `Chatbot assistant request failed with HTTP ${res.status}.`
    );
  }

  return data as ChatbotAssistantPayload;
}
