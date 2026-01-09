/**
 * Authenticated User Interface
 * Represents the user extracted from JWT token
 */
export interface AuthenticatedUser {
  id: string;
  email: string;
  role?: string;
  roles?: string[];
  organizationId?: string;
  [key: string]: any; // Allow additional properties from JWT payload
}

