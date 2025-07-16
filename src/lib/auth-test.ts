/**
 * Authentication Provider Test Helper
 * 
 * This file contains utilities to test and verify authentication providers
 * for the Clerk integration with email-based user association.
 */

import { currentUser } from '@clerk/nextjs/server';

/**
 * Get current user information including email for association
 */
export async function getCurrentUserInfo() {
  try {
    const user = await currentUser();
    
    if (!user) {
      return null;
    }

    const email = user.emailAddresses?.[0]?.emailAddress;
    
    return {
      id: user.id,
      email,
      firstName: user.firstName,
      lastName: user.lastName,
      imageUrl: user.imageUrl,
      createdAt: user.createdAt,
      lastSignInAt: user.lastSignInAt,
      externalAccounts: user.externalAccounts?.map(account => ({
        provider: account.provider,
        emailAddress: account.emailAddress,
      })) || []
    };
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
}

/**
 * Test email consistency across authentication providers
 */
export function testEmailConsistency(userInfo: {
  email?: string;
  externalAccounts?: { emailAddress?: string }[];
} | null) {
  if (!userInfo) return false;
  
  const primaryEmail = userInfo.email;
  if (!primaryEmail) return false;
  
  // Check if external accounts use the same email
  const externalEmails = userInfo.externalAccounts
    ?.map((account) => account.emailAddress)
    .filter((email): email is string => Boolean(email)) || [];
  
  // All emails should match for proper association
  return externalEmails.every((email: string) => email === primaryEmail);
}

/**
 * Available authentication providers for testing
 */
export const SUPPORTED_PROVIDERS = [
  'google',
  'facebook', 
  'microsoft',
  'email_password',
  'email_link'
] as const;

export type SupportedProvider = typeof SUPPORTED_PROVIDERS[number];

/**
 * Test configuration for each provider
 */
export const PROVIDER_CONFIG = {
  google: {
    name: 'Google',
    icon: '🔍',
    emailRequired: true,
    description: 'Sign in with your Google account'
  },
  facebook: {
    name: 'Facebook', 
    icon: '📘',
    emailRequired: true,
    description: 'Sign in with your Facebook account'
  },
  microsoft: {
    name: 'Microsoft',
    icon: '🪟',
    emailRequired: true,
    description: 'Sign in with your Microsoft account'
  },
  email_password: {
    name: 'Email & Password',
    icon: '📧',
    emailRequired: true,
    description: 'Sign in with email and password'
  },
  email_link: {
    name: 'Magic Link',
    icon: '✨',
    emailRequired: true,
    description: 'Sign in with a magic link sent to your email'
  }
} as const;
