declare namespace Cloudflare {
  interface Env {
    DB?: D1Database;
    BUCKET?: R2Bucket;
    CONTRACT_ADDRESS?: string;
    RPC_URL?: string;
    CONTRACT_START_BLOCK?: string;
  }
}
