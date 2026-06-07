import { Button, Result } from 'antd';
import { Home } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center min-h-screen">
      <Result
        status="404"
        title="404"
        subTitle="抱歉，您访问的页面不存在。"
        extra={
          <Button type="primary" icon={<Home size={16} />} onClick={() => navigate('/')}>
            返回首页
          </Button>
        }
      />
    </div>
  );
}
