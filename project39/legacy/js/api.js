/**
 * API模块
 * 处理所有AJAX请求和模拟数据
 */
(function(window, $, Utils) {
    'use strict';

    var API = {
        baseUrl: '/api',
        timeout: 30000,

        mockData: {
            users: [
                { id: 1, username: 'admin', email: 'admin@example.com', password: 'admin123', roleId: 1, status: 'active', phone: '13800138000', address: '北京市朝阳区', createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-15T10:30:00Z' },
                { id: 2, username: 'editor', email: 'editor@example.com', password: 'editor123', roleId: 2, status: 'active', phone: '13800138001', address: '上海市浦东新区', createdAt: '2024-02-10T09:00:00Z', updatedAt: '2024-02-20T14:20:00Z' },
                { id: 3, username: 'user1', email: 'user1@example.com', password: 'user123', roleId: 3, status: 'active', phone: '13800138002', address: '广州市天河区', createdAt: '2024-03-05T11:00:00Z', updatedAt: '2024-03-10T16:45:00Z' },
                { id: 4, username: 'user2', email: 'user2@example.com', password: 'user123', roleId: 3, status: 'inactive', phone: '13800138003', address: '深圳市南山区', createdAt: '2024-03-15T13:00:00Z', updatedAt: '2024-03-18T09:30:00Z' },
                { id: 5, username: 'user3', email: 'user3@example.com', password: 'user123', roleId: 2, status: 'pending', phone: '13800138004', address: '杭州市西湖区', createdAt: '2024-04-01T08:00:00Z', updatedAt: '2024-04-05T11:15:00Z' },
                { id: 6, username: 'user4', email: 'user4@example.com', password: 'user123', roleId: 3, status: 'active', phone: '13800138005', address: '南京市鼓楼区', createdAt: '2024-04-10T10:30:00Z', updatedAt: '2024-04-12T15:00:00Z' },
                { id: 7, username: 'user5', email: 'user5@example.com', password: 'user123', roleId: 2, status: 'active', phone: '13800138006', address: '成都市武侯区', createdAt: '2024-04-15T14:00:00Z', updatedAt: '2024-04-18T09:20:00Z' },
                { id: 8, username: 'user6', email: 'user6@example.com', password: 'user123', roleId: 3, status: 'inactive', phone: '13800138007', address: '武汉市江汉区', createdAt: '2024-04-20T16:00:00Z', updatedAt: '2024-04-22T13:30:00Z' }
            ],
            roles: [
                { id: 1, name: '超级管理员', code: 'admin', description: '拥有系统所有权限', userCount: 1, status: 'active', permissions: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12], createdAt: '2024-01-01T00:00:00Z' },
                { id: 2, name: '内容编辑', code: 'editor', description: '可以管理内容和用户', userCount: 2, status: 'active', permissions: [3, 4, 5, 6, 7, 8], createdAt: '2024-01-01T00:00:00Z' },
                { id: 3, name: '普通用户', code: 'user', description: '只能查看自己的信息', userCount: 5, status: 'active', permissions: [9, 10], createdAt: '2024-01-01T00:00:00Z' },
                { id: 4, name: '访客', code: 'guest', description: '只读访问', userCount: 0, status: 'inactive', permissions: [], createdAt: '2024-02-01T00:00:00Z' }
            ],
            permissions: [
                { id: 1, name: '用户管理-查看', code: 'user:view', type: 'menu', parentId: null, status: 'active' },
                { id: 2, name: '用户管理-创建', code: 'user:create', type: 'action', parentId: 1, status: 'active' },
                { id: 3, name: '用户管理-编辑', code: 'user:edit', type: 'action', parentId: 1, status: 'active' },
                { id: 4, name: '用户管理-删除', code: 'user:delete', type: 'action', parentId: 1, status: 'active' },
                { id: 5, name: '角色管理-查看', code: 'role:view', type: 'menu', parentId: null, status: 'active' },
                { id: 6, name: '角色管理-创建', code: 'role:create', type: 'action', parentId: 5, status: 'active' },
                { id: 7, name: '角色管理-编辑', code: 'role:edit', type: 'action', parentId: 5, status: 'active' },
                { id: 8, name: '角色管理-删除', code: 'role:delete', type: 'action', parentId: 5, status: 'active' },
                { id: 9, name: '个人信息-查看', code: 'profile:view', type: 'menu', parentId: null, status: 'active' },
                { id: 10, name: '个人信息-编辑', code: 'profile:edit', type: 'action', parentId: 9, status: 'active' },
                { id: 11, name: '系统设置-查看', code: 'settings:view', type: 'menu', parentId: null, status: 'active' },
                { id: 12, name: '系统设置-编辑', code: 'settings:edit', type: 'action', parentId: 11, status: 'active' }
            ],
            activities: [
                { id: 1, action: '用户登录', user: 'admin', time: '2024-04-30 10:30:00', status: 'success' },
                { id: 2, action: '创建用户 user1', user: 'admin', time: '2024-04-30 09:15:00', status: 'success' },
                { id: 3, action: '修改角色权限', user: 'admin', time: '2024-04-29 16:45:00', status: 'success' },
                { id: 4, action: '删除用户 user2', user: 'admin', time: '2024-04-29 14:20:00', status: 'success' },
                { id: 5, action: '用户登录失败', user: 'unknown', time: '2024-04-29 12:00:00', status: 'failed' }
            ],
            settings: {
                siteName: '用户管理系统',
                siteDescription: '这是一个功能强大的用户管理系统',
                defaultLanguage: 'zh-CN',
                defaultTheme: 'light',
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
                notifySystemError: true
            }
        },

        nextUserId: 9,
        nextRoleId: 5,
        nextPermissionId: 13,
        nextActivityId: 6,

        /**
         * 通用请求方法
         * @param {Object} options - 请求选项
         * @returns {Promise} Promise对象
         */
        request: function(options) {
            var self = this;
            
            return new Promise(function(resolve, reject) {
                setTimeout(function() {
                    var url = options.url || '';
                    var method = (options.method || 'GET').toUpperCase();
                    var data = options.data || {};

                    var response = self.mockResponse(url, method, data);
                    
                    if (response.success) {
                        resolve(response.data);
                    } else {
                        reject(response.error);
                    }
                }, options.mockDelay || 300);
            });
        },

        /**
         * 模拟API响应
         */
        mockResponse: function(url, method, data) {
            var self = this;
            
            if (url === '/auth/login' && method === 'POST') {
                var user = self.mockData.users.find(function(u) {
                    return u.username === data.username && u.password === data.password;
                });
                
                if (user) {
                    var role = self.mockData.roles.find(function(r) {
                        return r.id === user.roleId;
                    });
                    
                    return {
                        success: true,
                        data: {
                            token: 'mock-jwt-token-' + Date.now(),
                            user: {
                                id: user.id,
                                username: user.username,
                                email: user.email,
                                role: role,
                                permissions: self.getPermissionsByRoleId(user.roleId)
                            }
                        }
                    };
                } else {
                    return {
                        success: false,
                        error: { message: '用户名或密码错误' }
                    };
                }
            }

            if (url === '/auth/logout' && method === 'POST') {
                return { success: true, data: { message: '登出成功' } };
            }

            if (url === '/auth/current' && method === 'GET') {
                var auth = Utils.getSessionStorage('auth');
                if (auth && auth.user) {
                    return { success: true, data: auth.user };
                }
                return { success: false, error: { message: '未登录' } };
            }

            if (url.startsWith('/users') && method === 'GET') {
                var query = self.mockData.users.slice();
                
                if (data.search) {
                    var search = data.search.toLowerCase();
                    query = query.filter(function(u) {
                        return u.username.toLowerCase().indexOf(search) !== -1 ||
                               u.email.toLowerCase().indexOf(search) !== -1;
                    });
                }
                
                if (data.status) {
                    query = query.filter(function(u) { return u.status === data.status; });
                }
                
                if (data.roleId) {
                    query = query.filter(function(u) { return u.roleId === parseInt(data.roleId); });
                }

                var page = data.page || 1;
                var pageSize = data.pageSize || 10;
                var startIndex = (page - 1) * pageSize;
                var paginatedData = query.slice(startIndex, startIndex + pageSize);

                var usersWithRole = paginatedData.map(function(u) {
                    var role = self.mockData.roles.find(function(r) { return r.id === u.roleId; });
                    return $.extend({}, u, { role: role });
                });

                return {
                    success: true,
                    data: {
                        items: usersWithRole,
                        total: query.length,
                        page: page,
                        pageSize: pageSize,
                        totalPages: Math.ceil(query.length / pageSize)
                    }
                };
            }

            if (url === '/users' && method === 'POST') {
                var exists = self.mockData.users.find(function(u) {
                    return u.username === data.username || u.email === data.email;
                });
                
                if (exists) {
                    return {
                        success: false,
                        error: { message: '用户名或邮箱已存在' }
                    };
                }

                var newUser = {
                    id: self.nextUserId++,
                    username: data.username,
                    email: data.email,
                    password: data.password,
                    roleId: parseInt(data.roleId),
                    status: data.status || 'active',
                    phone: data.phone || '',
                    address: data.address || '',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString()
                };
                
                self.mockData.users.push(newUser);
                
                var role = self.mockData.roles.find(function(r) { return r.id === newUser.roleId; });
                if (role) {
                    role.userCount++;
                }

                self.addActivity('创建用户 ' + newUser.username);

                return { success: true, data: $.extend({}, newUser, { role: role }) };
            }

            if (url.match(/\/users\/\d+$/) && method === 'GET') {
                var userId = parseInt(url.split('/').pop());
                var foundUser = self.mockData.users.find(function(u) { return u.id === userId; });
                
                if (foundUser) {
                    var userRole = self.mockData.roles.find(function(r) { return r.id === foundUser.roleId; });
                    return { success: true, data: $.extend({}, foundUser, { role: userRole }) };
                }
                
                return { success: false, error: { message: '用户不存在' } };
            }

            if (url.match(/\/users\/\d+$/) && method === 'PUT') {
                var updateUserId = parseInt(url.split('/').pop());
                var updateUserIndex = self.mockData.users.findIndex(function(u) { return u.id === updateUserId; });
                
                if (updateUserIndex === -1) {
                    return { success: false, error: { message: '用户不存在' } };
                }

                var oldRoleId = self.mockData.users[updateUserIndex].roleId;
                var newRoleId = parseInt(data.roleId);

                self.mockData.users[updateUserIndex] = $.extend(
                    {},
                    self.mockData.users[updateUserIndex],
                    data,
                    { updatedAt: new Date().toISOString() }
                );

                if (oldRoleId !== newRoleId) {
                    var oldRole = self.mockData.roles.find(function(r) { return r.id === oldRoleId; });
                    var newRole = self.mockData.roles.find(function(r) { return r.id === newRoleId; });
                    if (oldRole) oldRole.userCount--;
                    if (newRole) newRole.userCount++;
                }

                var updatedRole = self.mockData.roles.find(function(r) { return r.id === self.mockData.users[updateUserIndex].roleId; });
                
                self.addActivity('更新用户 ' + self.mockData.users[updateUserIndex].username);

                return { success: true, data: $.extend({}, self.mockData.users[updateUserIndex], { role: updatedRole }) };
            }

            if (url.match(/\/users\/\d+$/) && method === 'DELETE') {
                var deleteUserId = parseInt(url.split('/').pop());
                var deleteUserIndex = self.mockData.users.findIndex(function(u) { return u.id === deleteUserId; });
                
                if (deleteUserIndex === -1) {
                    return { success: false, error: { message: '用户不存在' } };
                }

                var deletedUser = self.mockData.users[deleteUserIndex];
                var delRole = self.mockData.roles.find(function(r) { return r.id === deletedUser.roleId; });
                if (delRole) {
                    delRole.userCount--;
                }

                self.mockData.users.splice(deleteUserIndex, 1);
                
                self.addActivity('删除用户 ' + deletedUser.username);

                return { success: true, data: { message: '删除成功' } };
            }

            if (url === '/users/batch-delete' && method === 'POST') {
                var idsToDelete = data.ids || [];
                var deletedCount = 0;
                
                idsToDelete.forEach(function(id) {
                    var idx = self.mockData.users.findIndex(function(u) { return u.id === id; });
                    if (idx !== -1) {
                        var u = self.mockData.users[idx];
                        var r = self.mockData.roles.find(function(role) { return role.id === u.roleId; });
                        if (r) r.userCount--;
                        self.mockData.users.splice(idx, 1);
                        deletedCount++;
                    }
                });
                
                return { success: true, data: { deleted: deletedCount } };
            }

            if (url === '/roles' && method === 'GET') {
                return {
                    success: true,
                    data: self.mockData.roles.slice()
                };
            }

            if (url === '/roles' && method === 'POST') {
                var roleExists = self.mockData.roles.find(function(r) {
                    return r.code === data.code || r.name === data.name;
                });
                
                if (roleExists) {
                    return {
                        success: false,
                        error: { message: '角色代码或名称已存在' }
                    };
                }

                var newRole = {
                    id: self.nextRoleId++,
                    name: data.name,
                    code: data.code,
                    description: data.description || '',
                    userCount: 0,
                    status: 'active',
                    permissions: data.permissions || [],
                    createdAt: new Date().toISOString()
                };
                
                self.mockData.roles.push(newRole);
                
                self.addActivity('创建角色 ' + newRole.name);

                return { success: true, data: newRole };
            }

            if (url.match(/\/roles\/\d+$/) && method === 'GET') {
                var roleId = parseInt(url.split('/').pop());
                var foundRole = self.mockData.roles.find(function(r) { return r.id === roleId; });
                
                if (foundRole) {
                    return { success: true, data: foundRole };
                }
                
                return { success: false, error: { message: '角色不存在' } };
            }

            if (url.match(/\/roles\/\d+$/) && method === 'PUT') {
                var updateRoleId = parseInt(url.split('/').pop());
                var updateRoleIndex = self.mockData.roles.findIndex(function(r) { return r.id === updateRoleId; });
                
                if (updateRoleIndex === -1) {
                    return { success: false, error: { message: '角色不存在' } };
                }

                self.mockData.roles[updateRoleIndex] = $.extend(
                    {},
                    self.mockData.roles[updateRoleIndex],
                    data
                );
                
                self.addActivity('更新角色 ' + self.mockData.roles[updateRoleIndex].name);

                return { success: true, data: self.mockData.roles[updateRoleIndex] };
            }

            if (url.match(/\/roles\/\d+$/) && method === 'DELETE') {
                var deleteRoleId = parseInt(url.split('/').pop());
                var deleteRoleIndex = self.mockData.roles.findIndex(function(r) { return r.id === deleteRoleId; });
                
                if (deleteRoleIndex === -1) {
                    return { success: false, error: { message: '角色不存在' } };
                }

                var roleToDelete = self.mockData.roles[deleteRoleIndex];
                var usersWithRole = self.mockData.users.filter(function(u) { return u.roleId === deleteRoleId; });
                
                if (usersWithRole.length > 0) {
                    return {
                        success: false,
                        error: { message: '该角色下还有用户，无法删除' }
                    };
                }

                self.mockData.roles.splice(deleteRoleIndex, 1);
                
                self.addActivity('删除角色 ' + roleToDelete.name);

                return { success: true, data: { message: '删除成功' } };
            }

            if (url === '/permissions' && method === 'GET') {
                return {
                    success: true,
                    data: self.mockData.permissions.slice()
                };
            }

            if (url === '/dashboard/stats' && method === 'GET') {
                return {
                    success: true,
                    data: {
                        totalUsers: self.mockData.users.length,
                        activeUsers: self.mockData.users.filter(function(u) { return u.status === 'active'; }).length,
                        totalRoles: self.mockData.roles.length,
                        pendingRequests: 0
                    }
                };
            }

            if (url === '/dashboard/activities' && method === 'GET') {
                return {
                    success: true,
                    data: self.mockData.activities.slice()
                };
            }

            if (url === '/settings' && method === 'GET') {
                return {
                    success: true,
                    data: Utils.deepClone(self.mockData.settings)
                };
            }

            if (url === '/settings' && method === 'PUT') {
                self.mockData.settings = $.extend({}, self.mockData.settings, data);
                self.addActivity('更新系统设置');
                return {
                    success: true,
                    data: Utils.deepClone(self.mockData.settings)
                };
            }

            return {
                success: false,
                error: { message: 'API接口不存在' }
            };
        },

        /**
         * 根据角色ID获取权限列表
         */
        getPermissionsByRoleId: function(roleId) {
            var role = this.mockData.roles.find(function(r) { return r.id === roleId; });
            if (!role) return [];
            
            return this.mockData.permissions.filter(function(p) {
                return role.permissions.indexOf(p.id) !== -1;
            });
        },

        /**
         * 添加活动记录
         */
        addActivity: function(action) {
            var auth = Utils.getSessionStorage('auth');
            var username = auth && auth.user ? auth.user.username : 'system';
            
            this.mockData.activities.unshift({
                id: this.nextActivityId++,
                action: action,
                user: username,
                time: Utils.formatDate(new Date(), 'YYYY-MM-DD HH:mm:ss'),
                status: 'success'
            });

            if (this.mockData.activities.length > 50) {
                this.mockData.activities = this.mockData.activities.slice(0, 50);
            }
        },

        login: function(data) {
            return this.request({
                url: '/auth/login',
                method: 'POST',
                data: data
            });
        },

        logout: function() {
            return this.request({
                url: '/auth/logout',
                method: 'POST'
            });
        },

        getCurrentUser: function() {
            return this.request({
                url: '/auth/current',
                method: 'GET'
            });
        },

        getUsers: function(params) {
            return this.request({
                url: '/users',
                method: 'GET',
                data: params
            });
        },

        getUser: function(id) {
            return this.request({
                url: '/users/' + id,
                method: 'GET'
            });
        },

        createUser: function(data) {
            return this.request({
                url: '/users',
                method: 'POST',
                data: data
            });
        },

        updateUser: function(id, data) {
            return this.request({
                url: '/users/' + id,
                method: 'PUT',
                data: data
            });
        },

        deleteUser: function(id) {
            return this.request({
                url: '/users/' + id,
                method: 'DELETE'
            });
        },

        batchDeleteUsers: function(ids) {
            return this.request({
                url: '/users/batch-delete',
                method: 'POST',
                data: { ids: ids }
            });
        },

        getRoles: function() {
            return this.request({
                url: '/roles',
                method: 'GET'
            });
        },

        getRole: function(id) {
            return this.request({
                url: '/roles/' + id,
                method: 'GET'
            });
        },

        createRole: function(data) {
            return this.request({
                url: '/roles',
                method: 'POST',
                data: data
            });
        },

        updateRole: function(id, data) {
            return this.request({
                url: '/roles/' + id,
                method: 'PUT',
                data: data
            });
        },

        deleteRole: function(id) {
            return this.request({
                url: '/roles/' + id,
                method: 'DELETE'
            });
        },

        getPermissions: function() {
            return this.request({
                url: '/permissions',
                method: 'GET'
            });
        },

        getDashboardStats: function() {
            return this.request({
                url: '/dashboard/stats',
                method: 'GET'
            });
        },

        getActivities: function() {
            return this.request({
                url: '/dashboard/activities',
                method: 'GET'
            });
        },

        getSettings: function() {
            return this.request({
                url: '/settings',
                method: 'GET'
            });
        },

        updateSettings: function(data) {
            return this.request({
                url: '/settings',
                method: 'PUT',
                data: data
            });
        }
    };

    window.API = API;

})(window, jQuery, Utils);