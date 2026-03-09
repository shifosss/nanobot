/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly Database_Project_URL?: string;
  readonly Database_Public_Anon_Key?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
