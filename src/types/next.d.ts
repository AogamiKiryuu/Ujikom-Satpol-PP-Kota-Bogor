// Type overrides for Next.js 15 compatibility
declare module 'next/server' {
  export interface NextRequest extends Request {
    nextUrl: {
      pathname: string;
      search: string;
      searchParams: URLSearchParams;
    };
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string, options?: Record<string, unknown>): void;
    };
  }

  export interface RouteHandlerContext {
    params: { [key: string]: string };
  }
}

// Global route handler types
declare global {
  namespace NextJS {
    interface RouteHandlerContext {
      params: { [key: string]: string };
    }
  }
}

export {};
