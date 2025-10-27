export interface ApiErrorBody {
  message?: string;
  fieldErrors?: Record<string, string>;
}

export class ApiError extends Error {
  status: number;
  fieldErrors?: Record<string, string>;

  constructor(status: number, body: ApiErrorBody) {
    super(body.message || 'Unexpected error');
    this.name = 'ApiError';
    this.status = status;
    this.fieldErrors = body.fieldErrors;
  }
}

interface FetchOptions<TBody> extends Omit<RequestInit, 'body'> {
  body?: TBody;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? '';

export async function apiFetch<TResponse, TBody = unknown>(
  path: string,
  { body, headers, ...init }: FetchOptions<TBody> = {},
): Promise<TResponse> {
  const requestHeaders: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(headers as Record<string, string>),
  };

  // Get access token from localStorage or cookies
  let accessToken: string | null = null;
  if (typeof window !== 'undefined') {
    accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      // Fallback to cookies if localStorage is empty
      accessToken = document.cookie
        .split('; ')
        .find(row => row.startsWith('accessToken='))
        ?.split('=')[1] || null;
    }
  }

  if (accessToken) {
    requestHeaders['Authorization'] = `Bearer ${accessToken}`;
  }

  try {
    const response = await fetch(`${API_BASE}${path}`, {
      ...init,
      headers: requestHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });

    const contentType = response.headers.get('content-type') ?? '';
    const isJson = contentType.includes('application/json');
    const data = isJson ? await response.json() : undefined;

    if (!response.ok) {
      throw new ApiError(response.status, (data as ApiErrorBody) ?? { message: response.statusText });
    }

    return data as TResponse;
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }
    throw new ApiError(500, { message: 'Network error' });
  }
}
