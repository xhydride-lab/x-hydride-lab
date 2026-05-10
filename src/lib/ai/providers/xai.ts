import type {
  AIProvider,
  ChatCompletionRequest,
  ChatCompletionResponse,
} from "@/lib/ai/types";

/**
 * xAI Grok provider — the default AI provider for X-Hydride Lab.
 *
 * The provider speaks the OpenAI-compatible /chat/completions schema that
 * xAI exposes at https://api.x.ai/v1. API keys are read server-side only
 * (never exposed to the browser) and the provider gracefully reports
 * "unavailable" when the key is missing so the app can fall back to demo
 * mode without throwing.
 */

const DEFAULT_BASE_URL = "https://api.x.ai/v1";
const DEFAULT_MODEL = "grok-4.3";
const DEFAULT_TIMEOUT_MS = 60_000;

interface XAIProviderOptions {
  apiKey?: string;
  model?: string;
  baseUrl?: string;
  timeoutMs?: number;
}

export class XAIProvider implements AIProvider {
  public readonly name = "xAI Grok";
  public readonly model: string;
  public readonly available: boolean;

  private readonly apiKey: string;
  private readonly baseUrl: string;
  private readonly timeoutMs: number;

  constructor(options: XAIProviderOptions = {}) {
    this.apiKey = options.apiKey ?? "";
    this.model = options.model ?? DEFAULT_MODEL;
    this.baseUrl = (options.baseUrl ?? DEFAULT_BASE_URL).replace(/\/$/, "");
    this.timeoutMs = options.timeoutMs ?? DEFAULT_TIMEOUT_MS;
    this.available = this.apiKey.length > 0;
  }

  async chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse> {
    if (!this.available) {
      throw new Error(
        "xAI provider is not available: XAI_API_KEY is not configured.",
      );
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const response = await fetch(`${this.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: request.model || this.model,
          messages: request.messages,
          temperature: request.temperature ?? 0.4,
          max_tokens: request.max_tokens ?? 4096,
          ...(request.response_format
            ? { response_format: request.response_format }
            : {}),
        }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const errorText = await safeReadText(response);
        throw new Error(
          `xAI request failed with status ${response.status}: ${errorText}`,
        );
      }

      const json = (await response.json()) as XAIChatResponse;
      const choice = json.choices?.[0];
      const content = choice?.message?.content ?? "";

      return {
        id: json.id ?? "",
        model: json.model ?? this.model,
        content,
        finish_reason: choice?.finish_reason ?? null,
        usage: json.usage
          ? {
              prompt_tokens: json.usage.prompt_tokens,
              completion_tokens: json.usage.completion_tokens,
              total_tokens: json.usage.total_tokens,
            }
          : undefined,
      };
    } finally {
      clearTimeout(timer);
    }
  }
}

interface XAIChatResponse {
  id?: string;
  model?: string;
  choices?: Array<{
    message?: { role?: string; content?: string };
    finish_reason?: string;
  }>;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

async function safeReadText(response: Response): Promise<string> {
  try {
    return await response.text();
  } catch {
    return "<no body>";
  }
}

/**
 * Factory that reads provider configuration from environment variables.
 * Always returns a provider instance; check `.available` before calling.
 */
export function createXAIProviderFromEnv(): XAIProvider {
  return new XAIProvider({
    apiKey: process.env.XAI_API_KEY,
    model: process.env.XAI_MODEL,
    baseUrl: process.env.XAI_BASE_URL,
  });
}
