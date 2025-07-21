/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_GOOGLE_GENAI_API_KEY?: string;
  readonly VITE_GOOGLE_GENAI_MODEL?: string;
  readonly VITE_GOOGLE_GENAI_TEMPERATURE?: string;
  readonly VITE_GOOGLE_GENAI_MAX_TOKENS?: string;
  readonly VITE_OLLAMA_BASE_URL?: string;
  readonly VITE_OLLAMA_MODEL?: string;
  readonly VITE_OLLAMA_TEMPERATURE?: string;
  readonly VITE_OLLAMA_MAX_TOKENS?: string;
  readonly VITE_OLLAMA_TIMEOUT?: string;
  readonly VITE_LM_STUDIO_BASE_URL?: string;
  readonly VITE_LM_STUDIO_API_KEY?: string;
  readonly VITE_LM_STUDIO_MODEL?: string;
  readonly VITE_LM_STUDIO_TEMPERATURE?: string;
  readonly VITE_LM_STUDIO_MAX_TOKENS?: string;
  readonly VITE_LM_STUDIO_TIMEOUT?: string;
  readonly VITE_MAX_CONCURRENT_LLM_REQUESTS?: string;
  readonly VITE_LLM_REQUEST_TIMEOUT?: string;
  readonly VITE_ENABLE_LLM_CACHING?: string;
  readonly VITE_LLM_CACHE_DURATION?: string;
  readonly VITE_LLM_DEBUG_LOGGING?: string;
  readonly VITE_MOCK_LLM_RESPONSES?: string;
  readonly VITE_MOCK_RESPONSE_DELAY?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
  readonly hot?: {
    readonly accept: (callback?: () => void) => void;
  };
}
