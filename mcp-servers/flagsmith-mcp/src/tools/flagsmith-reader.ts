// mcp-servers/flagsmith-mcp/src/tools/flagsmith-reader.ts
import flagsmith from 'flagsmith/isomorphic';

interface GetFlagParams {
  flagName: string;
}

interface FlagInfo {
  flagName: string;
  isEnabled: boolean;
  value: string | number | boolean | null;
}

export const getFlagTool = {
  name: 'getFlag',
  description: 'Retrieves the status and value of a Flagsmith feature flag.',
  parameters: {
    type: 'object',
    properties: {
      flagName: {
        type: 'string',
        description: 'The name of the feature flag to retrieve.',
      },
    },
    required: ['flagName'],
  },
  async execute(params: GetFlagParams): Promise<FlagInfo | { error: string }> {
    try {
      if (!process.env.FLAGSMITH_ENVIRONMENT_ID) {
        return { error: 'FLAGSMITH_ENVIRONMENT_ID is not set in environment variables.' };
      }

      await flagsmith.init({
        environmentID: process.env.FLAGSMITH_ENVIRONMENT_ID,
        cacheFlags: true, // Cache flags to reduce API calls
        enableAnalytics: false, // Disable analytics for CLI tool
        preventFetch: false, // Ensure flags are fetched
      });

      const isEnabled = flagsmith.hasFeature(params.flagName);
      const value = flagsmith.getValue(params.flagName);

      return {
        flagName: params.flagName,
        isEnabled: isEnabled,
        value: value,
      };
    } catch (error: any) {
      return { error: `Failed to retrieve feature flag: ${error.message}` };
    }
  },
};