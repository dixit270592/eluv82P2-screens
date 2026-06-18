import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VersionProvider } from './context/VersionContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <VersionProvider>
        <RouterProvider router={router} />
      </VersionProvider>
    </AuthProvider>
  );
}
