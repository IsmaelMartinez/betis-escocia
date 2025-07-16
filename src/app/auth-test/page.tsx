import { getCurrentUserInfo, testEmailConsistency, PROVIDER_CONFIG } from '@/lib/auth-test';
import { currentUser } from '@clerk/nextjs/server';

export default async function AuthTestPage() {
  const user = await currentUser();
  const userInfo = await getCurrentUserInfo();
  
  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4">
        <div className="max-w-2xl w-full bg-white rounded-lg shadow-md p-8">
          <h1 className="text-2xl font-bold text-betis-black mb-4">Authentication Test</h1>
          <p className="text-gray-600 mb-6">Please sign in to test email consistency across providers.</p>
          <a 
            href="/sign-in"
            className="bg-betis-green text-white px-6 py-3 rounded-lg hover:bg-betis-green/90 transition-colors"
          >
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const emailConsistent = testEmailConsistency(userInfo);
  
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-md p-8">
          <h1 className="text-3xl font-bold text-betis-black mb-8">Authentication Test Results</h1>
          
          {/* User Info Section */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-betis-black mb-4">User Information</h2>
            <div className="bg-gray-50 rounded-lg p-4">
              <p><strong>User ID:</strong> {userInfo?.id}</p>
              <p><strong>Email:</strong> {userInfo?.email}</p>
              <p><strong>Name:</strong> {userInfo?.firstName} {userInfo?.lastName}</p>
              <p><strong>Created:</strong> {userInfo?.createdAt ? new Date(userInfo.createdAt).toLocaleDateString() : 'N/A'}</p>
              <p><strong>Last Sign In:</strong> {userInfo?.lastSignInAt ? new Date(userInfo.lastSignInAt).toLocaleDateString() : 'N/A'}</p>
            </div>
          </div>

          {/* Email Consistency Test */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-betis-black mb-4">Email Consistency Test</h2>
            <div className={`rounded-lg p-4 ${emailConsistent ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
              <p className={`font-semibold ${emailConsistent ? 'text-green-800' : 'text-red-800'}`}>
                {emailConsistent ? '✅ PASSED' : '❌ FAILED'}
              </p>
              <p className={`text-sm ${emailConsistent ? 'text-green-700' : 'text-red-700'}`}>
                {emailConsistent 
                  ? 'All authentication providers use the same email address for proper user association.'
                  : 'Email addresses are inconsistent across providers. This may cause issues with data association.'
                }
              </p>
            </div>
          </div>

          {/* External Accounts */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-betis-black mb-4">External Accounts</h2>
            {userInfo?.externalAccounts && userInfo.externalAccounts.length > 0 ? (
              <div className="space-y-3">
                {userInfo.externalAccounts.map((account, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4">
                    <p><strong>Provider:</strong> {account.provider}</p>
                    <p><strong>Email:</strong> {account.emailAddress || 'N/A'}</p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-600">No external accounts connected.</p>
            )}
          </div>

          {/* Supported Providers */}
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-betis-black mb-4">Supported Authentication Providers</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(PROVIDER_CONFIG).map(([key, config]) => (
                <div key={key} className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center mb-2">
                    <span className="text-2xl mr-3">{config.icon}</span>
                    <h3 className="font-semibold text-betis-black">{config.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                  <p className="text-xs text-gray-500 mt-2">
                    Email Required: {config.emailRequired ? 'Yes' : 'No'}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-4">
            <a 
              href="/dashboard"
              className="bg-betis-green text-white px-6 py-3 rounded-lg hover:bg-betis-green/90 transition-colors"
            >
              Go to Dashboard
            </a>
            <a 
              href="/sign-out"
              className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
            >
              Sign Out
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
