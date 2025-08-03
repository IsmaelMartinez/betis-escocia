export const useAuth = () => ({
  getToken: async () => "mock-token",
  userId: "mock-user-id",
  sessionId: "mock-session-id",
  orgId: "mock-org-id",
  isLoaded: true,
  isSignedIn: true,
});

export const useUser = () => ({
  user: {
    id: "mock-user-id",
    fullName: "Mock User",
    emailAddresses: [{ emailAddress: "mock@example.com" }],
    imageUrl: "https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&s=200",
  },
  isLoaded: true,
  isSignedIn: true,
});

export const ClerkProvider = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const SignedIn = ({ children }: { children: React.ReactNode }) => {
  return children;
};

export const SignedOut = () => {
  return null;
};

export const SignInButton = () => {
  return null;
};

export const UserButton = () => {
  return null;
};

export const useClerk = () => ({
  session: { publicMemberships: [] },
  user: { publicMetadata: {} },
});
