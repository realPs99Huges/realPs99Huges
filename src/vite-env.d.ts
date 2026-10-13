/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Optional URL of your own reading backend. Leave unset to use the local demo engine. */
  readonly VITE_ASTRA_READING_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
