import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/auth/ProtectedRoute';
import { OnboardingGuard } from './components/onboarding/OnboardingGuard';

export default function App() {
  return (
    <AuthProvider>
      <ProtectedRoute>
        <OnboardingGuard />
      </ProtectedRoute>
    </AuthProvider>
  );
}
