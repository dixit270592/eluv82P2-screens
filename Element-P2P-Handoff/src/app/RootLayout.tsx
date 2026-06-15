import { Outlet, useLocation } from 'react-router';
import { isAuthRoute } from './components/auth/auth-routes';
import { PageCommentSystem } from './components/page-comments/PageCommentSystem';

export function RootLayout() {
  const { pathname } = useLocation();
  const showPageComments = !isAuthRoute(pathname);

  return (
    <>
      <Outlet />
      {showPageComments ? <PageCommentSystem /> : null}
    </>
  );
}
