import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sidebar } from './Sidebar';
import { TabNav } from './TabNav';
import { useSimulation } from '@/hooks/useSimulation';
import { useMonteCarlo } from '@/hooks/useMonteCarlo';
import { Menu, X } from 'lucide-react';

export function AppShell() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Initialize simulation hooks at the app level
  useSimulation();
  useMonteCarlo();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#0a0f1e]">
      {/* Desktop sidebar */}
      <div className="hidden w-[320px] flex-shrink-0 border-r border-white/[0.06] lg:block">
        <div className="h-full overflow-y-auto">
          <Sidebar />
        </div>
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 z-40 bg-black/60 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="fixed inset-y-0 left-0 z-50 w-[320px] lg:hidden"
            >
              <div className="relative h-full overflow-y-auto border-r border-white/[0.06]">
                <button
                  onClick={() => setSidebarOpen(false)}
                  className="absolute right-3 top-3 z-10 rounded-md p-1.5 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
                >
                  <X className="h-4 w-4" />
                </button>
                <Sidebar />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <div className="flex items-center border-b border-white/[0.06] px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="mr-3 rounded-md p-1.5 text-gray-400 hover:bg-white/[0.06] hover:text-gray-200"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1
            className="text-lg font-semibold text-gray-100"
            style={{ fontFamily: "'Fraunces', serif" }}
          >
            Rent vs. Buy
          </h1>
        </div>

        {/* Tab area */}
        <div className="flex-1 overflow-y-auto px-4 pt-4 lg:px-6 lg:pt-6">
          <TabNav />
        </div>
      </div>
    </div>
  );
}
