import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 container mx-auto px-4 py-8">
        <Outlet />
      </main>
      <footer className="py-6 text-center text-sm text-slate-500 border-t border-slate-200/50">
        <p>💚 数字健康 - 让科技服务于生活，而不是控制生活</p>
      </footer>
    </div>
  );
}
