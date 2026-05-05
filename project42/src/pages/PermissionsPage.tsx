import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Modal, { ConfirmModal } from '@/components/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { Permission, CreatePermissionRequest, UpdatePermissionRequest } from '@/types';

interface PermissionNode {
  permission: Permission;
  children: PermissionNode[];
}

function buildPermissionTree(permissions: Permission[]): PermissionNode[] {
  const map = new Map<number | null, PermissionNode[]>();
  map.set(null, []);

  permissions.forEach((p) => {
    const node: PermissionNode = { permission: p, children: [] };
    if (!map.has(p.parentId)) {
      map.set(p.parentId, []);
    }
    map.get(p.parentId)!.push(node);
  });

  const buildTree = (parentId: number | null): PermissionNode[] => {
    const nodes = map.get(parentId) || [];
    return nodes.map((node) => ({
      ...node,
      children: buildTree(node.permission.id),
    }));
  };

  return buildTree(null);
}

function PermissionFormModal({
  isOpen,
  onClose,
  editingPermission,
  permissions,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingPermission?: Permission | null;
  permissions: Permission[];
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!editingPermission;

  const availableParentPermissions = useMemo(() => {
    const excludeIds = new Set<number>();
    if (editingPermission) {
      excludeIds.add(editingPermission.id);
      const collectChildren = (parentId: number) => {
        permissions
          .filter((p) => p.parentId === parentId)
          .forEach((p) => {
            excludeIds.add(p.id);
            collectChildren(p.id);
          });
      };
      collectChildren(editingPermission.id);
    }
    return permissions.filter((p) => !excludeIds.has(p.id));
  }, [permissions, editingPermission]);

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'action' as 'menu' | 'action',
    parentId: null as number | null,
    status: 'active' as 'active' | 'inactive',
  });

  const createMutation = useMutation({
    mutationFn: (data: CreatePermissionRequest) => api.createPermission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      showSuccess('权限创建成功');
      onClose();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdatePermissionRequest }) =>
      api.updatePermission(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      showSuccess('权限更新成功');
      onClose();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleSubmit = () => {
    if (!formData.name.trim()) {
      showError('请输入权限名称');
      return;
    }
    if (!formData.code.trim()) {
      showError('请输入权限代码');
      return;
    }

    const submitData = {
      ...formData,
    };

    if (isEdit && editingPermission) {
      updateMutation.mutate({ id: editingPermission.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const parentOptions = [
    { value: '', label: '无（顶级权限）' },
    ...availableParentPermissions.map((p) => ({
      value: String(p.id),
      label: `${p.name} (${p.code})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑权限' : '添加权限'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit} isLoading={isSubmitting}>
            保存
          </Button>
        </>
      }
    >
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="权限名称"
            placeholder="请输入权限名称"
            value={formData.name}
            onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
            isRequired
          />
          <Input
            label="权限代码"
            placeholder="请输入权限代码（如：user:create）"
            value={formData.code}
            onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
            isRequired
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="权限类型"
            value={formData.type}
            onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as 'menu' | 'action' }))}
            options={[
              { value: 'menu', label: '菜单' },
              { value: 'action', label: '操作' },
            ]}
          />
          <Select
            label="父级权限"
            value={formData.parentId === null ? '' : String(formData.parentId)}
            onChange={(e) => {
              const val = e.target.value;
              setFormData((prev) => ({ ...prev, parentId: val === '' ? null : Number(val) }));
            }}
            options={parentOptions}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="状态"
            value={formData.status}
            onChange={(e) => setFormData((prev) => ({ ...prev, status: e.target.value as 'active' | 'inactive' }))}
            options={[
              { value: 'active', label: '启用' },
              { value: 'inactive', label: '禁用' },
            ]}
          />
        </div>
      </div>
    </Modal>
  );
}

export function PermissionsPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingPermissionId, setDeletingPermissionId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: permissions, isLoading } = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: api.getPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deletePermission,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.permissions.all });
      showSuccess('权限删除成功');
      setIsDeleteModalOpen(false);
      setDeletingPermissionId(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleAddPermission = () => {
    setEditingPermission(null);
    setIsModalOpen(true);
  };

  const handleEditPermission = (permission: Permission) => {
    setEditingPermission(permission);
    setIsModalOpen(true);
  };

  const handleDeletePermission = (permissionId: number) => {
    setDeletingPermissionId(permissionId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingPermissionId) {
      deleteMutation.mutate(deletingPermissionId);
    }
  };

  const getParentName = (parentId: number | null, allPermissions: Permission[]): string => {
    if (!parentId) return '-';
    const parent = allPermissions.find((p) => p.id === parentId);
    return parent?.name || '-';
  };

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">权限管理</h1>
            <p className="text-gray-500 mt-1">管理系统中的所有权限配置</p>
          </div>
          <Button onClick={handleAddPermission}>添加权限</Button>
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
                <TableHeaderCell className="text-right">操作</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {!permissions || permissions.length === 0 ? (
                  <TableEmpty colSpan={7} message="暂无权限数据" />
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
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPermission(permission)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeletePermission(permission.id)}
                          >
                            删除
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          )}
        </div>
      </div>

      <PermissionFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingPermission={editingPermission}
        permissions={permissions || []}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingPermissionId(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除该权限吗？如果权限有子权限或已被角色使用将无法删除。"
        confirmText="删除"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

export default PermissionsPage;
