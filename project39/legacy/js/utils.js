/**
 * 工具函数模块
 * 提供通用的工具方法
 */
(function(window, $) {
    'use strict';

    var Utils = {
        /**
         * 格式化日期
         * @param {Date|string|number} date - 日期对象、字符串或时间戳
         * @param {string} format - 格式字符串 (如: 'YYYY-MM-DD HH:mm:ss')
         * @returns {string} 格式化后的日期字符串
         */
        formatDate: function(date, format) {
            if (!date) return '';
            
            var d = new Date(date);
            if (isNaN(d.getTime())) return '';

            var pad = function(num, len) {
                return String(num).padStart(len || 2, '0');
            };

            var replacements = {
                'YYYY': d.getFullYear(),
                'MM': pad(d.getMonth() + 1),
                'DD': pad(d.getDate()),
                'HH': pad(d.getHours()),
                'mm': pad(d.getMinutes()),
                'ss': pad(d.getSeconds())
            };

            return format.replace(/YYYY|MM|DD|HH|mm|ss/g, function(match) {
                return replacements[match];
            });
        },

        /**
         * 防抖函数
         * @param {Function} func - 要执行的函数
         * @param {number} wait - 等待时间（毫秒）
         * @returns {Function} 防抖后的函数
         */
        debounce: function(func, wait) {
            var timeout;
            return function() {
                var context = this;
                var args = arguments;
                clearTimeout(timeout);
                timeout = setTimeout(function() {
                    func.apply(context, args);
                }, wait);
            };
        },

        /**
         * 节流函数
         * @param {Function} func - 要执行的函数
         * @param {number} limit - 限制时间（毫秒）
         * @returns {Function} 节流后的函数
         */
        throttle: function(func, limit) {
            var inThrottle;
            return function() {
                var context = this;
                var args = arguments;
                if (!inThrottle) {
                    func.apply(context, args);
                    inThrottle = true;
                    setTimeout(function() {
                        inThrottle = false;
                    }, limit);
                }
            };
        },

        /**
         * 生成唯一ID
         * @param {string} prefix - 前缀
         * @returns {string} 唯一ID
         */
        generateId: function(prefix) {
            return (prefix || 'id') + '_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        },

        /**
         * 深拷贝对象
         * @param {Object} obj - 要拷贝的对象
         * @returns {Object} 拷贝后的对象
         */
        deepClone: function(obj) {
            if (obj === null || typeof obj !== 'object') return obj;
            if (obj instanceof Date) return new Date(obj.getTime());
            if (obj instanceof Array) return obj.map(function(item) { return Utils.deepClone(item); });
            if (obj instanceof Object) {
                var copy = {};
                Object.keys(obj).forEach(function(key) {
                    copy[key] = Utils.deepClone(obj[key]);
                });
                return copy;
            }
            return obj;
        },

        /**
         * 深比较两个对象
         * @param {Object} obj1 - 第一个对象
         * @param {Object} obj2 - 第二个对象
         * @returns {boolean} 是否相等
         */
        deepEqual: function(obj1, obj2) {
            if (obj1 === obj2) return true;
            if (obj1 === null || obj2 === null) return false;
            if (typeof obj1 !== typeof obj2) return false;
            if (typeof obj1 !== 'object') return obj1 === obj2;
            
            if (obj1 instanceof Date && obj2 instanceof Date) {
                return obj1.getTime() === obj2.getTime();
            }
            
            if (Array.isArray(obj1) !== Array.isArray(obj2)) return false;
            
            var keys1 = Object.keys(obj1);
            var keys2 = Object.keys(obj2);
            
            if (keys1.length !== keys2.length) return false;
            
            for (var i = 0; i < keys1.length; i++) {
                var key = keys1[i];
                if (!obj2.hasOwnProperty(key)) return false;
                if (!Utils.deepEqual(obj1[key], obj2[key])) return false;
            }
            
            return true;
        },

        /**
         * 格式化货币
         * @param {number} amount - 金额
         * @param {string} currency - 货币符号
         * @returns {string} 格式化后的货币字符串
         */
        formatCurrency: function(amount, currency) {
            if (typeof amount !== 'number' || isNaN(amount)) return '';
            var symbol = currency || '¥';
            return symbol + amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },

        /**
         * 格式化数字
         * @param {number} num - 数字
         * @param {number} decimals - 小数位数
         * @returns {string} 格式化后的数字字符串
         */
        formatNumber: function(num, decimals) {
            if (typeof num !== 'number' || isNaN(num)) return '';
            return num.toFixed(decimals || 0).replace(/\d(?=(\d{3})+\.)/g, '$&,');
        },

        /**
         * 截取字符串并添加省略号
         * @param {string} str - 字符串
         * @param {number} maxLength - 最大长度
         * @returns {string} 处理后的字符串
         */
        truncate: function(str, maxLength) {
            if (!str || str.length <= maxLength) return str;
            return str.substring(0, maxLength) + '...';
        },

        /**
         * 验证邮箱格式
         * @param {string} email - 邮箱地址
         * @returns {boolean} 是否有效
         */
        isValidEmail: function(email) {
            var emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return emailRegex.test(email);
        },

        /**
         * 验证手机号格式
         * @param {string} phone - 手机号
         * @returns {boolean} 是否有效
         */
        isValidPhone: function(phone) {
            var phoneRegex = /^1[3-9]\d{9}$/;
            return phoneRegex.test(phone);
        },

        /**
         * 验证URL格式
         * @param {string} url - URL地址
         * @returns {boolean} 是否有效
         */
        isValidUrl: function(url) {
            try {
                new URL(url);
                return true;
            } catch (e) {
                return false;
            }
        },

        /**
         * 验证身份证号码
         * @param {string} idCard - 身份证号码
         * @returns {boolean} 是否有效
         */
        isValidIdCard: function(idCard) {
            var idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/;
            return idCardRegex.test(idCard);
        },

        /**
         * 密码强度检查
         * @param {string} password - 密码
         * @returns {Object} 包含强度等级和提示信息
         */
        checkPasswordStrength: function(password) {
            var strength = {
                level: 0,
                label: '',
                isValid: false
            };

            if (!password || password.length < 6) {
                strength.label = '密码至少需要6个字符';
                return strength;
            }

            var score = 0;
            
            if (password.length >= 8) score++;
            if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
            if (/\d/.test(password)) score++;
            if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;

            strength.level = score;
            strength.isValid = score >= 2;

            switch (score) {
                case 0:
                case 1:
                    strength.label = '弱';
                    break;
                case 2:
                    strength.label = '中等';
                    break;
                case 3:
                    strength.label = '强';
                    break;
                case 4:
                    strength.label = '非常强';
                    break;
            }

            return strength;
        },

        /**
         * 从URL获取参数值
         * @param {string} name - 参数名
         * @param {string} url - URL（可选，默认当前URL）
         * @returns {string|null} 参数值
         */
        getUrlParam: function(name, url) {
            var urlStr = url || window.location.href;
            var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)');
            var results = regex.exec(urlStr);
            if (!results) return null;
            if (!results[2]) return '';
            return decodeURIComponent(results[2].replace(/\+/g, ' '));
        },

        /**
         * 设置URL参数
         * @param {string} name - 参数名
         * @param {string} value - 参数值
         * @param {string} url - URL（可选，默认当前URL）
         * @returns {string} 新的URL
         */
        setUrlParam: function(name, value, url) {
            var urlStr = url || window.location.href;
            var regex = new RegExp('([?&])' + name + '=.*?(&|$)', 'i');
            var separator = urlStr.indexOf('?') !== -1 ? '&' : '?';

            if (urlStr.match(regex)) {
                return urlStr.replace(regex, '$1' + name + '=' + value + '$2');
            } else {
                return urlStr + separator + name + '=' + value;
            }
        },

        /**
         * 移除URL参数
         * @param {string} name - 参数名
         * @param {string} url - URL（可选，默认当前URL）
         * @returns {string} 新的URL
         */
        removeUrlParam: function(name, url) {
            var urlStr = url || window.location.href;
            var regex = new RegExp('([?&])' + name + '=[^&]*(&?)', 'i');
            var newUrl = urlStr.replace(regex, function(match, prefix, suffix) {
                return prefix === '?' && suffix ? '?' : suffix;
            });
            return newUrl;
        },

        /**
         * 存储数据到localStorage
         * @param {string} key - 键名
         * @param {*} value - 值（会被JSON序列化）
         */
        setStorage: function(key, value) {
            try {
                localStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('LocalStorage 写入失败:', e);
            }
        },

        /**
         * 从localStorage获取数据
         * @param {string} key - 键名
         * @param {*} defaultValue - 默认值
         * @returns {*} 存储的值或默认值
         */
        getStorage: function(key, defaultValue) {
            try {
                var value = localStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                console.error('LocalStorage 读取失败:', e);
                return defaultValue;
            }
        },

        /**
         * 从localStorage移除数据
         * @param {string} key - 键名
         */
        removeStorage: function(key) {
            try {
                localStorage.removeItem(key);
            } catch (e) {
                console.error('LocalStorage 移除失败:', e);
            }
        },

        /**
         * 清空localStorage
         */
        clearStorage: function() {
            try {
                localStorage.clear();
            } catch (e) {
                console.error('LocalStorage 清空失败:', e);
            }
        },

        /**
         * 存储数据到sessionStorage
         * @param {string} key - 键名
         * @param {*} value - 值
         */
        setSessionStorage: function(key, value) {
            try {
                sessionStorage.setItem(key, JSON.stringify(value));
            } catch (e) {
                console.error('SessionStorage 写入失败:', e);
            }
        },

        /**
         * 从sessionStorage获取数据
         * @param {string} key - 键名
         * @param {*} defaultValue - 默认值
         * @returns {*} 存储的值
         */
        getSessionStorage: function(key, defaultValue) {
            try {
                var value = sessionStorage.getItem(key);
                return value ? JSON.parse(value) : defaultValue;
            } catch (e) {
                console.error('SessionStorage 读取失败:', e);
                return defaultValue;
            }
        },

        /**
         * 显示Toast提示
         * @param {string} message - 提示消息
         * @param {string} type - 类型 (success, error, warning, info)
         * @param {number} duration - 显示时长（毫秒）
         */
        showToast: function(message, type, duration) {
            var $toast = $('#toast');
            var $toastMessage = $('#toast-message');
            
            $toast.removeClass('toast-success toast-error toast-warning toast-info hidden');
            $toast.addClass('toast-' + (type || 'info'));
            $toastMessage.text(message);
            
            $toast.show();
            
            setTimeout(function() {
                $toast.addClass('hidden');
            }, duration || 3000);
        },

        /**
         * 显示加载状态
         */
        showLoading: function() {
            $('#loading-overlay').removeClass('hidden');
        },

        /**
         * 隐藏加载状态
         */
        hideLoading: function() {
            $('#loading-overlay').addClass('hidden');
        },

        /**
         * 显示模态框
         * @param {string} selector - 模态框选择器
         */
        showModal: function(selector) {
            $(selector).removeClass('hidden');
            $('body').css('overflow', 'hidden');
        },

        /**
         * 隐藏模态框
         * @param {string} selector - 模态框选择器
         */
        hideModal: function(selector) {
            $(selector).addClass('hidden');
            $('body').css('overflow', '');
        },

        /**
         * 隐藏所有模态框
         */
        hideAllModals: function() {
            $('.modal').addClass('hidden');
            $('body').css('overflow', '');
        },

        /**
         * 简单的模板引擎
         * @param {string} template - 模板字符串
         * @param {Object} data - 数据对象
         * @returns {string} 渲染后的字符串
         */
        renderTemplate: function(template, data) {
            return template.replace(/\{(\w+)\}/g, function(match, key) {
                return data.hasOwnProperty(key) ? data[key] : match;
            });
        },

        /**
         * 将对象转换为查询字符串
         * @param {Object} obj - 对象
         * @returns {string} 查询字符串
         */
        objectToQueryString: function(obj) {
            if (!obj || Object.keys(obj).length === 0) return '';
            
            return Object.keys(obj)
                .filter(function(key) {
                    return obj[key] !== undefined && obj[key] !== null && obj[key] !== '';
                })
                .map(function(key) {
                    return encodeURIComponent(key) + '=' + encodeURIComponent(obj[key]);
                })
                .join('&');
        },

        /**
         * 将查询字符串转换为对象
         * @param {string} queryString - 查询字符串
         * @returns {Object} 解析后的对象
         */
        queryStringToObject: function(queryString) {
            if (!queryString) return {};
            
            var params = {};
            var pairs = queryString.replace(/^\?/, '').split('&');
            
            pairs.forEach(function(pair) {
                var parts = pair.split('=');
                if (parts.length === 2) {
                    params[decodeURIComponent(parts[0])] = decodeURIComponent(parts[1]);
                }
            });
            
            return params;
        },

        /**
         * 数组去重
         * @param {Array} arr - 数组
         * @returns {Array} 去重后的数组
         */
        uniqueArray: function(arr) {
            if (!Array.isArray(arr)) return [];
            return arr.filter(function(item, index, self) {
                return self.indexOf(item) === index;
            });
        },

        /**
         * 数组分组
         * @param {Array} arr - 数组
         * @param {string} key - 分组的键
         * @returns {Object} 分组后的对象
         */
        groupBy: function(arr, key) {
            if (!Array.isArray(arr)) return {};
            
            return arr.reduce(function(result, item) {
                var groupKey = item[key];
                if (!result[groupKey]) {
                    result[groupKey] = [];
                }
                result[groupKey].push(item);
                return result;
            }, {});
        },

        /**
         * 扁平化数组
         * @param {Array} arr - 多维数组
         * @returns {Array} 一维数组
         */
        flattenArray: function(arr) {
            if (!Array.isArray(arr)) return [];
            
            return arr.reduce(function(result, item) {
                if (Array.isArray(item)) {
                    return result.concat(Utils.flattenArray(item));
                }
                return result.concat(item);
            }, []);
        },

        /**
         * 延迟执行
         * @param {number} ms - 延迟时间（毫秒）
         * @returns {Promise} Promise对象
         */
        delay: function(ms) {
            return new Promise(function(resolve) {
                setTimeout(resolve, ms);
            });
        },

        /**
         * 重试函数
         * @param {Function} fn - 要执行的函数
         * @param {number} retries - 重试次数
         * @param {number} delay - 每次重试的延迟
         * @returns {Promise} Promise对象
         */
        retry: function(fn, retries, delay) {
            var attempt = 0;
            
            function execute() {
                return fn().catch(function(error) {
                    attempt++;
                    if (attempt < retries) {
                        return Utils.delay(delay || 1000).then(execute);
                    }
                    throw error;
                });
            }
            
            return execute();
        }
    };

    window.Utils = Utils;

})(window, jQuery);