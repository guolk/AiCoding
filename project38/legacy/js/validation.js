/**
 * 表单验证模块
 * 提供完整的表单验证功能
 */
(function(window, $, Utils) {
    'use strict';

    var Validation = {
        /**
         * 默认验证规则
         */
        rules: {
            required: {
                validate: function(value) {
                    if (Array.isArray(value)) {
                        return value.length > 0;
                    }
                    if (typeof value === 'string') {
                        return value.trim().length > 0;
                    }
                    return value !== undefined && value !== null;
                },
                message: '此字段为必填项'
            },
            email: {
                validate: function(value) {
                    if (!value) return true;
                    return Utils.isValidEmail(value);
                },
                message: '请输入有效的邮箱地址'
            },
            phone: {
                validate: function(value) {
                    if (!value) return true;
                    return Utils.isValidPhone(value);
                },
                message: '请输入有效的手机号码'
            },
            url: {
                validate: function(value) {
                    if (!value) return true;
                    return Utils.isValidUrl(value);
                },
                message: '请输入有效的URL地址'
            },
            minLength: {
                validate: function(value, params) {
                    if (!value) return true;
                    return value.length >= params.min;
                },
                message: function(params) {
                    return '长度至少需要' + params.min + '个字符';
                }
            },
            maxLength: {
                validate: function(value, params) {
                    if (!value) return true;
                    return value.length <= params.max;
                },
                message: function(params) {
                    return '长度不能超过' + params.max + '个字符';
                }
            },
            min: {
                validate: function(value, params) {
                    if (value === undefined || value === null || value === '') return true;
                    return Number(value) >= params.min;
                },
                message: function(params) {
                    return '值不能小于' + params.min;
                }
            },
            max: {
                validate: function(value, params) {
                    if (value === undefined || value === null || value === '') return true;
                    return Number(value) <= params.max;
                },
                message: function(params) {
                    return '值不能大于' + params.max;
                }
            },
            pattern: {
                validate: function(value, params) {
                    if (!value) return true;
                    var regex = params.pattern instanceof RegExp ? params.pattern : new RegExp(params.pattern);
                    return regex.test(value);
                },
                message: function(params) {
                    return params.message || '格式不正确';
                }
            },
            match: {
                validate: function(value, params, formData) {
                    return value === formData[params.field];
                },
                message: function(params) {
                    return '与' + params.label + '不一致';
                }
            },
            number: {
                validate: function(value) {
                    if (value === undefined || value === null || value === '') return true;
                    return !isNaN(Number(value));
                },
                message: '请输入有效的数字'
            },
            integer: {
                validate: function(value) {
                    if (value === undefined || value === null || value === '') return true;
                    return /^-?\d+$/.test(value);
                },
                message: '请输入整数'
            },
            idCard: {
                validate: function(value) {
                    if (!value) return true;
                    return Utils.isValidIdCard(value);
                },
                message: '请输入有效的身份证号码'
            }
        },

        /**
         * 验证单个字段
         * @param {string} value - 字段值
         * @param {Object} rules - 验证规则
         * @param {Object} formData - 整个表单数据（用于依赖验证）
         * @returns {Object} 验证结果
         */
        validateField: function(value, rules, formData) {
            var result = {
                isValid: true,
                errors: []
            };

            if (!rules) return result;

            for (var ruleName in rules) {
                if (rules.hasOwnProperty(ruleName)) {
                    var rule = rules[ruleName];
                    var validator = this.rules[ruleName];

                    if (validator) {
                        var params = typeof rule === 'object' ? rule : {};
                        var isValid = validator.validate(value, params, formData);

                        if (!isValid) {
                            result.isValid = false;
                            var message = typeof validator.message === 'function' 
                                ? validator.message(params) 
                                : validator.message;
                            result.errors.push(params.message || message);
                        }
                    }
                }
            }

            return result;
        },

        /**
         * 验证整个表单
         * @param {Object} formData - 表单数据
         * @param {Object} schema - 验证规则schema
         * @returns {Object} 验证结果
         */
        validateForm: function(formData, schema) {
            var result = {
                isValid: true,
                errors: {}
            };

            for (var fieldName in schema) {
                if (schema.hasOwnProperty(fieldName)) {
                    var value = formData[fieldName];
                    var rules = schema[fieldName];
                    var fieldResult = this.validateField(value, rules, formData);

                    if (!fieldResult.isValid) {
                        result.isValid = false;
                        result.errors[fieldName] = fieldResult.errors;
                    }
                }
            }

            return result;
        },

        /**
         * 显示字段错误
         * @param {jQuery} $field - 字段元素
         * @param {string[]} errors - 错误信息数组
         */
        showFieldError: function($field, errors) {
            var $formGroup = $field.closest('.form-group');
            var $errorMsg = $formGroup.find('.error-message[data-field="' + $field.attr('name') + '"]');

            $formGroup.addClass('has-error');
            $field.addClass('error').removeClass('success');
            
            if ($errorMsg.length) {
                $errorMsg.text(errors[0] || '验证失败').show();
            }
        },

        /**
         * 清除字段错误
         * @param {jQuery} $field - 字段元素
         */
        clearFieldError: function($field) {
            var $formGroup = $field.closest('.form-group');
            var $errorMsg = $formGroup.find('.error-message[data-field="' + $field.attr('name') + '"]');

            $formGroup.removeClass('has-error');
            $field.removeClass('error').addClass('success');
            
            if ($errorMsg.length) {
                $errorMsg.text('').hide();
            }
        },

        /**
         * 显示表单所有错误
         * @param {jQuery} $form - 表单元素
         * @param {Object} errors - 错误对象
         */
        showFormErrors: function($form, errors) {
            var self = this;
            
            for (var fieldName in errors) {
                if (errors.hasOwnProperty(fieldName)) {
                    var $field = $form.find('[name="' + fieldName + '"]');
                    if ($field.length) {
                        self.showFieldError($field, errors[fieldName]);
                    }
                }
            }
        },

        /**
         * 清除表单所有错误
         * @param {jQuery} $form - 表单元素
         */
        clearFormErrors: function($form) {
            $form.find('.form-group').removeClass('has-error');
            $form.find('input, select, textarea').removeClass('error').removeClass('success');
            $form.find('.error-message').text('').hide();
        },

        /**
         * 获取表单数据
         * @param {jQuery} $form - 表单元素
         * @returns {Object} 表单数据对象
         */
        getFormData: function($form) {
            var formData = {};
            var serializeArray = $form.serializeArray();

            serializeArray.forEach(function(item) {
                if (formData[item.name] !== undefined) {
                    if (!Array.isArray(formData[item.name])) {
                        formData[item.name] = [formData[item.name]];
                    }
                    formData[item.name].push(item.value);
                } else {
                    formData[item.name] = item.value;
                }
            });

            $form.find('input[type="checkbox"]:not(:checked)').each(function() {
                if (formData[$(this).attr('name')] === undefined) {
                    formData[$(this).attr('name')] = false;
                }
            });

            return formData;
        },

        /**
         * 设置表单数据
         * @param {jQuery} $form - 表单元素
         * @param {Object} data - 数据对象
         */
        setFormData: function($form, data) {
            for (var key in data) {
                if (data.hasOwnProperty(key)) {
                    var $field = $form.find('[name="' + key + '"]');
                    
                    if ($field.is(':checkbox')) {
                        $field.prop('checked', !!data[key]);
                    } else if ($field.is(':radio')) {
                        $field.filter('[value="' + data[key] + '"]').prop('checked', true);
                    } else if ($field.is('select') || $field.is('input') || $field.is('textarea')) {
                        $field.val(data[key]);
                    }
                }
            }
        },

        /**
         * 重置表单
         * @param {jQuery} $form - 表单元素
         */
        resetForm: function($form) {
            $form[0].reset();
            this.clearFormErrors($form);
        },

        /**
         * 初始化表单验证
         * @param {string|jQuery} selector - 表单选择器
         * @param {Object} options - 选项
         */
        init: function(selector, options) {
            var self = this;
            var $form = $(selector);

            options = $.extend({
                schema: {},
                onSubmit: null,
                validateOnBlur: true,
                validateOnInput: false
            }, options);

            if (options.validateOnBlur) {
                $form.on('blur', 'input, select, textarea', function() {
                    var $field = $(this);
                    var fieldName = $field.attr('name');
                    var rules = options.schema[fieldName];

                    if (rules) {
                        var formData = self.getFormData($form);
                        var result = self.validateField(formData[fieldName], rules, formData);

                        if (result.isValid) {
                            self.clearFieldError($field);
                        } else {
                            self.showFieldError($field, result.errors);
                        }
                    }
                });
            }

            if (options.validateOnInput) {
                $form.on('input', 'input, select, textarea', function() {
                    var $field = $(this);
                    var fieldName = $field.attr('name');
                    var rules = options.schema[fieldName];

                    if (rules) {
                        var formData = self.getFormData($form);
                        var result = self.validateField(formData[fieldName], rules, formData);

                        if (result.isValid) {
                            self.clearFieldError($field);
                        } else {
                            self.showFieldError($field, result.errors);
                        }
                    }
                });
            }

            $form.on('submit', function(e) {
                e.preventDefault();

                var formData = self.getFormData($form);
                var result = self.validateForm(formData, options.schema);

                self.clearFormErrors($form);

                if (!result.isValid) {
                    self.showFormErrors($form, result.errors);
                    Utils.showToast('表单验证失败，请检查错误信息', 'error');
                    return;
                }

                if (options.onSubmit) {
                    options.onSubmit(formData, $form);
                }
            });

            return {
                validate: function() {
                    var formData = self.getFormData($form);
                    var result = self.validateForm(formData, options.schema);
                    self.clearFormErrors($form);
                    if (!result.isValid) {
                        self.showFormErrors($form, result.errors);
                    }
                    return result;
                },
                getData: function() {
                    return self.getFormData($form);
                },
                setData: function(data) {
                    self.setFormData($form, data);
                },
                reset: function() {
                    self.resetForm($form);
                },
                clearErrors: function() {
                    self.clearFormErrors($form);
                }
            };
        },

        /**
         * 登录表单验证规则
         */
        loginSchema: {
            username: {
                required: true,
                minLength: { min: 3 },
                maxLength: { max: 20 }
            },
            password: {
                required: true,
                minLength: { min: 6 }
            }
        },

        /**
         * 用户表单验证规则
         */
        userSchema: {
            username: {
                required: true,
                minLength: { min: 3 },
                maxLength: { max: 20 },
                pattern: {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: '用户名只能包含字母、数字和下划线'
                }
            },
            email: {
                required: true,
                email: true
            },
            password: {
                required: true,
                minLength: { min: 6 }
            },
            confirmPassword: {
                required: true,
                match: { field: 'password', label: '密码' }
            },
            roleId: {
                required: true
            },
            phone: {
                phone: true
            }
        },

        /**
         * 角色表单验证规则
         */
        roleSchema: {
            name: {
                required: true,
                minLength: { min: 2 },
                maxLength: { max: 50 }
            },
            code: {
                required: true,
                minLength: { min: 2 },
                maxLength: { max: 30 },
                pattern: {
                    pattern: /^[a-zA-Z0-9_]+$/,
                    message: '角色代码只能包含字母、数字和下划线'
                }
            }
        },

        /**
         * 通用设置表单验证规则
         */
        generalSettingsSchema: {
            siteName: {
                required: true,
                minLength: { min: 2 },
                maxLength: { max: 100 }
            }
        },

        /**
         * 安全设置表单验证规则
         */
        securitySettingsSchema: {
            sessionTimeout: {
                required: true,
                min: { min: 5 },
                max: { max: 120 },
                integer: true
            },
            maxLoginAttempts: {
                required: true,
                min: { min: 1 },
                max: { max: 10 },
                integer: true
            },
            passwordMinLength: {
                required: true,
                min: { min: 6 },
                max: { max: 20 },
                integer: true
            }
        },

        /**
         * 邮件设置表单验证规则
         */
        emailSettingsSchema: {
            smtpHost: {
                required: true
            },
            smtpPort: {
                required: true,
                min: { min: 1 },
                max: { max: 65535 },
                integer: true
            },
            smtpUsername: {
                required: true,
                email: true
            }
        }
    };

    window.Validation = Validation;

})(window, jQuery, Utils);