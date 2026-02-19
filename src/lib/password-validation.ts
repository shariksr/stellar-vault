import { z } from 'zod';

export const passwordSchema = z
  .string()
  .min(8, 'Password must be at least 8 characters')
  .regex(/[A-Z]/, 'Must contain an uppercase letter')
  .regex(/[a-z]/, 'Must contain a lowercase letter')
  .regex(/[0-9]/, 'Must contain a number');

/** Validate password string manually (for non-zod forms) */
export const validatePassword = (password: string): string | null => {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Must contain an uppercase letter';
  if (!/[a-z]/.test(password)) return 'Must contain a lowercase letter';
  if (!/[0-9]/.test(password)) return 'Must contain a number';
  return null;
};
