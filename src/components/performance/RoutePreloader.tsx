import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

interface RoutePreloaderProps {
  children?: React.ReactNode;
}

export const RoutePreloader: React.FC<RoutePreloaderProps> = ({ children }) => {
  const location = useLocation();
  const preloadedRoutes = useRef(new Set<string>());
  const observerRef = useRef<IntersectionObserver | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Preload commonly accessed routes
    const commonRoutes = ['/incidents', '/alerts', '/ml-analysis', '/documentation', '/team', '/settings'];
    const currentPath = location.pathname;

    commonRoutes.forEach(route => {
      if (!preloadedRoutes.current.has(route) && route !== currentPath) {
        // Create prefetch link
        const link = document.createElement('link');
        link.rel = 'prefetch';
        link.href = route;
        document.head.appendChild(link);
        preloadedRoutes.current.add(route);
        
        // Clean up after 30 seconds
        setTimeout(() => {
          if (document.head.contains(link)) {
            document.head.removeChild(link);
          }
          preloadedRoutes.current.delete(route);
        }, 30000);
      }
    });
  }, [location.pathname]);

  // Intersection Observer for lazy loading of components
  useEffect(() => {
    if (!containerRef.current) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            // Component is visible, could trigger any lazy loading logic here
            const element = entry.target as HTMLElement;
            element.classList.add('visible');
          }
        });
      },
      {
        root: null,
        rootMargin: '50px',
        threshold: 0.1
      }
    );

    // Observe all child elements with data-lazy attribute
    const lazyElements = containerRef.current.querySelectorAll('[data-lazy]');
    lazyElements.forEach(element => {
      observerRef.current?.observe(element);
    });

    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return (
    <div ref={containerRef} className="route-preloader">
      {children}
    </div>
  );
};
