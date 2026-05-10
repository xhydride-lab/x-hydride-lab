/**
 * Tolerant JSON extraction.
 *
 * Even when models are instructed to emit strict JSON they sometimes wrap
 * the payload in code fences or add a leading sentence. This helper extracts
 * the JSON object portion of a string before parsing.
 */
export function extractJsonObject(text: string): unknown {
  if (!text) {
    throw new Error("Empty response from model.");
  }

  const trimmed = text.trim();

  const fenced = trimmed.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced ? fenced[1].trim() : trimmed;

  // First attempt: parse exactly what we have.
  try {
    return JSON.parse(candidate);
  } catch {
    // fall through
  }

  // Fall back: scan for the first balanced JSON object using a brace counter
  // that ignores braces inside string literals.
  const start = candidate.indexOf("{");
  if (start === -1) {
    throw new Error("No JSON object found in model response.");
  }

  let depth = 0;
  let inString = false;
  let escape = false;
  for (let i = start; i < candidate.length; i++) {
    const char = candidate[i];

    if (escape) {
      escape = false;
      continue;
    }

    if (char === "\\") {
      escape = true;
      continue;
    }

    if (char === '"') {
      inString = !inString;
      continue;
    }

    if (inString) continue;

    if (char === "{") {
      depth++;
    } else if (char === "}") {
      depth--;
      if (depth === 0) {
        const slice = candidate.slice(start, i + 1);
        return JSON.parse(slice);
      }
    }
  }

  throw new Error("Unbalanced JSON object in model response.");
}
