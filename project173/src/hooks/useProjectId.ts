import { useMemo } from 'react';
import { useLocation, useParams } from 'react-router-dom';

export function useProjectId(): string | undefined {
  const location = useLocation();
  const params = useParams<{ projectId?: string }>();

  return useMemo(() => {
    if (params.projectId) {
      return params.projectId;
    }
    const match = location.pathname.match(/^\/projects\/([^/]+)/);
    return match ? match[1] : undefined;
  }, [location.pathname, params.projectId]);
}
