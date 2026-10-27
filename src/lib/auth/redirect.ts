const DEFAULT_REDIRECT = "/dashboard";

// Solo se aceptan rutas internas, para evitar open redirects.
export function sanitizeNextPath(value: string | null): string {
  if (value && value.startsWith("/") && !value.startsWith("//") && !value.startsWith("/\\")) {
    return value;
  }
  return DEFAULT_REDIRECT;
}