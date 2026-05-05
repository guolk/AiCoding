/**
 * 权限管理模块
 * 处理权限列表显示等
 */
(function(window, $, Utils, API) {
    'use strict';

    var Permissions = {
        init: function() {
            var self = this;
            
            self.bindEvents();
            
            $(document).on('pageShown', function(e, page) {
                if (page === 'permissions') {
                    self.loadData();
                }
            });
        },

        bindEvents: function() {
            // 权限管理事件绑定
        },

        loadData: function() {
            var self = this;

            Utils.showLoading();

            API.getPermissions()
                .then(function(permissions) {
                    self.renderPermissionsList(permissions);
                    Utils.hideLoading();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '加载权限数据失败', 'error');
                });
        },

        renderPermissionsList: function(permissions) {
            var self = this;
            var $list = $('#permissions-list');
            $list.empty();

            if (!permissions || permissions.length === 0) {
                $list.append('<tr><td colspan="7" class="text-center">暂无权限数据</td></tr>');
                return;
            }

            var permissionMap = {};
            permissions.forEach(function(p) {
                permissionMap[p.id] = p;
            });

            permissions.forEach(function(permission) {
                var statusClass = permission.status === 'active' ? 'status-active' : 'status-inactive';
                var statusText = permission.status === 'active' ? '激活' : '禁用';
                var parentName = permission.parentId ? 
                    (permissionMap[permission.parentId] ? permissionMap[permission.parentId].name : '-') : '-';

                var typeLabel = permission.type === 'menu' ? '菜单' : '操作';

                var html = '<tr>' +
                    '<td>' + permission.id + '</td>' +
                    '<td>' + Utils.escapeHtml(permission.name) + '</td>' +
                    '<td>' + Utils.escapeHtml(permission.code) + '</td>' +
                    '<td>' + typeLabel + '</td>' +
                    '<td>' + Utils.escapeHtml(parentName) + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td class="actions">' +
                        '<button class="btn btn-sm btn-primary" data-id="' + permission.id + '">编辑</button>' +
                    '</td>' +
                    '</tr>';

                $list.append(html);
            });
        },

        refresh: function() {
            this.loadData();
        }
    };

    window.Permissions = Permissions;

})(window, jQuery, Utils, API);