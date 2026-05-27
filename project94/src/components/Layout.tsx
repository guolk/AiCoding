import { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import {
  LayoutDashboard,
  Palette,
  Boxes,
  FileText,
  Users,
  Image,
  PenTool,
  Menu,
  X,
  ChevronDown,
} from 'lucide-react'
import { cn } from '../utils/cn'

interface MenuItem {
  label: string
  icon: React.ElementType
  children?: SubMenuItem[]
}

interface SubMenuItem {
  label: string
  path: string
}

const menuConfig: MenuItem[] = [
  {
    label: '仪表盘',
    icon: LayoutDashboard,
    children: [{ label: '概览', path: '/' }],
  },
  {
    label: '设计规范管理',
    icon: Palette,
    children: [
      { label: '设计Token', path: '/design-system/tokens' },
      { label: '命名规范', path: '/design-system/naming' },
      { label: '版本历史', path: '/design-system/versions' },
    ],
  },
  {
    label: '组件文档',
    icon: Boxes,
    children: [
      { label: '组件列表', path: '/components' },
    ],
  },
  {
    label: '设计决策记录',
    icon: FileText,
    children: [
      { label: '决策记录', path: '/decisions/records' },
      { label: '评审记录', path: '/decisions/reviews' },
      { label: '设计原则', path: '/decisions/principles' },
    ],
  },
  {
    label: '资产管理',
    icon: Image,
    children: [
      { label: '图标库', path: '/assets/icons' },
      { label: '插画资源', path: '/assets/illustrations' },
      { label: '字体管理', path: '/assets/fonts' },
    ],
  },
  {
    label: '协作工作流',
    icon: Users,
    children: [
      { label: '交付清单', path: '/workflow/checklist' },
      { label: '设计走查', path: '/workflow/review' },
    ],
  },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const [expandedMenus, setExpandedMenus] = useState<string[]>(['设计规范管理', '组件文档', '设计决策记录', '资产管理', '协作工作流'])
  const location = useLocation()

  const toggleMenu = (label: string) => {
    setExpandedMenus(prev =>
      prev.includes(label) ? prev.filter(m => m !== label) : [...prev, label]
    )
  }

  const isActive = (path: string) => location.pathname === path

  const isParentActive = (children?: SubMenuItem[]) => {
    return children?.some(child => isActive(child.path))
  }

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <aside
        className={cn(
          'fixed lg:relative inset-y-0 left-0 z-30 bg-white border-r border-gray-200 transition-all duration-300',
          sidebarOpen ? 'w-64' : 'w-0 lg:w-16'
        )}
      >
        <div className="h-full flex flex-col overflow-hidden">
          <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
            {sidebarOpen && (
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center">
                  <PenTool className="w-5 h-5 text-white" />
                </div>
                <span className="font-semibold text-gray-800">Design System</span>
              </div>
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-1.5 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            {menuConfig.map((menu) => (
              <div key={menu.label} className="mb-1">
                <button
                  onClick={() => toggleMenu(menu.label)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium transition-colors',
                    isParentActive(menu.children)
                      ? 'text-blue-600 bg-blue-50'
                      : 'text-gray-700 hover:bg-gray-100'
                  )}
                >
                  <menu.icon className="w-5 h-5 flex-shrink-0" />
                  {sidebarOpen && (
                    <>
                      <span className="flex-1 text-left">{menu.label}</span>
                      <ChevronDown
                        className={cn(
                          'w-4 h-4 transition-transform',
                          expandedMenus.includes(menu.label) && 'rotate-180'
                        )}
                      />
                    </>
                  )}
                </button>
                {sidebarOpen && expandedMenus.includes(menu.label) && menu.children && (
                  <div className="mt-1 ml-4 border-l border-gray-200">
                    {menu.children.map((child) => (
                      <NavLink
                        key={child.path}
                        to={child.path}
                        className={({ isActive }) =>
                          cn(
                            'block px-4 py-2 text-sm transition-colors',
                            isActive
                              ? 'text-blue-600 font-medium bg-blue-50/50 border-l-2 border-blue-600 -ml-px'
                              : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                          )
                        }
                      >
                        {child.label}
                      </NavLink>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>
        </div>
      </aside>

      {!sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 lg:px-6">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 hover:bg-gray-100 rounded-lg lg:hidden"
          >
            <Menu className="w-5 h-5" />
          </button>

          <div className="flex-1" />

          <div className="flex items-center gap-4">
            <div className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-gray-600">U</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}