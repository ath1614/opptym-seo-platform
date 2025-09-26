declare module 'node-fetch' {
  interface RequestInit {
    timeout?: number;
  }
  
  function fetch(url: string | URL, init?: RequestInit): Promise<Response>;
  export = fetch;
}
