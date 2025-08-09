/* eslint-disable @typescript-eslint/no-explicit-any */
// Next.js 15 Route Handler Type Fixes
// This file works around strict type checking issues in Next.js 15.4.5

declare module 'next/server' {
  export interface NextRequest extends Request {
    cookies: {
      get(name: string): { value: string } | undefined;
      set(name: string, value: string, options?: any): void;
    };
  }
}

// Override route handler parameter types to work with both sync and async params
declare global {
  namespace Next {
    export interface RouteHandlerParams {
      params: any;
    }
  }
  
  // Global augmentation for route handlers
  interface RouteHandlerContext {
    params: Promise<any> | any;
  }
}

export {};
