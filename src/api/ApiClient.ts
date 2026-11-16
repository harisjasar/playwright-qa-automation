import type { APIRequestContext, APIResponse } from '@playwright/test';
import type { z } from 'zod';

/**
 * A response whose status and raw body are always available, so tests can assert on
 * error responses too. `data()` validates the body against the endpoint's schema and
 * returns it typed; call it only when a successful response is expected.
 */
export class ApiResult<T> {
  constructor(
    readonly status: number,
    readonly body: unknown,
    private readonly schema: z.ZodType<T>,
  ) {}

  data(): T {
    return this.schema.parse(this.body);
  }
}

/** Base for resource clients. The base URL comes from the request context, never from tests. */
export abstract class ApiClient {
  constructor(protected readonly request: APIRequestContext) {}

  protected async get<T>(path: string, schema: z.ZodType<T>): Promise<ApiResult<T>> {
    return this.toResult(await this.request.get(path), schema);
  }

  protected async post<T>(path: string, data: unknown, schema: z.ZodType<T>): Promise<ApiResult<T>> {
    return this.toResult(await this.request.post(path, { data }), schema);
  }

  private async toResult<T>(response: APIResponse, schema: z.ZodType<T>): Promise<ApiResult<T>> {
    const text = await response.text();
    let body: unknown = text;
    try {
      body = text ? JSON.parse(text) : undefined;
    } catch {
      // Not JSON: keep the raw text so the failure message shows what came back.
    }
    return new ApiResult(response.status(), body, schema);
  }
}
