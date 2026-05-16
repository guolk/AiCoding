const cron = require('node-cron');
const notifier = require('node-notifier');
const { allQuery } = require('./database');

function setupReminders() {
  cron.schedule('0 9 * * *', async () => {
    try {
      const subscriptions = await allQuery(`
        SELECT * FROM subscriptions 
        WHERE status = 'active' 
        AND next_billing_date = date('now', '+' || reminder_days || ' days')
      `);
      
      subscriptions.forEach(sub => {
        notifier.notify({
          title: '订阅扣款提醒',
          message: `${sub.name} 将在 ${sub.reminder_days} 天后扣款，金额: ¥${sub.monthly_fee || sub.yearly_fee}/月`,
          sound: true,
          wait: true
        });
      });
      
      const trialSubscriptions = await allQuery(`
        SELECT * FROM subscriptions 
        WHERE status = 'active' 
        AND is_trial = 1
        AND trial_end_date = date('now', '+3 days')
      `);
      
      trialSubscriptions.forEach(sub => {
        notifier.notify({
          title: '免费试用到期提醒',
          message: `${sub.name} 的免费试用将在 3 天后到期！`,
          sound: true,
          wait: true
        });
      });
    } catch (err) {
      console.error('发送提醒失败:', err);
    }
  });
  
  console.log('提醒服务已启动');
}

module.exports = { setupReminders };
