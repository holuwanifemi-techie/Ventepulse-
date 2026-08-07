/**
 * Translates raw Supabase and fetch error objects into friendly, actionable user messages.
 */
export function formatAuthError(error: any): string {
  if (!error) return 'An unexpected error occurred. Please try again.';

  const message = (error.message || String(error)).toLowerCase();

  // Network / Fetch Failures
  if (
    message.includes('failed to fetch') ||
    message.includes('fetch error') ||
    message.includes('network error') ||
    message.includes('networkerror') ||
    message.includes('failed to send request') ||
    message.includes('typeerror')
  ) {
    return 'Unable to connect to the authentication server. Please check your internet connection and try again.';
  }

  // Duplicate Account
  if (
    message.includes('already registered') ||
    message.includes('email_already_exists') ||
    message.includes('user already exists') ||
    message.includes('already taken')
  ) {
    return 'This email address is already registered. Please sign in instead.';
  }

  // Email Validation
  if (
    message.includes('invalid email') ||
    message.includes('unable to validate email') ||
    message.includes('format is invalid')
  ) {
    return 'Please enter a valid email address.';
  }

  // Password Strength
  if (
    message.includes('password should be at least') ||
    message.includes('weak_password') ||
    message.includes('password is too short')
  ) {
    return 'Password is too weak. Please use at least 6 characters.';
  }

  // Invalid Credentials
  if (
    message.includes('invalid login credentials') ||
    message.includes('invalid credentials') ||
    message.includes('wrong password')
  ) {
    return 'Invalid email or password. Please verify your credentials and try again.';
  }

  // Email Rate Exceeded / Throttled
  if (message.includes('rate limit') || message.includes('rate limit exceeded')) {
    return 'Security rate limit reached. Please wait a moment before trying again.';
  }

  return error.message || 'An error occurred during authentication. Please try again.';
}

/**
 * Basic email format validator.
 */
export function isValidEmail(email: string): boolean {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email.trim());
}
