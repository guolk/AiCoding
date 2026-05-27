const express = require('express');
const cors = require('cors');
const path = require('path');
const { run, get, all } = require('./database');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static(path.join(__dirname, 'public')));

app.use(async (req, res, next) => {
  try {
    await run(`
      UPDATE posts SET status = 'archived' 
      WHERE expires_at IS NOT NULL AND expires_at < CURRENT_TIMESTAMP AND status = 'active'
    `);
    await run(`
      UPDATE activities SET status = 'completed' 
      WHERE activity_date < CURRENT_TIMESTAMP AND status = 'upcoming'
    `);
  } catch (e) {
    console.error('Auto-update error:', e);
  }
  next();
});

app.get('/api/users', async (req, res) => {
  const users = await all('SELECT * FROM users');
  res.json(users);
});

app.get('/api/users/:id', async (req, res) => {
  const user = await get('SELECT * FROM users WHERE id = ?', [req.params.id]);
  if (!user) return res.status(404).json({ error: '用户不存在' });
  res.json(user);
});

app.post('/api/users', async (req, res) => {
  const { nickname, avatar, phone, community, address } = req.body;
  const result = await run(
    'INSERT INTO users (nickname, avatar, phone, community, address) VALUES (?, ?, ?, ?, ?)',
    [nickname, avatar, phone, community, address]
  );
  res.json({ id: result.lastID, ...req.body });
});

app.post('/api/posts', async (req, res) => {
  const { user_id, category, title, content, images, location, location_range, expires_at } = req.body;
  const result = await run(`
    INSERT INTO posts (user_id, category, title, content, images, location, location_range, expires_at)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `, [user_id, category, title, content, JSON.stringify(images || []), location, location_range || 1, expires_at || null]);
  
  const post = await get('SELECT * FROM posts WHERE id = ?', [result.lastID]);
  post.images = JSON.parse(post.images || '[]');
  res.json(post);
});

app.get('/api/posts', async (req, res) => {
  const { category, location, status = 'active' } = req.query;
  let sql = `
    SELECT p.*, u.nickname, u.avatar 
    FROM posts p 
    JOIN users u ON p.user_id = u.id 
    WHERE p.status = ?
  `;
  const params = [status];
  
  if (category) {
    sql += ' AND p.category = ?';
    params.push(category);
  }
  if (location) {
    sql += ' AND p.location LIKE ?';
    params.push(`%${location}%`);
  }
  
  sql += ' ORDER BY p.created_at DESC';
  
  const posts = await all(sql, params);
  posts.forEach(p => p.images = JSON.parse(p.images || '[]'));
  res.json(posts);
});

app.get('/api/posts/:id', async (req, res) => {
  const post = await get(`
    SELECT p.*, u.nickname, u.avatar 
    FROM posts p JOIN users u ON p.user_id = u.id 
    WHERE p.id = ?
  `, [req.params.id]);
  
  if (!post) return res.status(404).json({ error: '信息不存在' });
  post.images = JSON.parse(post.images || '[]');
  res.json(post);
});

app.post('/api/help', async (req, res) => {
  const { user_id, type, title, content, skill_tags, is_urgent, location } = req.body;
  const result = await run(`
    INSERT INTO help_posts (user_id, type, title, content, skill_tags, is_urgent, location)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `, [user_id, type, title, content, JSON.stringify(skill_tags || []), is_urgent ? 1 : 0, location]);
  
  const post = await get('SELECT * FROM help_posts WHERE id = ?', [result.lastID]);
  post.skill_tags = JSON.parse(post.skill_tags || '[]');
  res.json(post);
});

app.get('/api/help', async (req, res) => {
  const { type, status = 'open' } = req.query;
  let sql = `
    SELECT h.*, u.nickname, u.avatar 
    FROM help_posts h 
    JOIN users u ON h.user_id = u.id 
    WHERE h.status = ?
  `;
  const params = [status];
  
  if (type) {
    sql += ' AND h.type = ?';
    params.push(type);
  }
  
  sql += ' ORDER BY h.is_urgent DESC, h.created_at DESC';
  
  const posts = await all(sql, params);
  posts.forEach(p => p.skill_tags = JSON.parse(p.skill_tags || '[]'));
  res.json(posts);
});

app.post('/api/help/:id/accept', async (req, res) => {
  const { helper_id } = req.body;
  await run('UPDATE help_posts SET status = "accepted", helper_id = ? WHERE id = ?', [helper_id, req.params.id]);
  
  const post = await get('SELECT * FROM help_posts WHERE id = ?', [req.params.id]);
  post.skill_tags = JSON.parse(post.skill_tags || '[]');
  res.json(post);
});

app.post('/api/help/:id/complete', async (req, res) => {
  const { message } = req.body;
  const post = await get('SELECT * FROM help_posts WHERE id = ?', [req.params.id]);
  
  if (!post) return res.status(404).json({ error: '求助不存在' });
  
  await run('UPDATE help_posts SET status = "completed" WHERE id = ?', [req.params.id]);
  
  if (post.helper_id) {
    await run(`
      INSERT INTO thank_records (help_post_id, from_user_id, to_user_id, message)
      VALUES (?, ?, ?, ?)
    `, [req.params.id, post.user_id, post.helper_id, message || '']);
    
    await run('UPDATE users SET reputation = reputation + 5 WHERE id = ?', [post.helper_id]);
  }
  
  res.json({ success: true });
});

app.delete('/api/help/:id', async (req, res) => {
  const { user_id } = req.body;
  const post = await get('SELECT * FROM help_posts WHERE id = ?', [req.params.id]);
  
  if (!post) return res.status(404).json({ error: '求助不存在' });
  if (post.user_id !== user_id) return res.status(403).json({ error: '只能删除自己发布的帖子' });
  
  await run('DELETE FROM help_posts WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.get('/api/thanks', async (req, res) => {
  const thanks = await all(`
    SELECT t.*, 
           fu.nickname as from_nickname, fu.avatar as from_avatar,
           tu.nickname as to_nickname, tu.avatar as to_avatar,
           h.title as help_title
    FROM thank_records t
    JOIN users fu ON t.from_user_id = fu.id
    JOIN users tu ON t.to_user_id = tu.id
    JOIN help_posts h ON t.help_post_id = h.id
    ORDER BY t.created_at DESC
    LIMIT 50
  `);
  res.json(thanks);
});

app.get('/api/price-suggest', async (req, res) => {
  const { keyword } = req.query;
  if (!keyword) return res.json({ hasData: false });
  
  const items = await all(`
    SELECT price FROM items 
    WHERE status = 'sold' AND (title LIKE ? OR category LIKE ?)
    LIMIT 20
  `, [`%${keyword}%`, `%${keyword}%`]);
  
  if (items.length === 0) {
    return res.json({ hasData: false });
  }
  
  const prices = items.map(i => i.price);
  const avg = prices.reduce((a, b) => a + b, 0) / prices.length;
  const min = Math.min(...prices);
  const max = Math.max(...prices);
  
  res.json({
    hasData: true,
    avgPrice: Math.round(avg * 100) / 100,
    minPrice: min,
    maxPrice: max,
    sampleCount: prices.length
  });
});

app.post('/api/items', async (req, res) => {
  const { user_id, title, description, price, condition, images, trade_method, location, category } = req.body;
  const result = await run(`
    INSERT INTO items (user_id, title, description, price, condition, images, trade_method, location, category)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [user_id, title, description, price, condition, JSON.stringify(images || []), trade_method, location, category || null]);
  
  const item = await get('SELECT * FROM items WHERE id = ?', [result.lastID]);
  item.images = JSON.parse(item.images || '[]');
  res.json(item);
});

app.get('/api/items', async (req, res) => {
  const { category, status = 'available', location } = req.query;
  let sql = `
    SELECT i.*, u.nickname, u.avatar, u.reputation
    FROM items i 
    JOIN users u ON i.user_id = u.id 
    WHERE i.status = ?
  `;
  const params = [status];
  
  if (category) {
    sql += ' AND i.category = ?';
    params.push(category);
  }
  if (location) {
    sql += ' AND i.location LIKE ?';
    params.push(`%${location}%`);
  }
  
  sql += ' ORDER BY i.created_at DESC';
  
  const items = await all(sql, params);
  items.forEach(i => i.images = JSON.parse(i.images || '[]'));
  res.json(items);
});

app.get('/api/items/:id', async (req, res) => {
  const item = await get(`
    SELECT i.*, u.nickname, u.avatar, u.reputation, u.phone
    FROM items i JOIN users u ON i.user_id = u.id 
    WHERE i.id = ?
  `, [req.params.id]);
  
  if (!item) return res.status(404).json({ error: '物品不存在' });
  item.images = JSON.parse(item.images || '[]');
  res.json(item);
});

app.post('/api/items/:id/sold', async (req, res) => {
  await run('UPDATE items SET status = "sold" WHERE id = ?', [req.params.id]);
  res.json({ success: true });
});

app.post('/api/reviews', async (req, res) => {
  const { item_id, reviewer_id, reviewee_id, rating, comment } = req.body;
  const result = await run(`
    INSERT INTO reviews (item_id, reviewer_id, reviewee_id, rating, comment)
    VALUES (?, ?, ?, ?, ?)
  `, [item_id, reviewer_id, reviewee_id, rating, comment || '']);
  
  const avgResult = await get(`
    SELECT AVG(rating) as avg FROM reviews WHERE reviewee_id = ?
  `, [reviewee_id]);
  
  if (avgResult.avg) {
    await run('UPDATE users SET reputation = ? WHERE id = ?', [Math.round(50 + avgResult.avg * 10), reviewee_id]);
  }
  
  res.json({ id: result.lastID, success: true });
});

app.get('/api/users/:id/reviews', async (req, res) => {
  const reviews = await all(`
    SELECT r.*, u.nickname, u.avatar, i.title as item_title
    FROM reviews r
    JOIN users u ON r.reviewer_id = u.id
    JOIN items i ON r.item_id = i.id
    WHERE r.reviewee_id = ?
    ORDER BY r.created_at DESC
  `, [req.params.id]);
  res.json(reviews);
});

app.post('/api/activities', async (req, res) => {
  const { user_id, title, description, activity_date, location, max_participants, images, is_recurring, recurring_pattern } = req.body;
  const result = await run(`
    INSERT INTO activities (user_id, title, description, activity_date, location, max_participants, images, is_recurring, recurring_pattern)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  `, [user_id, title, description, activity_date, location, max_participants || null, JSON.stringify(images || []), is_recurring ? 1 : 0, recurring_pattern || null]);
  
  const activity = await get('SELECT * FROM activities WHERE id = ?', [result.lastID]);
  activity.images = JSON.parse(activity.images || '[]');
  res.json(activity);
});

app.get('/api/activities', async (req, res) => {
  const { status } = req.query;
  let sql = `
    SELECT a.*, u.nickname, u.avatar,
           (SELECT COUNT(*) FROM activity_signups WHERE activity_id = a.id) as signup_count
    FROM activities a 
    JOIN users u ON a.user_id = u.id
  `;
  const params = [];
  
  if (status) {
    sql += ' WHERE a.status = ?';
    params.push(status);
  }
  
  sql += ' ORDER BY a.is_recurring DESC, a.activity_date ASC';
  
  const activities = await all(sql, params);
  activities.forEach(a => a.images = JSON.parse(a.images || '[]'));
  res.json(activities);
});

app.post('/api/activities/:id/signup', async (req, res) => {
  const { user_id } = req.body;
  const activity = await get('SELECT * FROM activities WHERE id = ?', [req.params.id]);
  
  if (!activity) return res.status(404).json({ error: '活动不存在' });
  
  const existing = await get('SELECT * FROM activity_signups WHERE activity_id = ? AND user_id = ?', [req.params.id, user_id]);
  
  if (existing) {
    return res.status(400).json({ error: '已报名该活动' });
  }
  
  const signupCountResult = await get('SELECT COUNT(*) as count FROM activity_signups WHERE activity_id = ?', [req.params.id]);
  
  if (activity.max_participants && signupCountResult.count >= activity.max_participants) {
    return res.status(400).json({ error: '活动名额已满' });
  }
  
  await run('INSERT INTO activity_signups (activity_id, user_id) VALUES (?, ?)', [req.params.id, user_id]);
  
  res.json({ success: true });
});

app.get('/api/activities/:id/signups', async (req, res) => {
  const signups = await all(`
    SELECT s.*, u.nickname, u.avatar
    FROM activity_signups s
    JOIN users u ON s.user_id = u.id
    WHERE s.activity_id = ?
    ORDER BY s.created_at
  `, [req.params.id]);
  res.json(signups);
});

app.post('/api/activities/:id/photos', async (req, res) => {
  const { user_id, image_url, description } = req.body;
  const result = await run(`
    INSERT INTO activity_photos (activity_id, user_id, image_url, description)
    VALUES (?, ?, ?, ?)
  `, [req.params.id, user_id, image_url, description || '']);
  
  res.json({ id: result.lastID, success: true });
});

app.get('/api/activities/:id/photos', async (req, res) => {
  const photos = await all(`
    SELECT p.*, u.nickname, u.avatar
    FROM activity_photos p
    JOIN users u ON p.user_id = u.id
    WHERE p.activity_id = ?
    ORDER BY p.created_at DESC
  `, [req.params.id]);
  res.json(photos);
});

app.post('/api/deals', async (req, res) => {
  const { user_id, merchant_name, deal_content, location, valid_until, images } = req.body;
  const result = await run(`
    INSERT INTO merchant_deals (user_id, merchant_name, deal_content, location, valid_until, images)
    VALUES (?, ?, ?, ?, ?, ?)
  `, [user_id, merchant_name, deal_content, location, valid_until || null, JSON.stringify(images || [])]);
  
  const deal = await get('SELECT * FROM merchant_deals WHERE id = ?', [result.lastID]);
  deal.images = JSON.parse(deal.images || '[]');
  res.json(deal);
});

app.get('/api/deals', async (req, res) => {
  const deals = await all(`
    SELECT d.*, u.nickname, u.avatar
    FROM merchant_deals d
    JOIN users u ON d.user_id = u.id
    WHERE (d.valid_until IS NULL OR d.valid_until > CURRENT_TIMESTAMP)
    ORDER BY d.created_at DESC
  `);
  deals.forEach(d => d.images = JSON.parse(d.images || '[]'));
  res.json(deals);
});

app.get('/api/contacts', async (req, res) => {
  const { category } = req.query;
  let sql = 'SELECT * FROM useful_contacts';
  const params = [];
  
  if (category) {
    sql += ' WHERE category = ?';
    params.push(category);
  }
  
  sql += ' ORDER BY category, name';
  
  const contacts = await all(sql, params);
  res.json(contacts);
});

app.post('/api/contacts', async (req, res) => {
  const { name, phone, category, location, description } = req.body;
  const result = await run(`
    INSERT INTO useful_contacts (name, phone, category, location, description)
    VALUES (?, ?, ?, ?, ?)
  `, [name, phone, category, location || '', description || '']);
  
  res.json({ id: result.lastID, success: true });
});

app.listen(PORT, () => {
  console.log(`社区平台运行在 http://localhost:${PORT}`);
});
