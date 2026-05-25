import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VersionProvider } from './context/VersionContext';
import { PageCommentsProvider } from './context/PageCommentsContext';

export default function App() {
  return (
    <VersionProvider>
      <PageCommentsProvider>
        <RouterProvider router={router} />
      </PageCommentsProvider>
    </VersionProvider>
  );
}
