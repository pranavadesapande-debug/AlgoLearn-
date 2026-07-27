import { Outlet, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { base44 } from '@/api/base44Client';
import {
  Home, LayoutDashboard, Upload, MessageSquare, Brain, User, Settings,
  LogOut, Menu, X, GraduationCap, Sparkles
} from 'lucide-react';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/upload', label: 'Upload Notes', icon: Upload },
  { to: '/chat', label: 'AI Chat', icon: MessageSquare },
  { to: '/quiz', label: 'Quiz', icon: Brain },
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function AppLayout() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await base44.auth.logout('/login');
  };

  const SidebarContent = () => (
    <div className="flex h-full flex-col text-white">
      <div className="flex items-center gap-3 px-6 py-7">
        <div className="relative">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <GraduationCap className="w-5 h-5" />
          </div>
          <Sparkles className="w-4 h-4 absolute -top-1 -right-1 text-sky-300" />
        </div>
        <div>
          <h1 className="font-display font-extrabold text-lg leading-none">Algolearn</h1>
          <p className="text-[10px] text-white/50 tracking-widest uppercase mt-0.5">AI Student Assistor</p>
        </div>
      </div>

      <nav className="flex-1 px-3 space-y-1 mt-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMobileOpen(false)}
              className={`relative flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all group ${
                isActive ? 'text-white' : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="nav-active"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 shadow-lg shadow-violet-600/30"
                  transition={{ type: 'spring', stiffness: 400, damping: 35 }}
                />
              )}
              <item.icon className="w-4.5 h-4.5 relative z-10" style={{ width: '1.125rem', height: '1.125rem' }} />
              <span className="relative z-10">{item.label}</span>
            </NavLink>
          );
        })}
      </nav>

      <div className="p-4">
        <div className="rounded-2xl bg-gradient-to-br from-violet-600/20 to-indigo-600/10 border border-white/10 p-4">
          <p className="text-xs text-white/70 leading-relaxed mb-3">
            Upgrade to Pro for unlimited AI generations and unlimited notes.
          </p>
          <button className="w-full text-xs font-semibold bg-white text-violet-700 rounded-lg py-2 hover:bg-white/90 transition">
            Upgrade Now
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full mt-3 flex items-center gap-3 px-4 py-2.5 text-sm text-white/60 hover:text-white hover:bg-white/5 rounded-xl transition"
        >
          <LogOut className="w-4 h-4" /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 fixed inset-y-0 bg-[hsl(var(--sidebar-background))]">
        <SidebarContent />
      </aside>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="lg:hidden fixed inset-0 bg-black/50 z-40"
              onClick={() => setMobileOpen(false)}
            />
            <motion.aside
              initial={{ x: -300 }} animate={{ x: 0 }} exit={{ x: -300 }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="lg:hidden fixed inset-y-0 left-0 w-64 bg-[hsl(var(--sidebar-background))] z-50"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main content */}
      <div className="flex-1 lg:ml-64 min-w-0">
        <header className="lg:hidden sticky top-0 z-30 glass flex items-center justify-between px-4 py-3">
          <button onClick={() => setMobileOpen(true)} className="p-2 -ml-2 rounded-lg hover:bg-black/5">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 flex items-center justify-center shadow-md shadow-violet-500/25">
              <GraduationCap className="w-4 h-4 text-white" />
            </div>
            <span className="font-display font-bold">Algolearn</span>
          </div>
          <button onClick={() => navigate('/profile')} className="p-2 -mr-2 rounded-lg hover:bg-black/5">
            <User className="w-5 h-5" />
          </button>
        </header>
        <main className="min-h-screen">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
