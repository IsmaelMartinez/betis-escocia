// mcp-servers/clerk-mcp/src/tools/clerk-user-reader.ts
import { createClerkClient } from '@clerk/backend';

interface EmailAddress {
  emailAddress: string;
}



interface GetUserParams {
  userId: string;
}

interface UserInfo {
  userId: string;
  emailAddresses: string[];
  firstName: string | null;
  lastName: string | null;
  publicMetadata: Record<string, any>;
}

export const getUserTool = {
  name: 'getUser',
  description: 'Retrieves user information from Clerk by userId.',
  parameters: {
    type: 'object',
    properties: {
      userId: {
        type: 'string',
        description: 'The ID of the user to retrieve.',
      },
    },
    required: ['userId'],
  },
  async execute(params: GetUserParams): Promise<UserInfo | { error: string }> {
    try {
      console.log('Clerk Secret Key (from env): ', process.env.CLERK_SECRET_KEY ? 'Set' : 'Not Set');

      const clerk = createClerkClient({ secretKey: process.env.CLERK_SECRET_KEY });
      const user = await clerk.users.getUser(params.userId);

      if (!user) {
        return { error: `User with ID ${params.userId} not found.` };
      }

      return {
        userId: user.id,
        emailAddresses: user.emailAddresses.map((ea: EmailAddress) => ea.emailAddress),
        firstName: user.firstName,
        lastName: user.lastName,
        publicMetadata: user.publicMetadata,
      };
    } catch (error: any) {
      return { error: `Failed to retrieve user: ${error.message}` };
    }
  },
};
