import type {
  User,
  Role,
  Permission,
  Activity,
  DashboardStats,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  CreateUserRequest,
  UpdateUserRequest,
  CreateRoleRequest,
  UpdateRoleRequest,
  SystemSettings,
} from '@/types';

const API_BASE_URL = '/api';

class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public data?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

interface ApiConfig {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

const mockData = {
  users: [
    { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', roleId: 1, status: 'active' as const, phone: '13800138000', address: '北京市朝阳区', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T10:30:00Z' },
    { id: 2, username: 'editor', email: 'editor@example.com', password: 'editor123', roleId: 2, status: 'active' as const, phone: '13800138001', address: '上海市浦东新区', createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-02-20T14:20:00Z' },
    { id: 3, username: 'user1', email: 'user1@example.com', password: 'user123', roleId: 3, status: 'active' as const, phone: '13800138002', address: '广州市天河区', createdAt: '2024-03-05T11:00:00Z', updatedAt: '2024-03-10T16:45:00Z' },
    { id: 4, username: 'user2', email: 'user2@example.com', password: 'user123', roleId: 3, status: 'inactive' as const, phone: '13800138003', address: '深圳市南山区', createdAt: '2024-03-15T13:00:00Z', updatedAt: '2024-03-18T09:30:00Z' },
    { id: 5, username: 'user3', email: 'user3@example.com', password: 'user123', roleId: 2, status: 'pending' as const, phone: '13800138004', address: '杭州市西湖区', createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-04-05T11:15:00Z' },
    { id: 6, username: 'user4', email: 'user4@example.com', password: 'user123', roleId: 3, status: 'active' as const, phone: '13800138005', address: '南京市鼓楼区', createdAt: '2024-04-10T10:30:00Z', updatedAt: '2024-04-12T15:00:00Z' },
    { id: 7, username: 'user5', email: 'user5@example.com', password: 'user123', roleId: 2, status: 'active' as const, phone: '13800138006', address: '成都市武侯区', createdAt: '2024-04-15T14:00:00Z', updatedAt: '2024-04-18T09:20:00Z' },
    { id: 8, username: 'user6', email: 'user6@example.com', password: 'user123', roleId: 3, status: 'inactive' as const, phone: '13800138007', address: '武汉市江汉区', createdAt: '2024-04-20T16:00:00Z', updatedAt: '2024-04-22T13:30:00Z' },
  ],
  roles: [
    { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', userCount: 1, status: 'active' as const, permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], createdAt: '2024-01-01T00:00:00Z' },
    { id: 2, name: '内容编辑', code: 'editor', description: '可以管理内容和用户', userCount: 2, status: 'active' as const, permissions: [3, 4, 5, 6, 7, 8], createdAt: '2024-01-01T00:00:00Z' },
    { id: 3, name: '普通用户', code: 'user', description: '只能查看自己的信息', userCount: 5, status: 'active' as const, permissions: [9, 10], createdAt: '2024-01-01T00:00:00Z' },
    { id: 4, name: '访客', code: 'guest', description: '只读访问', userCount: 0, status: 'inactive' as const, permissions: [], createdAt: '2024-02-01T00:00:00Z' },
  ],
  permissions: [
    { id: 1, name: '用户管理-查看', code: 'user:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 2, name: '用户管理-创建', code: 'user:create', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 3, name: '用户管理-编辑', code: 'user:edit', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 4, name: '用户管理-删除', code: 'user:delete', type: 'action' as const, parentId: 1, status: 'active' as const },
    { id: 5, name: '角色管理-查看', code: 'role:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 6, name: '角色管理-创建', code: 'role:create', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 7, name: '角色管理-编辑', code: 'role:edit', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 8, name: '角色管理-删除', code: 'role:delete', type: 'action' as const, parentId: 5, status: 'active' as const },
    { id: 9, name: '个人信息-查看', code: 'profile:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 10, name: '个人信息-编辑', code: 'profile:edit', type: 'action' as const, parentId: 9, status: 'active' as const },
    { id: 11, name: '系统设置-查看', code: 'settings:view', type: 'menu' as const, parentId: null, status: 'active' as const },
    { id: 12, name: '系统设置-编辑', code: 'settings:edit', type: 'action' as const, parentId: 11, status: 'active' as const },
  ],
  activities: [
    { id: 1, action: '用户登录', user: 'admin', time: '2024-04-30 10:30:00', status: 'success' as const },
    { id: 2, action: '创建用户 user1', user: 'admin', time: '2024-04-30 09:15:00', status: 'success' as const },
    { id: 3, action: '修改角色权限', user: 'admin', time: '2024-04-29 16:45:00', status: 'success' as const },
    { id: 4, action: '删除用户 user2', user: 'admin', time: '2024-04-29 14:20:00', status: 'success' as const },
    { id: 5, action: '用户登录失败', user: 'unknown', time: '2024-04-29 12:00:00', status: 'failed' as const },
  ],
  settings: {
    siteName: '用户管理系统',
    siteDescription: '这是一个功能强大的用户管理系统',
    defaultLanguage: 'zh-CN' as const,
    defaultTheme: 'light' as const,
    sessionTimeout: 30,
    maxLoginAttempts: 5,
    passwordMinLength: 8,
    requireMFA: false,
    smtpHost: 'smtp.example.com',
    smtpPort: 587,
    smtpUsername: 'admin@example.com',
    smtpPassword: '',
    notifyUserCreated: true,
    notifyUserUpdated: false,
    notifyUserDeleted: true,
    notifySystemError: true,
  },
  nextUserId: 9,
  nextRoleId: 5,
  nextActivityId: 6,
};

let mutableMockData = JSON.parse(JSON.stringify(mockData)) as typeof mockData;

const getToken = (): string | null => {
  return sessionStorage.getItem('token');
};

const delay = (ms: number): Promise<void> => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const getPermissionsByRoleId = (roleId: number): Permission[] => {
  const role = mutableMockData.roles.find((r) => r.id === roleId);
  if (!role) return [];
  return mutableMockData.permissions.filter((p) => role.permissions.includes(p.id));
};

const addActivity = (action: string) => {
  const auth = sessionStorage.getItem('auth');
  let username = 'system';
  if (auth) {
    try {
      const parsed = JSON.parse(auth);
      username = parsed.user?.username || 'system';
    } catch {
      username = 'system';
    }
  }

  mutableMockData.activities.unshift({
    id: mutableMockData.nextActivityId++,
    action,
    user: username,
    time: new Date().toISOString().slice(0, 19).replace('T', ' '),
    status: 'success',
  });

  if (mutableMockData.activities.length > 50) {
    mutableMockData.activities = mutableMockData.activities.slice(0, 50);
  }
};

const mockApiCall = async <T>(
  url: string,
  method: 'GET' | 'POST' | 'PUT' | 'DELETE',
  data?: unknown
): Promise<T> => {
  await delay(300);

  if (url === `${API_BASE_URL}/auth/login` && method === 'POST') {
    const { username, password } = data as LoginRequest;
    const user = mutableMockData.users.find(
      (u) => u.username === username && u.password === password
    );

    if (user) {
      const role = mutableMockData.roles.find((r) => r.id === user.roleId);
      const permissions = getPermissionsByRoleId(user.roleId);

      return {
        token: `mock-jwt-token-${Date.now()}`,
        user: {
          ...user,
          role: role!,
          permissions,
        },
      } as T;
    }

    throw new ApiError('用户名或密码错误', 401);
  }

  if (url === `${API_BASE_URL}/auth/logout` && method === 'POST') {
    return { message: '登出成功' } as T;
  }

  if (url === `${API_BASE_URL}/users` && method === 'GET') {
    const params = data as {
      page?: number;
      pageSize?: number;
      search?: string;
      status?: string;
      roleId?: number;
    };

    let users = [...mutableMockData.users];

    if (params.search) {
      const search = params.search.toLowerCase();
      users = users.filter(
        (u) =>
          u.username.toLowerCase().includes(search) ||
          u.email.toLowerCase().includes(search)
      );
    }

    if (params.status) {
      users = users.filter((u) => u.status === params.status);
    }

    if (params.roleId) {
      users = users.filter((u) => u.roleId === Number(params.roleId));
    }

    const page = params.page || 1;
    const pageSize = params.pageSize || 10;
    const startIndex = (page - 1) * pageSize;
    const paginatedItems = users.slice(startIndex, startIndex + pageSize);

    const usersWithRole = paginatedItems.map((u) => {
      const role = mutableMockData.roles.find((r) => r.id === u.roleId);
      return { ...u, role };
    });

    return {
      items: usersWithRole,
      total: users.length,
      page,
      pageSize,
      totalPages: Math.ceil(users.length / pageSize),
    } as T;
  }

  if (url === `${API_BASE_URL}/users` && method === 'POST') {
    const userData = data as CreateUserRequest;

    const exists = mutableMockData.users.find(
      (u) => u.username === userData.username || u.email === userData.email
    );

    if (exists) {
      throw new ApiError('用户名或邮箱已存在', 400);
    }

    const newUser: User = {
      id: mutableMockData.nextUserId++,
      username: userData.username,
      email: userData.email,
      roleId: Number(userData.roleId),
      status: userData.status,
      phone: userData.phone,
      address: userData.address,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.users.push(newUser);

    const role = mutableMockData.roles.find((r) => r.id === newUser.roleId);
    if (role) {
      role.userCount++;
    }

    addActivity(`创建用户 ${newUser.username}`);

    return { ...newUser, role } as T;
  }

  const userMatch = url.match(/\/users\/(\d+)$/);
  if (userMatch) {
    const userId = parseInt(userMatch[1], 10);
    const userIndex = mutableMockData.users.findIndex((u) => u.id === userId);

    if (userIndex === -1) {
      throw new ApiError('用户不存在', 404);
    }

    if (method === 'GET') {
      const user = mutableMockData.users[userIndex];
      const role = mutableMockData.roles.find((r) => r.id === user.roleId);
      return { ...user, role } as T;
    }

    if (method === 'PUT') {
      const updateData = data as UpdateUserRequest;
      const oldRoleId = mutableMockData.users[userIndex].roleId;

      mutableMockData.users[userIndex] = {
        ...mutableMockData.users[userIndex],
        ...updateData,
        updatedAt: new Date().toISOString(),
      };

      if (updateData.roleId && oldRoleId !== Number(updateData.roleId)) {
        const oldRole = mutableMockData.roles.find((r) => r.id === oldRoleId);
        const newRole = mutableMockData.roles.find((r) => r.id === Number(updateData.roleId!));
        if (oldRole) oldRole.userCount--;
        if (newRole) newRole.userCount++;
      }

      const updatedUser = mutableMockData.users[userIndex];
      const updatedRole = mutableMockData.roles.find((r) => r.id === updatedUser.roleId);

      addActivity(`更新用户 ${updatedUser.username}`);

      return { ...updatedUser, role: updatedRole } as T;
    }

    if (method === 'DELETE') {
      const deletedUser = mutableMockData.users.splice(userIndex, 1)[0];
      const role = mutableMockData.roles.find((r) => r.id === deletedUser.roleId);
      if (role) {
        role.userCount--;
      }

      addActivity(`删除用户 ${deletedUser.username}`);

      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/roles` && method === 'GET') {
    return [...mutableMockData.roles] as T;
  }

  if (url === `${API_BASE_URL}/roles` && method === 'POST') {
    const roleData = data as CreateRoleRequest;

    const exists = mutableMockData.roles.find(
      (r) => r.code === roleData.code || r.name === roleData.name
    );

    if (exists) {
      throw new ApiError('角色代码或名称已存在', 400);
    }

    const newRole: Role = {
      id: mutableMockData.nextRoleId++,
      name: roleData.name,
      code: roleData.code,
      description: roleData.description,
      userCount: 0,
      status: 'active',
      permissions: roleData.permissions,
      createdAt: new Date().toISOString(),
    };

    mutableMockData.roles.push(newRole);
    addActivity(`创建角色 ${newRole.name}`);

    return newRole as T;
  }

  const roleMatch = url.match(/\/roles\/(\d+)$/);
  if (roleMatch) {
    const roleId = parseInt(roleMatch[1], 10);
    const roleIndex = mutableMockData.roles.findIndex((r) => r.id === roleId);

    if (roleIndex === -1) {
      throw new ApiError('角色不存在', 404);
    }

    if (method === 'GET') {
      return { ...mutableMockData.roles[roleIndex] } as T;
    }

    if (method === 'PUT') {
      const updateData = data as UpdateRoleRequest;
      mutableMockData.roles[roleIndex] = {
        ...mutableMockData.roles[roleIndex],
        ...updateData,
      };

      addActivity(`更新角色 ${mutableMockData.roles[roleIndex].name}`);

      return { ...mutableMockData.roles[roleIndex] } as T;
    }

    if (method === 'DELETE') {
      const roleToDelete = mutableMockData.roles[roleIndex];
      const usersWithRole = mutableMockData.users.filter((u) => u.roleId === roleId);

      if (usersWithRole.length > 0) {
        throw new ApiError('该角色下还有用户，无法删除', 400);
      }

      mutableMockData.roles.splice(roleIndex, 1);
      addActivity(`删除角色 ${roleToDelete.name}`);

      return { message: '删除成功' } as T;
    }
  }

  if (url === `${API_BASE_URL}/permissions` && method === 'GET') {
    return [...mutableMockData.permissions] as T;
  }

  if (url === `${API_BASE_URL}/dashboard/stats` && method === 'GET') {
    return {
      totalUsers: mutableMockData.users.length,
      activeUsers: mutableMockData.users.filter((u) => u.status === 'active').length,
      totalRoles: mutableMockData.roles.length,
      pendingRequests: 0,
    } as T;
  }

  if (url === `${API_BASE_URL}/dashboard/activities` && method === 'GET') {
    return [...mutableMockData.activities] as T;
  }

  if (url === `${API_BASE_URL}/settings`) {
    if (method === 'GET') {
      return { ...mutableMockData.settings } as T;
    }

    if (method === 'PUT') {
      const updateData = data as Partial<SystemSettings>;
      mutableMockData.settings = { ...mutableMockData.settings, ...updateData };
      addActivity('更新系统设置');
      return { ...mutableMockData.settings } as T;
    }
  }

  throw new ApiError('API接口不存在', 404);
};

export const api = {
  async login(data: LoginRequest): Promise<LoginResponse> {
    return mockApiCall<LoginResponse>(`${API_BASE_URL}/auth/login`, 'POST', data);
  },

  async logout(): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/auth/logout`, 'POST');
  },

  async getUsers(params: {
    page?: number;
    pageSize?: number;
    search?: string;
    status?: string;
    roleId?: number;
  } = {}): Promise<PaginatedResponse<User>> {
    return mockApiCall<PaginatedResponse<User>>(`${API_BASE_URL}/users`, 'GET', params);
  },

  async getUser(id: number): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users/${id}`, 'GET');
  },

  async createUser(data: CreateUserRequest): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users`, 'POST', data);
  },

  async updateUser(id: number, data: UpdateUserRequest): Promise<User> {
    return mockApiCall<User>(`${API_BASE_URL}/users/${id}`, 'PUT', data);
  },

  async deleteUser(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/users/${id}`, 'DELETE');
  },

  async batchDeleteUsers(ids: number[]): Promise<{ deleted: number }> {
    let deleted = 0;
    for (const id of ids) {
      try {
        await this.deleteUser(id);
        deleted++;
      } catch {
        // 忽略单个删除错误
      }
    }
    return { deleted };
  },

  async getRoles(): Promise<Role[]> {
    return mockApiCall<Role[]>(`${API_BASE_URL}/roles`, 'GET');
  },

  async getRole(id: number): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles/${id}`, 'GET');
  },

  async createRole(data: CreateRoleRequest): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles`, 'POST', data);
  },

  async updateRole(id: number, data: UpdateRoleRequest): Promise<Role> {
    return mockApiCall<Role>(`${API_BASE_URL}/roles/${id}`, 'PUT', data);
  },

  async deleteRole(id: number): Promise<{ message: string }> {
    return mockApiCall<{ message: string }>(`${API_BASE_URL}/roles/${id}`, 'DELETE');
  },

  async getPermissions(): Promise<Permission[]> {
    return mockApiCall<Permission[]>(`${API_BASE_URL}/permissions`, 'GET');
  },

  async getDashboardStats(): Promise<DashboardStats> {
    return mockApiCall<DashboardStats>(`${API_BASE_URL}/dashboard/stats`, 'GET');
  },

  async getActivities(): Promise<Activity[]> {
    return mockApiCall<Activity[]>(`${API_BASE_URL}/dashboard/activities`, 'GET');
  },

  async getSettings(): Promise<SystemSettings> {
    return mockApiCall<SystemSettings>(`${API_BASE_URL}/settings`, 'GET');
  },

  async updateSettings(data: Partial<SystemSettings>): Promise<SystemSettings> {
    return mockApiCall<SystemSettings>(`${API_BASE_URL}/settings`, 'PUT', data);
  },

  resetMockData(): void {
    mutableMockData = JSON.parse(JSON.stringify(mockData)) as typeof mockData;
  },
};

export type { ApiError, ApiConfig };
