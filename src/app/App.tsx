import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VersionProvider } from './context/VersionContext';
import { AuthProvider } from './context/AuthContext';
import { AppToaster } from './components/ui/sonner';

export default function App() {
  return (
    <AuthProvider>
      <VersionProvider>
        <RouterProvider router={router} />
        <AppToaster />
      </VersionProvider>
    </AuthProvider>
  );
}
