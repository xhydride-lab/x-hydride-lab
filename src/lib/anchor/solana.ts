import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";
import bs58 from "bs58";

/**
 * Solana on-chain anchoring.
 *
 * Writes a Memo program transaction containing the audit hash payload so the
 * SHA-256 digest of every X-Hydride hypothesis can be verified against an
 * immutable, public, on-chain record. Safe by design: if no payer key is
 * configured the module reports `available: false` and the caller falls back
 * to off-chain audit only.
 *
 * Cost: a memo transaction is the 5000-lamport base fee (~0.000005 SOL).
 * Even a busy production run anchors thousands of audits for < 0.05 SOL.
 *
 * Server-only — never import from a client component.
 */

const MEMO_PROGRAM_ID = new PublicKey(
  "MemoSq4gqABAXKb96qnH8TysNcWxMyWCqXgDLGmfcHr",
);

const DEFAULT_RPC = "https://api.mainnet-beta.solana.com";
const DEFAULT_NETWORK = "mainnet-beta";

let cachedKeypair: Keypair | null | undefined;

function resolveKeypair(): Keypair | null {
  if (cachedKeypair !== undefined) return cachedKeypair;
  const raw = process.env.SOLANA_PAYER_SECRET_KEY;
  if (!raw) {
    cachedKeypair = null;
    return null;
  }
  try {
    let secret: Uint8Array;
    const trimmed = raw.trim();
    if (trimmed.startsWith("[")) {
      // JSON array of 64 bytes (solana-keygen format)
      const arr = JSON.parse(trimmed) as number[];
      secret = Uint8Array.from(arr);
    } else {
      // base58 encoded 64-byte secret
      secret = bs58.decode(trimmed);
    }
    cachedKeypair = Keypair.fromSecretKey(secret);
    return cachedKeypair;
  } catch (error) {
    console.error("[solana-anchor] invalid SOLANA_PAYER_SECRET_KEY:", error);
    cachedKeypair = null;
    return null;
  }
}

export interface AnchorResult {
  available: boolean;
  signature?: string;
  network?: string;
  explorerUrl?: string;
  error?: string;
}

/**
 * Anchors a short text payload via the Memo program. Returns the transaction
 * signature on success, or `available: false` if no payer is configured.
 *
 * The memo string is bounded to a sensible size; the audit hash schema we ship
 * with is roughly 380 bytes which fits comfortably under Solana's transaction
 * size limit.
 */
export async function anchorPayload(
  memo: string,
  opts?: { rpcUrl?: string; network?: string },
): Promise<AnchorResult> {
  const payer = resolveKeypair();
  if (!payer) {
    return { available: false };
  }

  const network = opts?.network ?? process.env.SOLANA_NETWORK ?? DEFAULT_NETWORK;
  const rpcUrl = opts?.rpcUrl ?? process.env.SOLANA_RPC_URL ?? DEFAULT_RPC;

  if (memo.length > 566) {
    // Memo program supports up to ~566 bytes safely.
    memo = memo.slice(0, 566);
  }

  try {
    const connection = new Connection(rpcUrl, "confirmed");
    const { blockhash, lastValidBlockHeight } =
      await connection.getLatestBlockhash("confirmed");
    const tx = new Transaction({
      feePayer: payer.publicKey,
      blockhash,
      lastValidBlockHeight,
    }).add(
      new TransactionInstruction({
        keys: [],
        programId: MEMO_PROGRAM_ID,
        data: Buffer.from(memo, "utf8"),
      }),
    );
    tx.sign(payer);
    const signature = await connection.sendRawTransaction(tx.serialize(), {
      skipPreflight: false,
      preflightCommitment: "confirmed",
    });
    // Don't block the caller waiting for full finality; we just need the sig.
    return {
      available: true,
      signature,
      network,
      explorerUrl: buildExplorerUrl(signature, network),
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error("[solana-anchor] failed:", message);
    return { available: true, error: message };
  }
}

export function buildExplorerUrl(signature: string, network: string): string {
  const cluster = network === "mainnet-beta" ? "" : `?cluster=${network}`;
  return `https://solscan.io/tx/${signature}${cluster}`;
}

/**
 * Builds the compact memo payload for an audit record. Keeps under the
 * memo-program byte budget while still carrying the four canonical hashes.
 */
export function buildAuditMemo(audit: {
  audit_id: string;
  candidate_id: string;
  input_hash: string;
  output_hash: string;
  report_hash: string;
  simulation_hash: string;
  model_name?: string;
  version?: string;
}): string {
  return JSON.stringify({
    src: "x-hydride-lab",
    v: audit.version ?? "0.1.0",
    aid: audit.audit_id,
    cid: audit.candidate_id,
    m: audit.model_name ?? "grok",
    h: {
      i: audit.input_hash,
      o: audit.output_hash,
      r: audit.report_hash,
      s: audit.simulation_hash,
    },
  });
}

/**
 * Whether anchoring is currently configured. Cheap synchronous probe useful
 * for surfacing demo-state UI without forcing a network call.
 */
export function anchorEnabled(): boolean {
  return resolveKeypair() !== null;
}
