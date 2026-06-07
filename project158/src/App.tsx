import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { ConfigProvider, App as AntApp, theme } from 'antd';
import zhCN from 'antd/locale/zh_CN';
import router from '@/router';
import { initMockData } from '@/services/mock';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/hooks/useTheme';

export default function App() {
  const { isDark } = useTheme();
  const fetchCurrentUser = useUserStore(state => state.fetchCurrentUser);

  useEffect(() => {
    initMockData();
    fetchCurrentUser();
  }, [fetchCurrentUser]);

  const antdTheme = {
    algorithm: isDark ? theme.darkAlgorithm : theme.defaultAlgorithm,
    token: {
      colorPrimary: '#1890ff',
      borderRadius: 8,
      fontFamily: '"Noto Serif SC", "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    },
    components: {
      Layout: {
        headerBg: isDark ? '#1f1f1f' : '#ffffff',
        siderBg: isDark ? '#141414' : '#ffffff',
      },
      Menu: {
        darkItemBg: '#141414',
        darkSubMenuItemBg: '#1f1f1f',
      },
    },
  };

  return (
    <ConfigProvider locale={zhCN} theme={antdTheme}>
      <AntApp>
        <RouterProvider router={router} />
      </AntApp>
    </ConfigProvider>
  );
}
