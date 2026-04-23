/**
 * WCAG 2.4.1 Bypass Blocks: first focusable control for keyboard / AT users.
 */
export function SkipToMainContent() {
  return (
    <a
      href="#main-content"
      className="skip-to-main"
    >
      Skip to main content
    </a>
  );
}
