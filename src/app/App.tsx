import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VersionProvider } from './context/VersionContext';
import { PageCommentsProvider } from './context/PageCommentsContext';
import { AuthProvider } from './context/AuthContext';

export default function App() {
  return (
    <AuthProvider>
      <VersionProvider>
        <PageCommentsProvider>
          <RouterProvider router={router} />
        </PageCommentsProvider>
      </VersionProvider>
    </AuthProvider>
  );
}
