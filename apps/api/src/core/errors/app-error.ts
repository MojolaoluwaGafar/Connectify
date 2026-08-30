export type ApiError = Error & {
  statusCode: number;
  code: string;
  details?: unknown;
};

export function AppError(
  statusCode: number,
  code: string,
  message: string,
  details?: unknown
): ApiError {
  return Object.assign(new Error(message), {
    name: "ApiError",
    statusCode,
    code,
    details,
  });
}
