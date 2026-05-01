import { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { api } from '@/services/api';
import { queryKeys } from '@/services/queryClient';
import { useToast } from '@/context/ToastContext';
import { useDebounce } from '@/hooks/useDebounce';
import { createUserSchema, updateUserSchema, CreateUserFormData, UpdateUserFormData } from '@/schemas';
import Layout from '@/components/Layout';
import Loading from '@/components/Loading';
import Button from '@/components/Button';
import Input from '@/components/Input';
import Select from '@/components/Select';
import Modal, { ConfirmModal } from '@/components/Modal';
import Pagination from '@/components/Pagination';
import { Table, TableHeader, TableHeaderCell, TableBody, TableRow, TableCell, TableEmpty, StatusBadge } from '@/components/Table';
import type { User, Role } from '@/types';

interface UsersFilter {
  search: string;
  status: string;
  roleId: number | '';
}

function UserFormModal({
  isOpen,
  onClose,
  editingUser,
  roles,
}: {
  isOpen: boolean;
  onClose: () => void;
  editingUser?: User | null;
  roles: Role[];
}) {
  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();
  const isEdit = !!editingUser;

  const roleOptions = useMemo(
    () => roles.map((r) => ({ value: r.id, label: r.name })),
    [roles]
  );

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<CreateUserFormData | UpdateUserFormData>({
    resolver: zodResolver(isEdit ? updateUserSchema : createUserSchema),
    defaultValues: isEdit
      ? {
          username: editingUser!.username,
          email: editingUser!.email,
          roleId: editingUser!.roleId,
          status: editingUser!.status,
          phone: editingUser!.phone || '',
          address: editingUser!.address || '',
          password: '',
          confirmPassword: '',
        }
      : {
          username: '',
          email: '',
          password: '',
          confirmPassword: '',
          roleId: '',
          status: 'active',
          phone: '',
          address: '',
        },
  });

  const createMutation = useMutation({
    mutationFn: api.createUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      showSuccess('用户创建成功');
      onClose();
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUserFormData }) =>
      api.updateUser(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      showSuccess('用户更新成功');
      onClose();
      reset();
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const onSubmit = (data: CreateUserFormData | UpdateUserFormData) => {
    if (isEdit) {
      const updateData: UpdateUserFormData = {
        username: data.username,
        email: data.email,
        roleId: data.roleId,
        status: data.status,
        phone: data.phone,
        address: data.address,
      };
      if (data.password) {
        updateData.password = data.password;
        updateData.confirmPassword = data.confirmPassword;
      }
      updateMutation.mutate({ id: editingUser!.id, data: updateData });
    } else {
      createMutation.mutate(data as CreateUserFormData);
    }
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEdit ? '编辑用户' : '添加用户'}
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
            label="用户名"
            type="text"
            placeholder="请输入用户名"
            isRequired
            error={errors.username?.message}
            register={register('username')}
          />
          <Input
            label="邮箱"
            type="email"
            placeholder="请输入邮箱"
            isRequired
            error={errors.email?.message}
            register={register('email')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label={isEdit ? '密码 (留空则不修改)' : '密码'}
            type="password"
            placeholder={isEdit ? '留空则不修改' : '请输入密码'}
            isRequired={!isEdit}
            error={errors.password?.message}
            register={register('password')}
          />
          <Input
            label={isEdit ? '确认密码' : '确认密码'}
            type="password"
            placeholder={isEdit ? '留空则不修改' : '请再次输入密码'}
            isRequired={!isEdit || !!watch('password')}
            error={errors.confirmPassword?.message}
            register={register('confirmPassword')}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Select
            label="角色"
            placeholder="请选择角色"
            options={roleOptions}
            isRequired
            error={errors.roleId?.message}
            register={register('roleId')}
          />
          <Select
            label="状态"
            options={[
              { value: 'active', label: '激活' },
              { value: 'inactive', label: '禁用' },
              { value: 'pending', label: '待审核' },
            ]}
            register={register('status')}
          />
        </div>

        <Input
          label="手机号"
          type="tel"
          placeholder="请输入手机号"
          error={errors.phone?.message}
          register={register('phone')}
        />

        <Input
          label="地址"
          as="textarea"
          placeholder="请输入地址"
          error={errors.address?.message}
          register={register('address')}
        />
      </form>
    </Modal>
  );
}

export function UsersPage() {
  const [filter, setFilter] = useState<UsersFilter>({
    search: '',
    status: '',
    roleId: '',
  });
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deletingUserId, setDeletingUserId] = useState<number | null>(null);

  const queryClient = useQueryClient();
  const { showSuccess, showError } = useToast();

  const debouncedSearch = useDebounce(filter.search, 300);

  const { data: usersData, isLoading: isLoadingUsers } = useQuery({
    queryKey: queryKeys.users.list({
      page,
      pageSize,
      search: debouncedSearch,
      status: filter.status,
      roleId: filter.roleId || undefined,
    }),
    queryFn: () =>
      api.getUsers({
        page,
        pageSize,
        search: debouncedSearch,
        status: filter.status,
        roleId: filter.roleId || undefined,
      }),
  });

  const { data: roles, isLoading: isLoadingRoles } = useQuery({
    queryKey: queryKeys.roles.all,
    queryFn: api.getRoles,
  });

  const deleteMutation = useMutation({
    mutationFn: api.deleteUser,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
      queryClient.invalidateQueries({ queryKey: queryKeys.dashboard.stats });
      showSuccess('用户删除成功');
      setIsDeleteModalOpen(false);
      setDeletingUserId(null);
    },
    onError: (error: Error) => {
      showError(error.message);
    },
  });

  const handleAddUser = () => {
    setEditingUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setIsModalOpen(true);
  };

  const handleDeleteUser = (userId: number) => {
    setDeletingUserId(userId);
    setIsDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (deletingUserId) {
      deleteMutation.mutate(deletingUserId);
    }
  };

  const handleFilterChange = (key: keyof UsersFilter, value: string | number) => {
    setFilter((prev) => ({ ...prev, [key]: value }));
    setPage(1);
  };

  const isLoading = isLoadingUsers || isLoadingRoles;

  const roleOptions = useMemo(
    () => [
      { value: '', label: '全部角色' },
      ...(roles?.map((r) => ({ value: r.id, label: r.name })) || []),
    ],
    [roles]
  );

  return (
    <Layout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">用户管理</h1>
            <p className="text-gray-500 mt-1">管理系统中的所有用户</p>
          </div>
          <Button onClick={handleAddUser}>添加用户</Button>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              type="search"
              placeholder="搜索用户名、邮箱..."
              value={filter.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
              fullWidth
            />
            <Select
              options={[
                { value: '', label: '全部状态' },
                { value: 'active', label: '激活' },
                { value: 'inactive', label: '禁用' },
                { value: 'pending', label: '待审核' },
              ]}
              value={filter.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className="sm:w-40"
            />
            <Select
              options={roleOptions}
              value={filter.roleId}
              onChange={(e) =>
                handleFilterChange('roleId', e.target.value ? Number(e.target.value) : '')
              }
              className="sm:w-40"
            />
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          {isLoading ? (
            <Loading text="加载中..." />
          ) : (
            <>
              <Table>
                <TableHeader>
                  <TableHeaderCell>ID</TableHeaderCell>
                  <TableHeaderCell>用户名</TableHeaderCell>
                  <TableHeaderCell>邮箱</TableHeaderCell>
                  <TableHeaderCell>角色</TableHeaderCell>
                  <TableHeaderCell>状态</TableHeaderCell>
                  <TableHeaderCell>创建时间</TableHeaderCell>
                  <TableHeaderCell className="text-right">操作</TableHeaderCell>
                </TableHeader>
                <TableBody>
                  {!usersData || usersData.items.length === 0 ? (
                    <TableEmpty colSpan={7} message="暂无用户数据" />
                  ) : (
                    usersData.items.map((user) => (
                      <TableRow key={user.id} row={user}>
                        <TableCell>{user.id}</TableCell>
                        <TableCell className="font-medium">{user.username}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.role?.name || '-'}</TableCell>
                        <TableCell>
                          <StatusBadge status={user.status} />
                        </TableCell>
                        <TableCell>
                          {new Date(user.createdAt).toLocaleDateString('zh-CN')}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEditUser(user)}
                            >
                              编辑
                            </Button>
                            <Button
                              variant="danger"
                              size="sm"
                              onClick={() => handleDeleteUser(user.id)}
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
              {usersData && usersData.total > 0 && (
                <div className="px-6 py-4 border-t border-gray-100">
                  <Pagination
                    page={page}
                    pageSize={pageSize}
                    total={usersData.total}
                    onPageChange={setPage}
                    onPageSizeChange={(size) => {
                      setPageSize(size);
                      setPage(1);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>

      <UserFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        editingUser={editingUser}
        roles={roles || []}
      />

      <ConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => {
          setIsDeleteModalOpen(false);
          setDeletingUserId(null);
        }}
        onConfirm={confirmDelete}
        title="确认删除"
        message="确定要删除该用户吗？此操作无法撤销。"
        confirmText="删除"
        confirmVariant="danger"
        isLoading={deleteMutation.isPending}
      />
    </Layout>
  );
}

export default UsersPage;
