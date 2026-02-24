/**
 * Service initialization (Desktop: macOS / Windows)
 *
 * Desktop platforms use Firebase JS SDK which initializes lazily in AuthContext.
 */

export async function initializeAllServices(): Promise<null> {
  return null;
}

export function getAnalytics(): null {
  return null;
}
