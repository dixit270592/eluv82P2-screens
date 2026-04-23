import { RouterProvider } from 'react-router';
import { router } from './routes';
import { VersionProvider } from './context/VersionContext';

export default function App() {
  return (
    <VersionProvider>
      <RouterProvider router={router} />
    </VersionProvider>
  );
}
