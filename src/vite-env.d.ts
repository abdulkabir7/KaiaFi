/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ARC_USDC_VAULT_ADDRESS?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
