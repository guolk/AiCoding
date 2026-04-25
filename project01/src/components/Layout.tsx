import { useState, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';

interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();

  const navItems = [
    { id: 'home', name: '首页', path: '/', icon: '🏠' },
    { id: 'math', name: '数学公式', path: '/math', icon: '📐' },
    { id: 'physics', name: '物理公式', path: '/physics', icon: '⚛️' }
  ];

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <div style={styles.appContainer}>
      <header style={styles.header}>
        <div style={styles.headerLeft}>
          <button 
            style={styles.menuButton}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            ☰
          </button>
          <h1 style={styles.title}>科学公式动态演示系统</h1>
        </div>
        <div style={styles.headerRight}>
          <span style={styles.subtitle}>帮助学生直观理解数学与物理公式</span>
        </div>
      </header>

      <div style={styles.mainContainer}>
        <aside style={{ ...styles.sidebar, ...(sidebarOpen ? {} : styles.sidebarClosed) }}>
          <nav style={styles.nav}>
            <div style={styles.navSection}>
              <h3 style={styles.navSectionTitle}>导航</h3>
              {navItems.map((item) => (
                <Link
                  key={item.id}
                  to={item.path}
                  style={{
                    ...styles.navItem,
                    ...(isActive(item.path) ? styles.navItemActive : {})
                  }}
                >
                  <span style={styles.navItemIcon}>{item.icon}</span>
                  <span>{item.name}</span>
                </Link>
              ))}
            </div>

            <div style={styles.navSection}>
              <h3 style={styles.navSectionTitle}>使用说明</h3>
              <div style={styles.helpText}>
                <p>🎯 选择公式类别</p>
                <p>🎚️ 调整参数滑块</p>
                <p>📊 观察图表变化</p>
                <p>▶️ 播放动画演示</p>
              </div>
            </div>
          </nav>
        </aside>

        <main style={styles.mainContent}>
          {children}
        </main>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  appContainer: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#f5f7fa'
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px 24px',
    backgroundColor: '#1890ff',
    color: 'white',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
    zIndex: 100
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px'
  },
  menuButton: {
    background: 'none',
    border: 'none',
    color: 'white',
    fontSize: '24px',
    cursor: 'pointer',
    padding: '8px',
    borderRadius: '4px',
    transition: 'background-color 0.3s'
  },
  title: {
    fontSize: '24px',
    fontWeight: 600,
    margin: 0
  },
  headerRight: {
    display: 'flex',
    alignItems: 'center'
  },
  subtitle: {
    fontSize: '14px',
    opacity: 0.9
  },
  mainContainer: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden'
  },
  sidebar: {
    width: '250px',
    backgroundColor: 'white',
    borderRight: '1px solid #e0e0e0',
    overflowY: 'auto',
    transition: 'width 0.3s ease',
    flexShrink: 0
  },
  sidebarClosed: {
    width: '0',
    overflow: 'hidden',
    borderRight: 'none'
  },
  nav: {
    padding: '20px'
  },
  navSection: {
    marginBottom: '24px'
  },
  navSectionTitle: {
    fontSize: '14px',
    fontWeight: 600,
    color: '#666',
    marginBottom: '12px',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  navItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 16px',
    borderRadius: '8px',
    textDecoration: 'none',
    color: '#333',
    marginBottom: '4px',
    transition: 'all 0.3s ease',
    cursor: 'pointer'
  },
  navItemActive: {
    backgroundColor: '#e6f7ff',
    color: '#1890ff',
    fontWeight: 500
  },
  navItemIcon: {
    fontSize: '20px'
  },
  helpText: {
    fontSize: '13px',
    color: '#666',
    lineHeight: 2
  },
  mainContent: {
    flex: 1,
    overflowY: 'auto',
    padding: '24px'
  }
};

export default Layout;
