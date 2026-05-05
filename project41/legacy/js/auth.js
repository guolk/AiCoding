/**
 * 认证模块
 * 处理用户登录、登出、权限检查等
 */
(function(window, $, Utils, API, Validation) {
    'use strict';

    var Auth = {
        currentUser: null,
        token: null,
        permissions: [],

        init: function() {
            var self = this;
            
            var auth = Utils.getSessionStorage('auth');
            if (auth) {
                self.token = auth.token;
                self.currentUser = auth.user;
                self.permissions = auth.user ? auth.user.permissions : [];
            }

            self.bindEvents();
        },

        bindEvents: function() {
            var self = this;

            $('#login-form').on('submit', function(e) {
                e.preventDefault();
                self.handleLogin();
            });

            $('#logout-btn').on('click', function(e) {
                e.preventDefault();
                self.handleLogout();
            });
        },

        handleLogin: function() {
            var self = this;
            var $form = $('#login-form');
            var formData = Validation.getFormData($form);

            var result = Validation.validateForm(formData, Validation.loginSchema);
            
            Validation.clearFormErrors($form);
            
            if (!result.isValid) {
                Validation.showFormErrors($form, result.errors);
                Utils.showToast('表单验证失败，请检查错误信息', 'error');
                return;
            }

            Utils.showLoading();

            API.login(formData)
                .then(function(response) {
                    self.token = response.token;
                    self.currentUser = response.user;
                    self.permissions = response.user.permissions;

                    Utils.setSessionStorage('auth', {
                        token: response.token,
                        user: response.user,
                        timestamp: Date.now()
                    });

                    Utils.hideLoading();
                    Utils.showToast('登录成功，欢迎回来 ' + response.user.username, 'success');
                    
                    App.navigateTo('dashboard');
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '登录失败', 'error');
                });
        },

        handleLogout: function() {
            var self = this;

            Utils.showLoading();

            API.logout()
                .then(function() {
                    self.token = null;
                    self.currentUser = null;
                    self.permissions = [];

                    Utils.removeStorage('auth');
                    Utils.removeSessionStorage('auth');

                    Utils.hideLoading();
                    Utils.showToast('已安全退出', 'success');
                    
                    App.navigateTo('login');
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '登出失败', 'error');
                });
        },

        isAuthenticated: function() {
            return !!this.currentUser && !!this.token;
        },

        getCurrentUser: function() {
            return this.currentUser;
        },

        getToken: function() {
            return this.token;
        },

        hasPermission: function(permissionCode) {
            if (!this.permissions || this.permissions.length === 0) {
                return false;
            }

            return this.permissions.some(function(p) {
                return p.code === permissionCode;
            });
        },

        hasAnyPermission: function(permissionCodes) {
            if (!Array.isArray(permissionCodes)) {
                return this.hasPermission(permissionCodes);
            }

            return permissionCodes.some(function(code) {
                return this.hasPermission(code);
            }.bind(this));
        },

        hasAllPermissions: function(permissionCodes) {
            if (!Array.isArray(permissionCodes)) {
                return this.hasPermission(permissionCodes);
            }

            return permissionCodes.every(function(code) {
                return this.hasPermission(code);
            }.bind(this));
        },

        isAdmin: function() {
            return this.currentUser && 
                   this.currentUser.role && 
                   this.currentUser.role.code === 'admin';
        },

        updateUserInfo: function() {
            $('#current-user').text(this.currentUser ? this.currentUser.username : '');
        },

        checkAuthAndRedirect: function() {
            if (!this.isAuthenticated()) {
                App.navigateTo('login');
                return false;
            }
            return true;
        }
    };

    window.Auth = Auth;

})(window, jQuery, Utils, API, Validation);