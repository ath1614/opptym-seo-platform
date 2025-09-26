declare module 'node-fetch' {
  interface RequestInit {
    timeout?: number;
    method?: string;
    headers?: Record<string, string>;
    signal?: AbortSignal;
  }
  
  function fetch(url: string | URL, init?: RequestInit): Promise<Response>;
  export = fetch;
}
