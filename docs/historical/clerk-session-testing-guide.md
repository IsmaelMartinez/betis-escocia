# Clerk Session Testing Guide

## Overview
Guide for testing session handling and timeout behavior in the Clerk-integrated admin panel.

## Session Management Features to Test

### 1. Session Creation and Validation

#### Test Session Creation
- [ ] **Login Process**: Verify session is created on successful login
- [ ] **Session Token**: Check that session token is properly stored
- [ ] **User State**: Verify user state is maintained across page reloads
- [ ] **Multiple Devices**: Test sessions across different devices/browsers

#### Test Session Validation
- [ ] **Page Access**: Verify authenticated pages are accessible
- [ ] **API Calls**: Test that API calls include proper authentication
- [ ] **Route Protection**: Ensure protected routes redirect unauthenticated users
- [ ] **Session Refresh**: Test automatic session token refresh

### 2. Session Timeout Configuration

#### Current Default Settings
Clerk default session timeout settings:
- **Session Token Lifetime**: 1 hour (3600 seconds)
- **Refresh Token Lifetime**: 30 days
- **Inactivity Timeout**: Configurable (need to check dashboard)

#### Test Timeout Behavior
- [ ] **Session Expiry**: Test what happens when session expires
- [ ] **Automatic Refresh**: Verify tokens are refreshed before expiry
- [ ] **Inactivity Detection**: Test session handling during inactivity
- [ ] **Expired Session Handling**: Test user experience with expired sessions

### 3. Session Security Features

#### Security Tests
- [ ] **Session Hijacking Prevention**: Test session token security
- [ ] **Cross-Site Request Forgery (CSRF)**: Verify CSRF protection
- [ ] **Secure Cookie Settings**: Check cookie security attributes
- [ ] **Session Invalidation**: Test proper session cleanup on logout

#### Multi-Device Management
- [ ] **Concurrent Sessions**: Test multiple active sessions
- [ ] **Device Tracking**: Verify active device monitoring
- [ ] **Session Revocation**: Test remote session termination
- [ ] **Suspicious Activity**: Test handling of suspicious login attempts

## Test Scenarios

### Scenario 1: Normal Session Lifecycle
```javascript
// Test Steps:
1. User logs in successfully
2. Navigate through admin panel
3. Verify session persists across page refreshes
4. Test automatic token refresh
5. User logs out
6. Verify session is properly terminated
```

### Scenario 2: Session Expiry During Activity
```javascript
// Test Steps:
1. User logs in
2. Wait for session to approach expiry
3. Perform admin action (e.g., refresh data)
4. Verify session is automatically refreshed
5. Continue using admin panel
6. Verify no interruption to user experience
```

### Scenario 3: Inactivity Timeout
```javascript
// Test Steps:
1. User logs in
2. Leave browser idle for extended period
3. Attempt to perform admin action
4. Verify appropriate timeout handling
5. Test re-authentication flow
6. Verify user returns to intended page
```

### Scenario 4: Multi-Device Session Management
```javascript
// Test Steps:
1. Log in on Device A
2. Log in on Device B with same account
3. Verify both sessions are active
4. Log out from Device A
5. Verify Device B session remains active
6. Test concurrent actions from both devices
```

## Session Configuration Testing

### 1. Custom Session Settings
Test if we can configure custom session settings:

```javascript
// In ClerkProvider configuration
const clerkConfig = {
  sessionTokenLifetime: 3600, // 1 hour
  refreshTokenLifetime: 86400, // 24 hours
  inactivityTimeout: 1800, // 30 minutes
};
```

### 2. Session Persistence Testing
- [ ] **Browser Refresh**: Session persists across page refreshes
- [ ] **Browser Close/Reopen**: Session behavior with browser restart
- [ ] **Tab Management**: Session sharing across browser tabs
- [ ] **Incognito Mode**: Session isolation in private browsing

### 3. Session Events Testing
Test session-related events:

```javascript
// Example session event handlers
clerk.addListener('session:created', (session) => {
  console.log('Session created:', session);
});

clerk.addListener('session:ended', (session) => {
  console.log('Session ended:', session);
});

clerk.addListener('session:token-updated', (session) => {
  console.log('Session token updated:', session);
});
```

## Implementation Testing

### 1. Current Implementation Review
Check our current implementation for session handling:

```javascript
// In admin page component
const { isLoaded, isSignedIn, signOut } = useAuth();
const { user } = useUser();

// Test these hooks work correctly
- isLoaded: Loading state management
- isSignedIn: Authentication state
- signOut: Logout functionality
- user: User information access
```

### 2. Route Protection Testing
Test our route protection implementation:

```javascript
// Verify this logic works correctly
useEffect(() => {
  if (isLoaded && !isSignedIn) {
    router.push('/sign-in');
  }
}, [isLoaded, isSignedIn, router]);
```

### 3. Error Handling Testing
Test session error scenarios:
- [ ] **Network Errors**: Test session refresh during network issues
- [ ] **Server Errors**: Test handling of authentication server errors
- [ ] **Invalid Tokens**: Test behavior with corrupted session tokens
- [ ] **Expired Tokens**: Test graceful handling of expired tokens

## Monitoring and Debugging

### 1. Session Debugging Tools
- [ ] **Browser DevTools**: Check session storage and cookies
- [ ] **Network Tab**: Monitor authentication API calls
- [ ] **Console Logs**: Check for session-related errors
- [ ] **Clerk Dashboard**: Monitor session activity

### 2. Session Metrics to Track
- [ ] **Session Duration**: Average session length
- [ ] **Session Refresh Rate**: How often tokens are refreshed
- [ ] **Failed Authentications**: Number of failed login attempts
- [ ] **Session Timeouts**: Frequency of session timeouts

## Expected Results

### Session Creation Success Criteria
- ✅ Session is created immediately upon successful login
- ✅ Session token is securely stored and transmitted
- ✅ User state is maintained across page navigation
- ✅ Session persists across browser refreshes

### Session Timeout Success Criteria
- ✅ Sessions timeout according to configured settings
- ✅ Users are notified before session expiry
- ✅ Automatic token refresh works seamlessly
- ✅ Expired sessions redirect to sign-in page

### Session Security Success Criteria
- ✅ Session tokens are properly secured
- ✅ CSRF protection is active
- ✅ Sessions are properly invalidated on logout
- ✅ Suspicious activity is detected and handled

## Configuration Recommendations

### Recommended Session Settings for Admin Panel
```javascript
// Suggested configuration for admin panel
const adminSessionConfig = {
  sessionTokenLifetime: 3600, // 1 hour
  refreshTokenLifetime: 86400, // 24 hours (1 day)
  inactivityTimeout: 1800, // 30 minutes
  maxConcurrentSessions: 2, // Limit concurrent sessions
  rememberMe: false, // Don't remember sessions
  secureTransport: true, // Force HTTPS
};
```

### Security Best Practices
1. **Short Session Lifetimes**: Minimize exposure window
2. **Automatic Refresh**: Seamless user experience
3. **Inactivity Timeout**: Protect against unattended access
4. **Session Monitoring**: Track active sessions
5. **Secure Storage**: Protect session tokens

## Troubleshooting Guide

### Common Session Issues
1. **Session Not Created**: Check login implementation
2. **Session Expires Too Quickly**: Review timeout settings
3. **Session Not Refreshing**: Check refresh token implementation
4. **Multiple Login Prompts**: Verify session persistence
5. **Logout Issues**: Check session cleanup process

### Debugging Steps
1. Check browser console for errors
2. Review network tab for failed requests
3. Verify Clerk dashboard configuration
4. Test in incognito mode
5. Check session storage in DevTools
