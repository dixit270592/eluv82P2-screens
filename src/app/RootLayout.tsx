import { Outlet } from 'react-router';
import { PageCommentSystem } from './components/page-comments/PageCommentSystem';

export function RootLayout() {
  return (
    <>
      <Outlet />
      <PageCommentSystem />
    </>
  );
}
