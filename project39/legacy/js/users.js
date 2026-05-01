/**
 * 用户管理模块
 * 处理用户CRUD操作、搜索、分页等
 */
(function(window, $, Utils, API, Validation, Auth) {
    'use strict';

    var Users = {
        state: {
            currentPage: 1,
            pageSize: 10,
            searchKeyword: '',
            statusFilter: '',
            roleFilter: '',
            selectedIds: [],
            editingUserId: null,
            deletingUserId: null
        },

        roles: [],

        init: function() {
            var self = this;
            
            self.bindEvents();
            
            $(document).on('pageShown', function(e, page) {
                if (page === 'users') {
                    self.loadData();
                }
            });
        },

        bindEvents: function() {
            var self = this;

            $('#add-user-btn').on('click', function() {
                self.showUserForm('add');
            });

            $('#user-search').on('input', Utils.debounce(function() {
                self.state.searchKeyword = $(this).val();
                self.state.currentPage = 1;
                self.loadData();
            }, 300));

            $('#user-status-filter').on('change', function() {
                self.state.statusFilter = $(this).val();
                self.state.currentPage = 1;
                self.loadData();
            });

            $('#user-role-filter').on('change', function() {
                self.state.roleFilter = $(this).val();
                self.state.currentPage = 1;
                self.loadData();
            });

            $('#select-all-users').on('change', function() {
                var isChecked = $(this).is(':checked');
                $('#users-list input[name="user-checkbox"]').prop('checked', isChecked);
                
                if (isChecked) {
                    self.state.selectedIds = $('#users-list input[name="user-checkbox"]:checked')
                        .map(function() { return parseInt($(this).val()); }).get();
                } else {
                    self.state.selectedIds = [];
                }
            });

            $('#users-list').on('change', 'input[name="user-checkbox"]', function() {
                var userId = parseInt($(this).val());
                
                if ($(this).is(':checked')) {
                    if (self.state.selectedIds.indexOf(userId) === -1) {
                        self.state.selectedIds.push(userId);
                    }
                } else {
                    self.state.selectedIds = self.state.selectedIds.filter(function(id) {
                        return id !== userId;
                    });
                }

                var allChecked = $('#users-list input[name="user-checkbox"]:checked').length === 
                                 $('#users-list input[name="user-checkbox"]').length;
                $('#select-all-users').prop('checked', allChecked);
            });

            $('#users-list').on('click', '.edit-user-btn', function(e) {
                e.preventDefault();
                var userId = parseInt($(this).data('id'));
                self.showUserForm('edit', userId);
            });

            $('#users-list').on('click', '.delete-user-btn', function(e) {
                e.preventDefault();
                var userId = parseInt($(this).data('id'));
                self.showDeleteConfirm(userId);
            });

            $('#user-form').on('submit', function(e) {
                e.preventDefault();
                self.handleUserFormSubmit();
            });

            $('.modal-close, .modal-cancel').on('click', function() {
                Utils.hideAllModals();
            });

            $('.modal').on('click', function(e) {
                if ($(e.target).is(this)) {
                    Utils.hideAllModals();
                }
            });

            $('#confirm-delete-btn').on('click', function() {
                self.handleDelete();
            });

            $('#user-password').on('input', function() {
                var password = $(this).val();
                if (!self.state.editingUserId && password) {
                    var strength = Utils.checkPasswordStrength(password);
                    if (!strength.isValid) {
                        Validation.showFieldError($(this), [strength.label]);
                    } else {
                        Validation.clearFieldError($(this));
                    }
                }
            });
        },

        loadData: function() {
            var self = this;

            Utils.showLoading();

            Promise.all([
                API.getRoles(),
                API.getUsers({
                    page: self.state.currentPage,
                    pageSize: self.state.pageSize,
                    search: self.state.searchKeyword,
                    status: self.state.statusFilter,
                    roleId: self.state.roleFilter
                })
            ])
            .then(function(results) {
                self.roles = results[0];
                var response = results[1];

                self.renderRoleFilters();
                self.renderRoleSelect();
                self.renderUsersList(response.items);
                self.renderPagination(response);

                Utils.hideLoading();
            })
            .catch(function(error) {
                Utils.hideLoading();
                Utils.showToast(error.message || '加载用户数据失败', 'error');
            });
        },

        renderRoleFilters: function() {
            var self = this;
            var $select = $('#user-role-filter');
            var currentValue = $select.val();
            
            $select.html('<option value="">全部角色</option>');
            
            self.roles.forEach(function(role) {
                $select.append('<option value="' + role.id + '">' + Utils.escapeHtml(role.name) + '</option>');
            });

            if (currentValue) {
                $select.val(currentValue);
            }
        },

        renderRoleSelect: function() {
            var self = this;
            var $select = $('#user-role');
            var currentValue = $select.val();
            
            $select.html('<option value="">请选择角色</option>');
            
            self.roles.forEach(function(role) {
                $select.append('<option value="' + role.id + '">' + Utils.escapeHtml(role.name) + '</option>');
            });

            if (currentValue) {
                $select.val(currentValue);
            }
        },

        renderUsersList: function(users) {
            var self = this;
            var $list = $('#users-list');
            $list.empty();

            if (!users || users.length === 0) {
                $list.append('<tr><td colspan="8" class="text-center">暂无用户数据</td></tr>');
                return;
            }

            users.forEach(function(user) {
                var statusClass = user.status === 'active' ? 'status-active' : 
                                 user.status === 'pending' ? 'status-pending' : 'status-inactive';
                var statusText = user.status === 'active' ? '激活' : 
                                user.status === 'pending' ? '待审核' : '禁用';

                var roleName = user.role ? user.role.name : '-';
                var createdAt = Utils.formatDate(user.createdAt, 'YYYY-MM-DD');

                var isChecked = self.state.selectedIds.indexOf(user.id) !== -1;

                var html = '<tr>' +
                    '<td><input type="checkbox" name="user-checkbox" value="' + user.id + '" ' + (isChecked ? 'checked' : '') + '></td>' +
                    '<td>' + user.id + '</td>' +
                    '<td>' + Utils.escapeHtml(user.username) + '</td>' +
                    '<td>' + Utils.escapeHtml(user.email) + '</td>' +
                    '<td>' + Utils.escapeHtml(roleName) + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '<td>' + createdAt + '</td>' +
                    '<td class="actions">' +
                        '<button class="btn btn-sm btn-primary edit-user-btn" data-id="' + user.id + '">编辑</button>' +
                        '<button class="btn btn-sm btn-danger delete-user-btn" data-id="' + user.id + '">删除</button>' +
                    '</td>' +
                    '</tr>';

                $list.append(html);
            });

            var allChecked = $('#users-list input[name="user-checkbox"]:checked').length === 
                            $('#users-list input[name="user-checkbox"]').length &&
                            $('#users-list input[name="user-checkbox"]').length > 0;
            $('#select-all-users').prop('checked', allChecked);
        },

        renderPagination: function(pagination) {
            var self = this;
            var $pagination = $('#users-pagination');
            $pagination.empty();

            var totalPages = pagination.totalPages;
            var currentPage = pagination.page;

            if (totalPages <= 1) {
                return;
            }

            var prevDisabled = currentPage <= 1;
            $pagination.append('<span class="' + (prevDisabled ? 'disabled' : '') + '" data-page="' + (currentPage - 1) + '">上一页</span>');

            var startPage = Math.max(1, currentPage - 2);
            var endPage = Math.min(totalPages, currentPage + 2);

            if (startPage > 1) {
                $pagination.append('<a href="#" data-page="1">1</a>');
                if (startPage > 2) {
                    $pagination.append('<span>...</span>');
                }
            }

            for (var i = startPage; i <= endPage; i++) {
                if (i === currentPage) {
                    $pagination.append('<span class="active">' + i + '</span>');
                } else {
                    $pagination.append('<a href="#" data-page="' + i + '">' + i + '</a>');
                }
            }

            if (endPage < totalPages) {
                if (endPage < totalPages - 1) {
                    $pagination.append('<span>...</span>');
                }
                $pagination.append('<a href="#" data-page="' + totalPages + '">' + totalPages + '</a>');
            }

            var nextDisabled = currentPage >= totalPages;
            $pagination.append('<span class="' + (nextDisabled ? 'disabled' : '') + '" data-page="' + (currentPage + 1) + '">下一页</span>');

            $pagination.find('a').on('click', function(e) {
                e.preventDefault();
                var page = parseInt($(this).data('page'));
                self.state.currentPage = page;
                self.loadData();
            });

            $pagination.find('span:not(.active):not(.disabled)').on('click', function() {
                var page = parseInt($(this).data('page'));
                if (page >= 1 && page <= totalPages) {
                    self.state.currentPage = page;
                    self.loadData();
                }
            });
        },

        showUserForm: function(mode, userId) {
            var self = this;
            var $modal = $('#user-modal');
            var $form = $('#user-form');
            var $title = $('#user-modal-title');

            self.state.editingUserId = mode === 'edit' ? userId : null;

            Validation.clearFormErrors($form);
            Validation.resetForm($form);

            if (mode === 'add') {
                $title.text('添加用户');
                $('#user-password').attr('required', 'required');
                $('#user-confirm-password').attr('required', 'required');
                Utils.showModal('#user-modal');
            } else {
                $title.text('编辑用户');
                
                Utils.showLoading();
                
                API.getUser(userId)
                    .then(function(user) {
                        $('#user-id').val(user.id);
                        $('#user-username').val(user.username);
                        $('#user-email').val(user.email);
                        $('#user-role').val(user.roleId);
                        $('#user-status').val(user.status);
                        $('#user-phone').val(user.phone || '');
                        $('#user-address').val(user.address || '');

                        $('#user-password').removeAttr('required');
                        $('#user-confirm-password').removeAttr('required');

                        Utils.hideLoading();
                        Utils.showModal('#user-modal');
                    })
                    .catch(function(error) {
                        Utils.hideLoading();
                        Utils.showToast(error.message || '加载用户信息失败', 'error');
                    });
            }
        },

        handleUserFormSubmit: function() {
            var self = this;
            var $form = $('#user-form');
            var formData = Validation.getFormData($form);

            var schema = $.extend(true, {}, Validation.userSchema);
            
            if (self.state.editingUserId) {
                delete schema.password;
                delete schema.confirmPassword;
            }

            var result = Validation.validateForm(formData, schema);
            
            Validation.clearFormErrors($form);
            
            if (!result.isValid) {
                Validation.showFormErrors($form, result.errors);
                Utils.showToast('表单验证失败，请检查错误信息', 'error');
                return;
            }

            Utils.showLoading();
            Utils.hideModal('#user-modal');

            var promise;
            if (self.state.editingUserId) {
                delete formData.password;
                delete formData.confirmPassword;
                promise = API.updateUser(self.state.editingUserId, formData);
            } else {
                promise = API.createUser(formData);
            }

            promise
                .then(function() {
                    Utils.hideLoading();
                    Utils.showToast(self.state.editingUserId ? '用户更新成功' : '用户创建成功', 'success');
                    self.loadData();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '操作失败', 'error');
                });
        },

        showDeleteConfirm: function(userId) {
            var self = this;
            self.state.deletingUserId = userId;
            $('#delete-message').text('确定要删除该用户吗？此操作无法撤销。');
            Utils.showModal('#delete-modal');
        },

        handleDelete: function() {
            var self = this;
            var userId = self.state.deletingUserId;

            if (!userId) return;

            Utils.showLoading();
            Utils.hideModal('#delete-modal');

            API.deleteUser(userId)
                .then(function() {
                    Utils.hideLoading();
                    Utils.showToast('用户删除成功', 'success');
                    self.state.deletingUserId = null;
                    self.loadData();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '删除失败', 'error');
                });
        },

        refresh: function() {
            this.state.currentPage = 1;
            this.state.selectedIds = [];
            this.loadData();
        }
    };

    window.Users = Users;

})(window, jQuery, Utils, API, Validation, Auth);