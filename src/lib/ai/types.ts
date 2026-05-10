/**
 * Internal types for the AI provider layer.
 *
 * These types are kept intentionally narrow so that swapping the underlying
 * provider (xAI Grok, etc.) does not leak into the rest of the application.
 */

export interface ChatMessage {
  role: "system" | "user" | "assistant";
  content: string;
}

/**
 * Structured-output JSON schema definition that follows the
 * OpenAI-compatible `response_format: { type: "json_schema" }` shape that
 * xAI Grok supports.
 */
export interface JsonSchemaResponseFormat {
  type: "json_schema";
  json_schema: {
    name: string;
    /** When true, the provider must reject any output that violates schema. */
    strict?: boolean;
    schema: Record<string, unknown>;
  };
}

export type ResponseFormat =
  | { type: "json_object" }
  | { type: "text" }
  | JsonSchemaResponseFormat;

export interface ChatCompletionRequest {
  model: string;
  messages: ChatMessage[];
  /** Lower temperature is preferred for structured scientific output. */
  temperature?: number;
  /** When supported by the provider, force structured output. */
  response_format?: ResponseFormat;
  /** Hard ceiling so a runaway response cannot exhaust budget. */
  max_tokens?: number;
}

export interface ChatCompletionResponse {
  id: string;
  model: string;
  content: string;
  finish_reason: string | null;
  usage?: {
    prompt_tokens?: number;
    completion_tokens?: number;
    total_tokens?: number;
  };
}

export interface AIProvider {
  readonly name: string;
  readonly model: string;
  readonly available: boolean;
  chat(request: ChatCompletionRequest): Promise<ChatCompletionResponse>;
}

export interface ProviderResolution {
  provider: AIProvider;
  /** True when no API key was found and we fell back to demo behavior. */
  demoMode: boolean;
  reason?: string;
}
