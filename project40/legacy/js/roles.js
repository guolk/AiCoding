/**
 * 角色管理模块
 * 处理角色CRUD操作、权限树等
 */
(function(window, $, Utils, API, Validation) {
    'use strict';

    var Roles = {
        state: {
            editingRoleId: null,
            deletingRoleId: null,
            permissions: []
        },

        init: function() {
            var self = this;
            
            self.bindEvents();
            
            $(document).on('pageShown', function(e, page) {
                if (page === 'roles') {
                    self.loadData();
                }
            });
        },

        bindEvents: function() {
            var self = this;

            $('#add-role-btn').on('click', function() {
                self.showRoleForm('add');
            });

            $('#roles-list').on('click', '.edit-role-btn', function(e) {
                e.preventDefault();
                var roleId = parseInt($(this).data('id'));
                self.showRoleForm('edit', roleId);
            });

            $('#roles-list').on('click', '.delete-role-btn', function(e) {
                e.preventDefault();
                var roleId = parseInt($(this).data('id'));
                self.showDeleteConfirm(roleId);
            });

            $('#role-form').on('submit', function(e) {
                e.preventDefault();
                self.handleRoleFormSubmit();
            });

            $('#permissions-tree').on('change', 'input[type="checkbox"]', function() {
                var $checkbox = $(this);
                var permissionId = parseInt($checkbox.val());
                var isChecked = $checkbox.is(':checked');

                self.updatePermissionChildren(permissionId, isChecked);
                self.updatePermissionParent(permissionId);
            });
        },

        loadData: function() {
            var self = this;

            Utils.showLoading();

            Promise.all([
                API.getRoles(),
                API.getPermissions()
            ])
            .then(function(results) {
                var roles = results[0];
                self.state.permissions = results[1];

                self.renderRolesList(roles);

                Utils.hideLoading();
            })
            .catch(function(error) {
                Utils.hideLoading();
                Utils.showToast(error.message || '加载角色数据失败', 'error');
            });
        },

        renderRolesList: function(roles) {
            var self = this;
            var $list = $('#roles-list');
            $list.empty();

            if (!roles || roles.length === 0) {
                $list.append('<tr><td colspan="8" class="text-center">暂无角色数据</td></tr>');
                return;
            }

            roles.forEach(function(role) {
                var statusClass = role.status === 'active' ? 'status-active' : 'status-inactive';
                var statusText = role.status === 'active' ? '激活' : '禁用';
                var createdAt = Utils.formatDate(role.createdAt, 'YYYY-MM-DD');

                var html = '<tr>' +
                    '<td>' + role.id + '</td>' +
                    '<td>' + Utils.escapeHtml(role.name) + '</td>' +
                    '<td>' + Utils.escapeHtml(role.code) + '</td>' +
                    '<td>' + Utils.escapeHtml(role.description || '-') + '</td>' +
                    '<td>' + role.userCount + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td>' + createdAt + '</td>' +
                    '<td class="actions">' +
                        '<button class="btn btn-sm btn-primary edit-role-btn" data-id="' + role.id + '">编辑</button>' +
                        '<button class="btn btn-sm btn-danger delete-role-btn" data-id="' + role.id + '">删除</button>' +
                    '</td>' +
                    '</tr>';

                $list.append(html);
            });
        },

        showRoleForm: function(mode, roleId) {
            var self = this;
            var $modal = $('#role-modal');
            var $form = $('#role-form');
            var $title = $('#role-modal-title');

            self.state.editingRoleId = mode === 'edit' ? roleId : null;

            Validation.clearFormErrors($form);
            Validation.resetForm($form);

            self.renderPermissionsTree();

            if (mode === 'add') {
                $title.text('添加角色');
                Utils.showModal('#role-modal');
            } else {
                $title.text('编辑角色');
                
                Utils.showLoading();
                
                API.getRole(roleId)
                    .then(function(role) {
                        $('#role-id').val(role.id);
                        $('#role-name').val(role.name);
                        $('#role-code').val(role.code);
                        $('#role-description').val(role.description || '');

                        self.setPermissionsSelection(role.permissions || []);

                        Utils.hideLoading();
                        Utils.showModal('#role-modal');
                    })
                    .catch(function(error) {
                        Utils.hideLoading();
                        Utils.showToast(error.message || '加载角色信息失败', 'error');
                    });
            }
        },

        renderPermissionsTree: function() {
            var self = this;
            var $tree = $('#permissions-tree');
            $tree.empty();

            var permissions = self.state.permissions;
            if (!permissions || permissions.length === 0) {
                $tree.append('<p class="text-muted">暂无权限数据</p>');
                return;
            }

            var grouped = self.groupPermissionsByParent(permissions);
            self.renderPermissionGroup($tree, grouped, null, 0);
        },

        groupPermissionsByParent: function(permissions) {
            var grouped = {};
            permissions.forEach(function(p) {
                var parentId = p.parentId || 0;
                if (!grouped[parentId]) {
                    grouped[parentId] = [];
                }
                grouped[parentId].push(p);
            });
            return grouped;
        },

        renderPermissionGroup: function($container, grouped, parentId, level) {
            var self = this;
            var permissions = grouped[parentId] || [];

            if (permissions.length === 0) return;

            var $group = level === 0 ? $container : $('<div class="permission-children"></div>');

            permissions.forEach(function(p) {
                var $item = $('<div class="permission-item"></div>');
                var $checkbox = $('<input type="checkbox" value="' + p.id + '" id="perm-' + p.id + '">');
                var $label = $('<label for="perm-' + p.id + '">' + Utils.escapeHtml(p.name) + ' (' + Utils.escapeHtml(p.code) + ')</label>');
                
                $item.append($checkbox);
                $item.append($label);
                
                self.renderPermissionGroup($item, grouped, p.id, level + 1);
                $group.append($item);
            });

            if (level > 0) {
                $container.append($group);
            }
        },

        setPermissionsSelection: function(permissionIds) {
            var self = this;
            var $tree = $('#permissions-tree');
            
            $tree.find('input[type="checkbox"]').prop('checked', false);
            
            permissionIds.forEach(function(id) {
                $tree.find('input[value="' + id + '"]').prop('checked', true);
            });
        },

        getSelectedPermissions: function() {
            var $tree = $('#permissions-tree');
            var selected = [];
            
            $tree.find('input[type="checkbox"]:checked').each(function() {
                selected.push(parseInt($(this).val()));
            });
            
            return selected;
        },

        updatePermissionChildren: function(permissionId, isChecked) {
            var $checkbox = $('#permissions-tree input[value="' + permissionId + '"]');
            var $item = $checkbox.closest('.permission-item');
            var $children = $item.find('.permission-children input[type="checkbox"]');
            
            $children.prop('checked', isChecked);
        },

        updatePermissionParent: function(permissionId) {
            var self = this;
            var permission = self.state.permissions.find(function(p) { return p.id === permissionId; });
            if (!permission || !permission.parentId) return;

            var $parentCheckbox = $('#permissions-tree input[value="' + permission.parentId + '"]');
            var $parentItem = $parentCheckbox.closest('.permission-item');
            var $children = $parentItem.find('> .permission-children input[type="checkbox"]');
            var $checkedChildren = $children.filter(':checked');
            
            $parentCheckbox.prop('checked', $checkedChildren.length === $children.length);

            self.updatePermissionParent(permission.parentId);
        },

        handleRoleFormSubmit: function() {
            var self = this;
            var $form = $('#role-form');
            var formData = Validation.getFormData($form);

            formData.permissions = self.getSelectedPermissions();

            var result = Validation.validateForm(formData, Validation.roleSchema);
            
            Validation.clearFormErrors($form);
            
            if (!result.isValid) {
                Validation.showFormErrors($form, result.errors);
                Utils.showToast('表单验证失败，请检查错误信息', 'error');
                return;
            }

            Utils.showLoading();
            Utils.hideModal('#role-modal');

            var promise;
            if (self.state.editingRoleId) {
                promise = API.updateRole(self.state.editingRoleId, formData);
            } else {
                promise = API.createRole(formData);
            }

            promise
                .then(function() {
                    Utils.hideLoading();
                    Utils.showToast(self.state.editingRoleId ? '角色更新成功' : '角色创建成功', 'success');
                    self.loadData();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '操作失败', 'error');
                });
        },

        showDeleteConfirm: function(roleId) {
            var self = this;
            self.state.deletingRoleId = roleId;
            $('#delete-message').text('确定要删除该角色吗？如果角色下有用户将无法删除。');
            Utils.showModal('#delete-modal');
        },

        refresh: function() {
            this.loadData();
        }
    };

    window.Roles = Roles;

})(window, jQuery, Utils, API, Validation);