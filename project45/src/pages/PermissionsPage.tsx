import { useQuery } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { Permission } from '@/types';

export function PermissionsPage() {
  const { data: permissions, isLoading } = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: api.getPermissions,
  });

  const getParentName = (parentId: number | null, allPermissions: Permission[]): string => {
    if (!parentId) return '-';
    const parent = allPermissions.find((p) => p.id === parentId);
    return parent?.name || '-';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">权限管理</h1>
          <p className="text-gray-500 mt-1">查看系统中的所有权限配置</p>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <Loading text="加载中..." />
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>权限名称</TableHeaderCell>
                <TableHeaderCell>权限代码</TableHeaderCell>
                <TableHeaderCell>资源类型</TableHeaderCell>
                <TableHeaderCell>父级权限</TableHeaderCell>
                <TableHeaderCell>状态</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {!permissions || permissions.length === 0 ? (
                  <TableEmpty colSpan={6} message="暂无权限数据" />
                ) : (
                  permissions.map((permission) => (
                    <TableRow key={permission.id} row={permission}>
                      <TableCell>{permission.id}</TableCell>
                      <TableCell className="font-medium">{permission.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {permission.code}
                        </code>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                            permission.type === 'menu'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-purple-100 text-purple-800'
                          }`}
                        >
                          {permission.type === 'menu' ? '菜单' : '操作'}
                        </span>
                      </TableCell>
                      <TableCell>{getParentName(permission.parentId, permissions)}</TableCell>
                      <TableCell>
                        <StatusBadge status={permission.status} />
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default PermissionsPage;
