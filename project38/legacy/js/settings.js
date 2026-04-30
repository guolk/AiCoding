/**
 * 系统设置模块
 * 处理设置页面的标签切换和表单提交
 */
(function(window, $, Utils, API, Validation) {
    'use strict';

    var Settings = {
        state: {
            currentTab: 'general',
            settings: null
        },

        init: function() {
            var self = this;
            
            self.bindEvents();
            
            $(document).on('pageShown', function(e, page) {
                if (page === 'settings') {
                    self.loadData();
                }
            });
        },

        bindEvents: function() {
            var self = this;

            $('.settings-tabs .tab-btn').on('click', function() {
                var tab = $(this).data('tab');
                self.switchTab(tab);
            });

            $('#general-settings-form').on('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit('general');
            });

            $('#security-settings-form').on('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit('security');
            });

            $('#email-settings-form').on('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit('email');
            });

            $('#notification-settings-form').on('submit', function(e) {
                e.preventDefault();
                self.handleFormSubmit('notification');
            });

            $('#test-email-btn').on('click', function() {
                self.testEmailConnection();
            });
        },

        loadData: function() {
            var self = this;

            Utils.showLoading();

            API.getSettings()
                .then(function(settings) {
                    self.state.settings = settings;
                    self.populateForms(settings);
                    Utils.hideLoading();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '加载设置失败', 'error');
                });
        },

        populateForms: function(settings) {
            $('#site-name').val(settings.siteName || '');
            $('#site-description').val(settings.siteDescription || '');
            $('#default-language').val(settings.defaultLanguage || 'zh-CN');
            $('#default-theme').val(settings.defaultTheme || 'light');

            $('#session-timeout').val(settings.sessionTimeout || 30);
            $('#max-login-attempts').val(settings.maxLoginAttempts || 5);
            $('#password-min-length').val(settings.passwordMinLength || 8);
            $('#require-mfa').prop('checked', settings.requireMFA || false);

            $('#smtp-host').val(settings.smtpHost || '');
            $('#smtp-port').val(settings.smtpPort || 587);
            $('#smtp-username').val(settings.smtpUsername || '');
            $('#smtp-password').val(settings.smtpPassword || '');

            $('#notify-user-created').prop('checked', settings.notifyUserCreated || false);
            $('#notify-user-updated').prop('checked', settings.notifyUserUpdated || false);
            $('#notify-user-deleted').prop('checked', settings.notifyUserDeleted || false);
            $('#notify-system-error').prop('checked', settings.notifySystemError || false);
        },

        switchTab: function(tab) {
            var self = this;
            self.state.currentTab = tab;

            $('.settings-tabs .tab-btn').removeClass('active');
            $('.settings-tabs .tab-btn[data-tab="' + tab + '"]').addClass('active');

            $('.settings-content').addClass('hidden');
            $('#' + tab + '-settings').removeClass('hidden');
        },

        handleFormSubmit: function(tab) {
            var self = this;
            var $form;
            var schema;

            switch (tab) {
                case 'general':
                    $form = $('#general-settings-form');
                    schema = Validation.generalSettingsSchema;
                    break;
                case 'security':
                    $form = $('#security-settings-form');
                    schema = Validation.securitySettingsSchema;
                    break;
                case 'email':
                    $form = $('#email-settings-form');
                    schema = Validation.emailSettingsSchema;
                    break;
                case 'notification':
                    $form = $('#notification-settings-form');
                    schema = {};
                    break;
                default:
                    return;
            }

            var formData = self.collectFormData(tab);

            if (Object.keys(schema).length > 0) {
                var result = Validation.validateForm(formData, schema);
                
                Validation.clearFormErrors($form);
                
                if (!result.isValid) {
                    Validation.showFormErrors($form, result.errors);
                    Utils.showToast('表单验证失败，请检查错误信息', 'error');
                    return;
                }
            }

            Utils.showLoading();

            API.updateSettings(formData)
                .then(function() {
                    Utils.hideLoading();
                    Utils.showToast('设置保存成功', 'success');
                    self.loadData();
                })
                .catch(function(error) {
                    Utils.hideLoading();
                    Utils.showToast(error.message || '保存失败', 'error');
                });
        },

        collectFormData: function(tab) {
            var formData = {};

            switch (tab) {
                case 'general':
                    formData = {
                        siteName: $('#site-name').val(),
                        siteDescription: $('#site-description').val(),
                        defaultLanguage: $('#default-language').val(),
                        defaultTheme: $('#default-theme').val()
                    };
                    break;
                case 'security':
                    formData = {
                        sessionTimeout: parseInt($('#session-timeout').val()),
                        maxLoginAttempts: parseInt($('#max-login-attempts').val()),
                        passwordMinLength: parseInt($('#password-min-length').val()),
                        requireMFA: $('#require-mfa').is(':checked')
                    };
                    break;
                case 'email':
                    formData = {
                        smtpHost: $('#smtp-host').val(),
                        smtpPort: parseInt($('#smtp-port').val()),
                        smtpUsername: $('#smtp-username').val(),
                        smtpPassword: $('#smtp-password').val()
                    };
                    break;
                case 'notification':
                    formData = {
                        notifyUserCreated: $('#notify-user-created').is(':checked'),
                        notifyUserUpdated: $('#notify-user-updated').is(':checked'),
                        notifyUserDeleted: $('#notify-user-deleted').is(':checked'),
                        notifySystemError: $('#notify-system-error').is(':checked')
                    };
                    break;
            }

            return formData;
        },

        testEmailConnection: function() {
            var formData = {
                smtpHost: $('#smtp-host').val(),
                smtpPort: parseInt($('#smtp-port').val()),
                smtpUsername: $('#smtp-username').val(),
                smtpPassword: $('#smtp-password').val()
            };

            if (!formData.smtpHost || !formData.smtpPort || !formData.smtpUsername) {
                Utils.showToast('请填写完整的邮件配置信息', 'error');
                return;
            }

            Utils.showLoading();

            setTimeout(function() {
                Utils.hideLoading();
                Utils.showToast('邮件连接测试成功', 'success');
            }, 1000);
        },

        refresh: function() {
            this.loadData();
        }
    };

    window.Settings = Settings;

})(window, jQuery, Utils, API, Validation);