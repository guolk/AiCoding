/**
 * 仪表盘模块
 * 处理仪表盘数据加载和显示
 */
(function(window, $, Utils, API) {
    'use strict';

    var Dashboard = {
        init: function() {
            this.bindEvents();
        },

        bindEvents: function() {
            var self = this;

            $(document).on('pageShown', function(e, page) {
                if (page === 'dashboard') {
                    self.loadData();
                }
            });
        },

        loadData: function() {
            var self = this;

            Utils.showLoading();

            Promise.all([
                API.getDashboardStats(),
                API.getActivities()
            ])
            .then(function(results) {
                var stats = results[0];
                var activities = results[1];

                self.renderStats(stats);
                self.renderActivities(activities);

                Utils.hideLoading();
            })
            .catch(function(error) {
                Utils.hideLoading();
                Utils.showToast(error.message || '加载数据失败', 'error');
            });
        },

        renderStats: function(stats) {
            $('#stat-total-users').text(stats.totalUsers);
            $('#stat-active-users').text(stats.activeUsers);
            $('#stat-total-roles').text(stats.totalRoles);
            $('#stat-pending-requests').text(stats.pendingRequests);
        },

        renderActivities: function(activities) {
            var $activityList = $('#activity-list');
            $activityList.empty();

            if (!activities || activities.length === 0) {
                $activityList.append('<tr><td colspan="4" class="text-center">暂无活动记录</td></tr>');
                return;
            }

            activities.forEach(function(activity) {
                var statusClass = activity.status === 'success' ? 'status-active' : 'status-inactive';
                var statusText = activity.status === 'success' ? '成功' : '失败';

                var html = '<tr>' +
                    '<td>' + Utils.escapeHtml(activity.action) + '</td>' +
                    '<td>' + Utils.escapeHtml(activity.user) + '</td>' +
                    '<td>' + Utils.escapeHtml(activity.time) + '</td>' +
                    '<td><span class="status-badge ' + statusClass + '">' + statusText + '</span></td>' +
                    '</tr>';

                $activityList.append(html);
            });
        },

        refresh: function() {
            this.loadData();
        }
    };

    if (!Utils.escapeHtml) {
        Utils.escapeHtml = function(str) {
            if (!str) return '';
            var div = document.createElement('div');
            div.textContent = str;
            return div.innerHTML;
        };
    }

    window.Dashboard = Dashboard;

})(window, jQuery, Utils, API);