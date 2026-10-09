import { HomePage } from '@bl/pages/home';
import { PrivacyPage } from '@bl/pages/privacy';
import { SamplePassportPage } from '@bl/pages/sample-passport';
import { LoginPage } from '@bl/pages/login';
import { SignupPage } from '@bl/pages/signup';
import { ForgotPasswordPage } from '@bl/pages/forgot-password';

export function LandingRouter() {
  const pathname = window.location.pathname.replace(/\/$/, '') || '/';

  switch (pathname) {
    case '/privacy':
      return <PrivacyPage />;
    case '/sample-passport':
      return <SamplePassportPage />;
    case '/login':
      return <LoginPage />;
    case '/signup':
      return <SignupPage />;
    case '/forgot-password':
      return <ForgotPasswordPage />;
    case '/':
    default:
      return <HomePage />;
  }
}

export default LandingRouter;
