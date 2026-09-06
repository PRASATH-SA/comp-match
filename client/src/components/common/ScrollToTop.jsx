import { useEffect } from 'react';
import { useLocation } from 'react-router';

/**
 * ScrollToTop component
 * Automatically scrolls window to top whenever the route pathname or query parameters change
 */
export default function ScrollToTop() {
  const { pathname, search } = useLocation();

  useEffect(() => {
    // Scroll instantly to the top of the page on route change
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant',
    });
  }, [pathname, search]);

  return null;
}
