/**
 * 主应用模块
 * 处理页面导航、模块初始化等
 */
(function(window, $, Utils, Auth, Dashboard, Users, Roles, Permissions, Settings) {
    'use strict';

    var App = {
        currentPage: 'login',

        pages: ['login', 'dashboard', 'users', 'roles', 'permissions', 'settings'],

        privatePages: ['dashboard', 'users', 'roles', 'permissions', 'settings'],

        init: function() {
            var self = this;

            Auth.init();
            Dashboard.init();
            Users.init();
            Roles.init();
            Permissions.init();
            Settings.init();

            self.bindEvents();
            self.checkInitialRoute();
        },

        bindEvents: function() {
            var self = this;

            $('#nav a[data-page]').on('click', function(e) {
                e.preventDefault();
                var page = $(this).data('page');
                self.navigateTo(page);
            });

            $(window).on('hashchange', function() {
                var hash = window.location.hash.slice(1);
                if (hash && self.pages.indexOf(hash) !== -1) {
                    self.navigateTo(hash, false);
                }
            });
        },

        checkInitialRoute: function() {
            var self = this;
            var hash = window.location.hash.slice(1);

            if (Auth.isAuthenticated()) {
                Auth.updateUserInfo();
                $('#user-info').show();
                $('#nav').show();

                if (hash && self.pages.indexOf(hash) !== -1 && hash !== 'login') {
                    self.navigateTo(hash, false);
                } else {
                    self.navigateTo('dashboard', false);
                }
            } else {
                $('#user-info').hide();
                $('#nav').hide();
                self.navigateTo('login', false);
            }
        },

        navigateTo: function(page, updateHash) {
            var self = this;

            if (updateHash !== false) {
                window.location.hash = page;
                return;
            }

            if (self.privatePages.indexOf(page) !== -1 && !Auth.isAuthenticated()) {
                self.navigateTo('login');
                return;
            }

            self.hideAllPages();

            $('#' + page + '-page').removeClass('hidden');

            self.updateNavigation(page);

            self.currentPage = page;

            $(document).trigger('pageShown', [page]);

            Utils.hideAllModals();
        },

        hideAllPages: function() {
            var self = this;
            self.pages.forEach(function(page) {
                $('#' + page + '-page').addClass('hidden');
            });
        },

        updateNavigation: function(page) {
            $('#nav a[data-page]').removeClass('active');
            $('#nav a[data-page="' + page + '"]').addClass('active');

            var titleMap = {
                'login': '登录',
                'dashboard': '仪表盘',
                'users': '用户管理',
                'roles': '角色管理',
                'permissions': '权限管理',
                'settings': '系统设置'
            };

            document.title = (titleMap[page] || page) + ' - 用户管理系统';
        },

        getCurrentPage: function() {
            return this.currentPage;
        },

        refresh: function() {
            var self = this;

            switch (self.currentPage) {
                case 'dashboard':
                    Dashboard.refresh();
                    break;
                case 'users':
                    Users.refresh();
                    break;
                case 'roles':
                    Roles.refresh();
                    break;
                case 'permissions':
                    Permissions.refresh();
                    break;
                case 'settings':
                    Settings.refresh();
                    break;
            }
        }
    };

    window.App = App;

    $(document).ready(function() {
        App.init();
    });

})(window, jQuery, Utils, Auth, Dashboard, Users, Roles, Permissions, Settings);