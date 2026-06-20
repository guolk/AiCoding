import { Bell, Search, Settings, Moon, Sun } from "lucide-react";
import { useTheme } from "@/hooks/useTheme";

interface HeaderProps {
  title: string;
}

export default function Header({ title }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6 sticky top-0 z-20 dark:bg-gray-900 dark:border-gray-800">
      <div className="flex items-center gap-4">
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
          {title}
        </h1>
      </div>

      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="搜索..."
            className="pl-10 pr-4 py-2 w-64 text-sm bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          />
        </div>

        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200"
        >
          {theme === "dark" ? (
            <Sun className="w-5 h-5" />
          ) : (
            <Moon className="w-5 h-5" />
          )}
        </button>

        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors relative dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
        </button>

        <button className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 hover:text-gray-700 transition-colors dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-gray-200">
          <Settings className="w-5 h-5" />
        </button>
      </div>
    </header>
  );
}
