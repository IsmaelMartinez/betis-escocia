export interface DebugInfo {
  features: Record<string, boolean>;
  environment: string | undefined;
  enabledFeatures: string[];
  disabledFeatures: string[];
}

interface DebugInfoPanelProps {
  readonly debugInfo: DebugInfo | null;
}

export default function DebugInfoPanel({ debugInfo }: DebugInfoPanelProps) {
  if (!debugInfo) return null;

  return (
    <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-xs z-50 shadow-lg">
      <div className="font-bold text-betis-oro mb-1">Feature Flags</div>
      <div className="text-gray-300">Env: {debugInfo.environment}</div>
      <div className="text-betis-oro">
        On: {debugInfo.enabledFeatures.join(", ")}
      </div>
      {debugInfo.disabledFeatures.length > 0 && (
        <div className="text-red-400">
          Off: {debugInfo.disabledFeatures.join(", ")}
        </div>
      )}
    </div>
  );
}
