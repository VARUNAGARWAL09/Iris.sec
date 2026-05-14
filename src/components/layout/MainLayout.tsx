import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileNav } from './MobileNav';
import { AssistantChatbot } from './AssistantChatbot';
import { RoutePreloader } from '../performance/RoutePreloader';

interface MainLayoutProps {
  children: ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-background relative">
      {/* Global cyber-grid texture layer */}
      <div
        className="fixed inset-0 pointer-events-none z-0"
        style={{
          backgroundImage:
            'linear-gradient(hsl(220 25% 14% / 0.12) 1px, transparent 1px), linear-gradient(90deg, hsl(220 25% 14% / 0.12) 1px, transparent 1px)',
          backgroundSize: '40px 40px',
        }}
      />

      {/* Subtle radial ambient glow at top-center */}
      <div
        className="fixed top-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] pointer-events-none z-0"
        style={{
          background: 'radial-gradient(ellipse at top, hsl(152 100% 48% / 0.04) 0%, transparent 70%)',
        }}
      />

      {/* Desktop Sidebar - hidden on mobile */}
      <div className="hidden md:block">
        <Sidebar />
      </div>

      {/* Mobile Navigation */}
      <MobileNav />

      {/* Main Content Area */}
      <div className="md:pl-[240px] transition-all duration-200 relative z-10">
        <Header />
        <main className="min-h-[calc(100vh-64px)] p-4 md:p-6 pb-20 md:pb-6">
          <RoutePreloader>
            <motion.div
              key={location.pathname}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {children}
            </motion.div>
          </RoutePreloader>
        </main>
      </div>

      {/* Global Chatbot */}
      <AssistantChatbot />
    </div>
  );
}
