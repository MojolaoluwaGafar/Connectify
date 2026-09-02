export interface ApiErrorResponse {
  message?: string;
  error?: string;
  details?: string[];
  [key: string]: unknown;
}

export interface ApiSuccessResponse<T> {
  data: T;
  message?: string;
}
