import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import { roleSchema, RoleFormData } from '@/schemas';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Modal, { ConfirmModal } from '@/components/Modal';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { Role, Permission } from '@/types';

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

function PermissionTree({
  tree,
  selectedIds,
  onToggle,
}: {
  tree: PermissionNode[];
  selectedIds: number[];
  onToggle: (id: number, checked: boolean) => void;
}) {
  const renderNode = (node: PermissionNode, level: number) => {
    const isChecked = selectedIds.includes(node.permission.id);

    const handleToggle = (checked: boolean) => {
      onToggle(node.permission.id, checked);
      
      const toggleChildren = (children: PermissionNode[], checked: boolean) => {
        children.forEach((child) => {
          onToggle(child.permission.id, checked);
          toggleChildren(child.children, checked);
        });
      };
      toggleChildren(node.children, checked);
    };

    return (
      <div key={node.permission.id} style={{ marginLeft: level * 24 }}>
        <label className="flex items-center gap-2 py-1 text-sm cursor-pointer hover:bg-gray-50 px-2 rounded">
          <input
            type="checkbox"
            checked={isChecked}
            onChange={(e) => handleToggle(e.target.checked)}
            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <span className="text-gray-700">
            {node.permission.name}
            <span className="text-xs text-gray-400 ml-2">({node.permission.code})</span>
          </span>
        </label>
        {node.children.length > 0 && (
          <div>{node.children.map((child) => renderNode(child, level + 1))}</div>
        )}
      </div>
    );
  };

  return <div className="space-y-1">{tree.map((node) => renderNode(node, 0))}</div>;
}

function RoleFormModal({
  isOpen,
  onClose,
  editingRole,
  permissions,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingRole?: Role | null;
  permissions: Permission[];
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!editingRole;

  const permissionTree = useMemo(
    () => buildPermissionTree(permissions),
    [permissions]
  );

  const [selectedPermissions, setSelectedPermissions] = useState<number[]>(
    editingRole?.permissions || []
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<RoleFormData>({
    resolver: zodResolver(roleSchema),
    defaultValues: isEdit
      ? {
          name: editingRole!.name,
          code: editingRole!.code,
          description: editingRole!.description || '',
          permissions: editingRole!.permissions,
        }
      : {
          name: '',
          code: '',
          description: '',
          permissions: [],
        },
  });

  const handlePermissionToggle = (id: number, checked: boolean) => {
    setSelectedPermissions((prev) =>
      checked ? [...prev, id] : prev.filter((p) => p !== id)
    );
  };

  const createMutation = useMutation({
    mutationFn: api.createRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      showSuccess('角色创建成功');
      onClose();
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: RoleFormData }) =>
      api.updateRole(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      showSuccess('角色更新成功');
      onClose();
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: RoleFormData) => {
    const submitData = { ...data, permissions: selectedPermissions };
    if (isEdit) {
      updateMutation.mutate({ id: editingRole!.id, data: submitData });
    } else {
      createMutation.mutate(submitData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑角色' : '添加角色'}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose} disabled={isLoading}>
            取消
          </Button>
          <Button variant="primary" onClick={handleSubmit(onSubmit)} isLoading={isLoading}>
            保存
          </Button>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="角色名称"
            type="text"
            placeholder="请输入角色名称"
            isRequired
            error={errors.name?.message}
            register={register('name')}
          />
          <Input
            label="角色代码"
            type="text"
            placeholder="请输入角色代码（如：admin, editor）"
            isRequired
            error={errors.code?.message}
            register={register('code')}
          />
        </div>

        <Input
          label="描述"
          as="textarea"
          placeholder="请输入角色描述"
          error={errors.description?.message}
          register={register('description')}
        />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">权限配置</label>
          <div className="border border-gray-200 rounded-lg p-4 max-h-80 overflow-y-auto bg-gray-50">
            {permissions.length === 0 ? (
              <p className="text-gray-500 text-sm">暂无权限数据</p>
            ) : (
              <PermissionTree
                tree={permissionTree}
                selectedIds={selectedPermissions}
                onToggle={handlePermissionToggle}
              />
            )}
          </div>
        </div>
      </form>
    </Modal>
  );
}

export function RolesPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingRoleId, setDeletingRoleId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: api.getRoles,
  });

  const { data: permissions, isLoading: isLoadingPermissions } = useQuery({
    queryKey: queryKeys.permissions.all,
    queryFn: api.getPermissions,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteRole,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.roles.all });
      showSuccess('角色删除成功');
      setIsDeleteModalOpen(false);
      setDeletingRoleId(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleAddRole = () => {
    setEditingRole(null);
    setIsModalOpen(true);
  };

  const handleEditRole = (role: Role) => {
    setEditingRole(role);
    setIsModalOpen(true);
  };

  const handleDeleteRole = (roleId: number) => {
    setDeletingRoleId(roleId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingRoleId) {
      deleteMutation.mutate(deletingRoleId);
    }
  };

  const isLoading = isLoadingRoles || isLoadingPermissions;

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">角色管理</h1>
            <p className="text-gray-500 mt-1">管理系统中的角色和权限</p>
          </div>
          <Button onClick={handleAddRole}>添加角色</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <Loading text="加载中..." />
          ) : (
            <Table>
              <TableHeader>
                <TableHeaderCell>ID</TableHeaderCell>
                <TableHeaderCell>角色名称</TableHeaderCell>
                <TableHeaderCell>角色代码</TableHeaderCell>
                <TableHeaderCell>描述</TableHeaderCell>
                <TableHeaderCell>用户数量</TableHeaderCell>
                <TableHeaderCell>状态</TableHeaderCell>
                <TableHeaderCell>创建时间</TableHeaderCell>
                <TableHeaderCell className="text-right">操作</TableHeaderCell>
              </TableHeader>
              <TableBody>
                {!roles || roles.length === 0 ? (
                  <TableEmpty colSpan={8} message="暂无角色数据" />
                ) : (
                  roles.map((role) => (
                    <TableRow key={role.id} row={role}>
                      <TableCell>{role.id}</TableCell>
                      <TableCell className="font-medium">{role.name}</TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {role.code}
                        </code>
                      </TableCell>
                      <TableCell className="max-w-xs truncate" title={role.description}>
                        {role.description || '-'}
                      </TableCell>
                      <TableCell>{role.userCount}</TableCell>
                      <TableCell>
                        <StatusBadge status={role.status} />
                      </TableCell>
                      <TableCell>
                        {new Date(role.createdAt).toLocaleDateString('zh-CN')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditRole(role)}
                          >
                            编辑
                          </Button>
                          <Button
                            variant="danger"
                            size="sm"
                            onClick={() => handleDeleteRole(role.id)}
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

      <RoleFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingRole={editingRole}
        permissions={permissions || []}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingRoleId(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除该角色吗？如果角色下有用户将无法删除。"
        confirmText="删除"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

export default RolesPage;
