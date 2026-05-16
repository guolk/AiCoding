const express = require('express');
const router = express.Router();
const { runQuery, getQuery, allQuery, encrypt, decrypt } = require('./database');

router.get('/subscriptions', async (req, res) => {
  try {
    const { status, category } = req.query;
    let sql = 'SELECT * FROM subscriptions WHERE 1=1';
    const params = [];
    
    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }
    if (category) {
      sql += ' AND category = ?';
      params.push(category);
    }
    
    sql += ' ORDER BY created_at DESC';
    const subscriptions = await allQuery(sql, params);
    
    subscriptions.forEach(sub => {
      if (sub.account_info) {
        sub.account_info = decrypt(sub.account_info);
      }
    });
    
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/subscriptions/:id', async (req, res) => {
  try {
    const subscription = await getQuery('SELECT * FROM subscriptions WHERE id = ?', [req.params.id]);
    if (subscription && subscription.account_info) {
      subscription.account_info = decrypt(subscription.account_info);
    }
    res.json(subscription);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/subscriptions', async (req, res) => {
  try {
    const { name, monthly_fee, yearly_fee, next_billing_date, payment_method, account_info, category, status, is_trial, trial_end_date, reminder_days } = req.body;
    
    const encryptedAccountInfo = account_info ? encrypt(account_info) : null;
    
    const result = await runQuery(
      `INSERT INTO subscriptions (name, monthly_fee, yearly_fee, next_billing_date, payment_method, account_info, category, status, is_trial, trial_end_date, reminder_days)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, monthly_fee || 0, yearly_fee || 0, next_billing_date, payment_method, encryptedAccountInfo, category, status || 'active', is_trial || 0, trial_end_date, reminder_days || 3]
    );
    
    res.json({ id: result.lastID, message: '订阅创建成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/subscriptions/:id', async (req, res) => {
  try {
    const { name, monthly_fee, yearly_fee, next_billing_date, payment_method, account_info, category, status, is_trial, trial_end_date, reminder_days } = req.body;
    
    const encryptedAccountInfo = account_info ? encrypt(account_info) : null;
    
    await runQuery(
      `UPDATE subscriptions SET name = ?, monthly_fee = ?, yearly_fee = ?, next_billing_date = ?, payment_method = ?, account_info = ?, category = ?, status = ?, is_trial = ?, trial_end_date = ?, reminder_days = ?, updated_at = CURRENT_TIMESTAMP
       WHERE id = ?`,
      [name, monthly_fee || 0, yearly_fee || 0, next_billing_date, payment_method, encryptedAccountInfo, category, status, is_trial || 0, trial_end_date, reminder_days || 3, req.params.id]
    );
    
    res.json({ message: '订阅更新成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/subscriptions/:id', async (req, res) => {
  try {
    await runQuery('DELETE FROM subscriptions WHERE id = ?', [req.params.id]);
    res.json({ message: '订阅删除成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/usage', async (req, res) => {
  try {
    const { subscription_id, usage_date, usage_time, duration, notes } = req.body;
    const result = await runQuery(
      'INSERT INTO usage_records (subscription_id, usage_date, usage_time, duration, notes) VALUES (?, ?, ?, ?, ?)',
      [subscription_id, usage_date, usage_time, duration || 0, notes]
    );
    res.json({ id: result.lastID, message: '使用记录添加成功' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/usage', async (req, res) => {
  try {
    const { subscription_id, start_date, end_date } = req.query;
    let sql = `
      SELECT ur.*, s.name as subscription_name 
      FROM usage_records ur 
      LEFT JOIN subscriptions s ON ur.subscription_id = s.id 
      WHERE 1=1
    `;
    const params = [];
    
    if (subscription_id) {
      sql += ' AND ur.subscription_id = ?';
      params.push(subscription_id);
    }
    if (start_date) {
      sql += ' AND ur.usage_date >= ?';
      params.push(start_date);
    }
    if (end_date) {
      sql += ' AND ur.usage_date <= ?';
      params.push(end_date);
    }
    
    sql += ' ORDER BY ur.usage_date DESC, ur.usage_time DESC';
    const records = await allQuery(sql, params);
    res.json(records);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/summary', async (req, res) => {
  try {
    const subscriptions = await allQuery("SELECT * FROM subscriptions WHERE status = 'active'");
    
    let monthlyTotal = 0;
    let yearlyTotal = 0;
    
    subscriptions.forEach(sub => {
      if (sub.monthly_fee > 0) {
        monthlyTotal += sub.monthly_fee;
        yearlyTotal += sub.monthly_fee * 12;
      }
      if (sub.yearly_fee > 0 && sub.monthly_fee === 0) {
        yearlyTotal += sub.yearly_fee;
        monthlyTotal += sub.yearly_fee / 12;
      }
    });
    
    res.json({
      monthly_total: Math.round(monthlyTotal * 100) / 100,
      yearly_total: Math.round(yearlyTotal * 100) / 100,
      active_count: subscriptions.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/category-breakdown', async (req, res) => {
  try {
    const subscriptions = await allQuery("SELECT * FROM subscriptions WHERE status = 'active'");
    
    const categories = {};
    subscriptions.forEach(sub => {
      const cat = sub.category || '其他';
      if (!categories[cat]) {
        categories[cat] = { count: 0, monthly_cost: 0, yearly_cost: 0 };
      }
      categories[cat].count++;
      if (sub.monthly_fee > 0) {
        categories[cat].monthly_cost += sub.monthly_fee;
        categories[cat].yearly_cost += sub.monthly_fee * 12;
      }
      if (sub.yearly_fee > 0 && sub.monthly_fee === 0) {
        categories[cat].yearly_cost += sub.yearly_fee;
        categories[cat].monthly_cost += sub.yearly_fee / 12;
      }
    });
    
    res.json(categories);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/analytics/roi-scores', async (req, res) => {
  try {
    const subscriptions = await allQuery("SELECT * FROM subscriptions WHERE status = 'active'");
    const usageRecords = await allQuery(`
      SELECT subscription_id, COUNT(*) as usage_count, MAX(usage_date) as last_used
      FROM usage_records
      WHERE usage_date >= date('now', '-30 days')
      GROUP BY subscription_id
    `);
    
    const usageMap = {};
    usageRecords.forEach(record => {
      usageMap[record.subscription_id] = record;
    });
    
    const roiScores = subscriptions.map(sub => {
      const usage = usageMap[sub.id] || { usage_count: 0, last_used: null };
      const monthlyCost = sub.monthly_fee > 0 ? sub.monthly_fee : (sub.yearly_fee / 12);
      const costPerUse = usage.usage_count > 0 ? monthlyCost / usage.usage_count : monthlyCost;
      
      let roiScore = 0;
      let status = '待评估';
      
      if (usage.usage_count >= 16) {
        roiScore = 100;
        status = '优秀';
      } else if (usage.usage_count >= 8) {
        roiScore = 75;
        status = '良好';
      } else if (usage.usage_count >= 4) {
        roiScore = 50;
        status = '一般';
      } else if (usage.usage_count >= 1) {
        roiScore = 25;
        status = '低';
      }
      
      return {
        subscription_id: sub.id,
        name: sub.name,
        monthly_cost: monthlyCost,
        usage_count: usage.usage_count,
        last_used: usage.last_used,
        cost_per_use: Math.round(costPerUse * 100) / 100,
        roi_score: roiScore,
        status: status
      };
    });
    
    res.json(roiScores);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/recommendations', async (req, res) => {
  try {
    const subscriptions = await allQuery("SELECT * FROM subscriptions WHERE status = 'active'");
    const usageRecords = await allQuery(`
      SELECT subscription_id, MAX(usage_date) as last_used
      FROM usage_records
      GROUP BY subscription_id
    `);
    
    const usageMap = {};
    usageRecords.forEach(record => {
      usageMap[record.subscription_id] = record.last_used;
    });
    
    const unusedSubscriptions = subscriptions.filter(sub => {
      const lastUsed = usageMap[sub.id];
      if (!lastUsed) return true;
      const daysDiff = Math.floor((new Date() - new Date(lastUsed)) / (1000 * 60 * 60 * 24));
      return daysDiff > 30;
    });
    
    const categoryGroups = {};
    subscriptions.forEach(sub => {
      const cat = sub.category || '其他';
      if (!categoryGroups[cat]) {
        categoryGroups[cat] = [];
      }
      categoryGroups[cat].push(sub);
    });
    
    const mergeSuggestions = [];
    Object.keys(categoryGroups).forEach(cat => {
      if (categoryGroups[cat].length > 1) {
        mergeSuggestions.push({
          category: cat,
          subscriptions: categoryGroups[cat].map(s => ({ id: s.id, name: s.name }))
        });
      }
    });
    
    const savingsSuggestions = subscriptions
      .filter(sub => sub.monthly_fee > 0 && sub.yearly_fee > 0)
      .map(sub => {
        const monthlyTotal = sub.monthly_fee * 12;
        const savings = monthlyTotal - sub.yearly_fee;
        return {
          subscription_id: sub.id,
          name: sub.name,
          monthly_fee: sub.monthly_fee,
          yearly_fee: sub.yearly_fee,
          annual_savings: Math.round(savings * 100) / 100,
          savings_percentage: Math.round((savings / monthlyTotal) * 100)
        };
      })
      .filter(s => s.annual_savings > 0);
    
    res.json({
      unused_subscriptions: unusedSubscriptions,
      merge_suggestions: mergeSuggestions,
      savings_suggestions: savingsSuggestions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/monthly-trend', async (req, res) => {
  try {
    const { year } = req.query;
    const targetYear = year || new Date().getFullYear();
    
    const monthlyData = [];
    for (let month = 1; month <= 12; month++) {
      monthlyData.push({
        month: `${targetYear}-${month.toString().padStart(2, '0')}`,
        total: 0
      });
    }
    
    const subscriptions = await allQuery("SELECT * FROM subscriptions");
    subscriptions.forEach(sub => {
      const monthlyCost = sub.monthly_fee > 0 ? sub.monthly_fee : (sub.yearly_fee / 12);
      monthlyData.forEach(month => {
        month.total += monthlyCost;
      });
    });
    
    res.json(monthlyData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/history/cancelled', async (req, res) => {
  try {
    const subscriptions = await allQuery("SELECT * FROM subscriptions WHERE status = 'cancelled' ORDER BY updated_at DESC");
    res.json(subscriptions);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/upcoming-reminders', async (req, res) => {
  try {
    const days = req.query.days || 7;
    const subscriptions = await allQuery(`
      SELECT * FROM subscriptions 
      WHERE status = 'active' 
      AND next_billing_date <= date('now', '+' || ? || ' days')
      AND next_billing_date >= date('now')
      ORDER BY next_billing_date ASC
    `, [days]);
    
    const trialSubscriptions = await allQuery(`
      SELECT * FROM subscriptions 
      WHERE status = 'active' 
      AND is_trial = 1
      AND trial_end_date <= date('now', '+' || ? || ' days')
      AND trial_end_date >= date('now')
      ORDER BY trial_end_date ASC
    `, [days]);
    
    res.json({
      billing_reminders: subscriptions,
      trial_reminders: trialSubscriptions
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
