const express = require('express');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { run, get, all, initDatabase } = require('./database');
const { parseGPX } = require('./gpxParser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));

const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const photosDir = path.join(uploadsDir, 'photos');
if (!fs.existsSync(photosDir)) {
    fs.mkdirSync(photosDir, { recursive: true });
}

const gpxDir = path.join(uploadsDir, 'gpx');
if (!fs.existsSync(gpxDir)) {
    fs.mkdirSync(gpxDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        if (file.fieldname === 'photo') {
            cb(null, photosDir);
        } else if (file.fieldname === 'gpx') {
            cb(null, gpxDir);
        } else {
            cb(null, uploadsDir);
        }
    },
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9) + path.extname(file.originalname);
        cb(null, uniqueName);
    }
});

const upload = multer({ storage });

// ==================== 骑行记录模块 ====================

app.get('/api/rides', async (req, res) => {
    try {
        const { year, month, page = 1, limit = 20 } = req.query;
        let query = 'SELECT * FROM rides WHERE 1=1';
        const params = [];
        
        if (year) {
            query += ' AND strftime("%Y", date) = ?';
            params.push(year);
        }
        if (month) {
            query += ' AND strftime("%m", date) = ?';
            params.push(month);
        }
        
        query += ' ORDER BY date DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));
        
        const rides = await all(query, params);
        
        let countQuery = 'SELECT COUNT(*) as total FROM rides WHERE 1=1';
        const countParams = [];
        if (year) {
            countQuery += ' AND strftime("%Y", date) = ?';
            countParams.push(year);
        }
        if (month) {
            countQuery += ' AND strftime("%m", date) = ?';
            countParams.push(month);
        }
        const { total } = await get(countQuery, countParams);
        
        res.json({ rides, total, page: parseInt(page), limit: parseInt(limit) });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/rides/:id', async (req, res) => {
    try {
        const ride = await get('SELECT * FROM rides WHERE id = ?', [req.params.id]);
        if (!ride) return res.status(404).json({ error: '骑行记录不存在' });
        
        const photos = await all('SELECT * FROM ride_photos WHERE ride_id = ?', [req.params.id]);
        ride.photos = photos;
        
        if (ride.gpx_data) {
            try {
                ride.gpx_data = JSON.parse(ride.gpx_data);
            } catch (e) {}
        }
        
        res.json(ride);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rides', upload.single('gpx'), async (req, res) => {
    try {
        const { date, distance, duration, elevation, avg_speed, max_speed, avg_heart_rate, ride_type, notes } = req.body;
        
        let gpxData = null;
        if (req.file) {
            const gpxContent = fs.readFileSync(req.file.path, 'utf8');
            const parsed = await parseGPX(gpxContent);
            gpxData = JSON.stringify(parsed);
        }
        
        const result = await run(
            `INSERT INTO rides (date, distance, duration, elevation, avg_speed, max_speed, avg_heart_rate, ride_type, gpx_data, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                date,
                parseFloat(distance),
                parseInt(duration),
                elevation ? parseFloat(elevation) : 0,
                avg_speed ? parseFloat(avg_speed) : null,
                max_speed ? parseFloat(max_speed) : null,
                avg_heart_rate ? parseInt(avg_heart_rate) : null,
                ride_type || null,
                gpxData,
                notes || null
            ]
        );
        
        await updateChallengeProgress(result.lastID, parseFloat(distance), date);
        
        res.json({ id: result.lastID, message: '创建成功' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/rides/:id/photos', upload.array('photo', 10), async (req, res) => {
    try {
        const rideId = req.params.id;
        const ride = await get('SELECT * FROM rides WHERE id = ?', [rideId]);
        if (!ride) return res.status(404).json({ error: '骑行记录不存在' });
        
        const photos = [];
        
        for (const file of req.files) {
            const filepath = '/uploads/photos/' + file.filename;
            const result = await run(
                'INSERT INTO ride_photos (ride_id, filename, filepath) VALUES (?, ?, ?)',
                [rideId, file.originalname, filepath]
            );
            photos.push({
                id: result.lastID,
                filename: file.originalname,
                filepath
            });
        }
        
        res.json({ photos, message: '照片上传成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/rides/:id', async (req, res) => {
    try {
        await run('DELETE FROM ride_photos WHERE ride_id = ?', [req.params.id]);
        await run('DELETE FROM challenge_progress WHERE ride_id = ?', [req.params.id]);
        await run('DELETE FROM rides WHERE id = ?', [req.params.id]);
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== 统计分析模块 ====================

app.get('/api/statistics/monthly', async (req, res) => {
    try {
        const { year } = req.query;
        const query = `
            SELECT 
                strftime("%Y-%m", date) as month,
                COUNT(*) as ride_count,
                SUM(distance) as total_distance,
                SUM(elevation) as total_elevation,
                SUM(duration) as total_duration,
                AVG(avg_speed) as avg_speed
            FROM rides
            WHERE strftime("%Y", date) = ?
            GROUP BY strftime("%Y-%m", date)
            ORDER BY month
        `;
        
        const stats = await all(query, [year || new Date().getFullYear()]);
        
        const months = [];
        const y = year || new Date().getFullYear();
        for (let i = 1; i <= 12; i++) {
            const monthStr = `${y}-${i.toString().padStart(2, '0')}`;
            const monthData = stats.find(s => s.month === monthStr);
            months.push({
                month: monthStr,
                ride_count: monthData?.ride_count || 0,
                total_distance: monthData?.total_distance || 0,
                total_elevation: monthData?.total_elevation || 0,
                total_duration: monthData?.total_duration || 0,
                avg_speed: monthData?.avg_speed || 0
            });
        }
        
        res.json({ months });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/statistics/yearly', async (req, res) => {
    try {
        const query = `
            SELECT 
                strftime("%Y", date) as year,
                COUNT(*) as ride_count,
                SUM(distance) as total_distance,
                SUM(elevation) as total_elevation,
                SUM(duration) as total_duration
            FROM rides
            GROUP BY strftime("%Y", date)
            ORDER BY year DESC
        `;
        
        const stats = await all(query);
        res.json({ years: stats });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/statistics/records', async (req, res) => {
    try {
        const records = await get(`
            SELECT
                MAX(distance) as longest_distance,
                MAX(max_speed) as fastest_speed,
                MAX(elevation) as highest_elevation,
                MAX(duration) as longest_duration
            FROM rides
        `);
        
        const longestRide = await get('SELECT * FROM rides WHERE distance = ? ORDER BY date DESC LIMIT 1', [records.longest_distance]);
        const fastestRide = await get('SELECT * FROM rides WHERE max_speed = ? ORDER BY date DESC LIMIT 1', [records.fastest_speed]);
        const highestRide = await get('SELECT * FROM rides WHERE elevation = ? ORDER BY date DESC LIMIT 1', [records.highest_elevation]);
        
        const totalStats = await get(`
            SELECT
                COUNT(*) as total_rides,
                SUM(distance) as total_distance,
                SUM(elevation) as total_elevation,
                SUM(duration) as total_duration
            FROM rides
        `);
        
        res.json({
            records: {
                longest_distance: { value: records.longest_distance, ride: longestRide },
                fastest_speed: { value: records.fastest_speed, ride: fastestRide },
                highest_elevation: { value: records.highest_elevation, ride: highestRide },
                longest_duration: { value: records.longest_duration }
            },
            totals: totalStats
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/statistics/heatmap', async (req, res) => {
    try {
        const rides = await all('SELECT id, gpx_data FROM rides WHERE gpx_data IS NOT NULL');
        
        const heatmapPoints = [];
        
        rides.forEach(ride => {
            try {
                const gpx = JSON.parse(ride.gpx_data);
                if (gpx.points) {
                    gpx.points.forEach((point, index) => {
                        if (index % 5 === 0) {
                            heatmapPoints.push([point.lat, point.lon, 1]);
                        }
                    });
                }
            } catch (e) {}
        });
        
        res.json({ heatmapPoints });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== 装备管理模块 ====================

app.get('/api/equipment', async (req, res) => {
    try {
        const equipment = await all('SELECT * FROM equipment ORDER BY created_at DESC');
        
        for (const item of equipment) {
            const components = await all('SELECT * FROM component_maintenance WHERE equipment_id = ?', [item.id]);
            
            const mileageResult = await get(
                'SELECT COALESCE(SUM(distance), 0) as total FROM rides WHERE date >= ?',
                [item.purchase_date || '1970-01-01']
            );
            const totalMileage = mileageResult.total;
            
            item.total_mileage = totalMileage;
            
            components.forEach(comp => {
                const usedMileage = totalMileage - comp.last_replacement_mileage;
                comp.used_mileage = usedMileage;
                comp.remaining_mileage = comp.lifespan_mileage - usedMileage;
                comp.status = comp.remaining_mileage <= 0 ? 'due' : 
                             comp.remaining_mileage <= comp.lifespan_mileage * 0.2 ? 'warning' : 'good';
            });
            
            item.components = components;
        }
        
        res.json({ equipment });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/equipment/:id', async (req, res) => {
    try {
        const item = await get('SELECT * FROM equipment WHERE id = ?', [req.params.id]);
        if (!item) return res.status(404).json({ error: '装备不存在' });
        
        const components = await all('SELECT * FROM component_maintenance WHERE equipment_id = ?', [item.id]);
        const records = await all(`
            SELECT mr.*, cm.component_name 
            FROM maintenance_records mr 
            LEFT JOIN component_maintenance cm ON mr.component_id = cm.id
            WHERE mr.equipment_id = ?
            ORDER BY mr.date DESC
        `, [item.id]);
        
        item.components = components;
        item.maintenance_records = records;
        
        res.json(item);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/equipment', async (req, res) => {
    try {
        const { name, type, brand, model, purchase_date, purchase_price, weight, notes } = req.body;
        
        const result = await run(
            `INSERT INTO equipment (name, type, brand, model, purchase_date, purchase_price, weight, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, type, brand || null, model || null,
                purchase_date || null, purchase_price ? parseFloat(purchase_price) : null,
                weight ? parseFloat(weight) : null, notes || null
            ]
        );
        
        res.json({ id: result.lastID, message: '创建成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/equipment/:id/components', async (req, res) => {
    try {
        const { component_name, installed_date, lifespan_mileage, notes } = req.body;
        
        const result = await run(
            `INSERT INTO component_maintenance (equipment_id, component_name, installed_date, installed_mileage, lifespan_mileage, last_replacement_date, last_replacement_mileage, notes)
             VALUES (?, ?, ?, 0, ?, ?, 0, ?)`,
            [
                req.params.id, component_name, installed_date || null,
                parseFloat(lifespan_mileage), installed_date || null, notes || null
            ]
        );
        
        res.json({ id: result.lastID, message: '添加成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/equipment/:id', async (req, res) => {
    try {
        const equipmentId = req.params.id;
        
        await run('DELETE FROM component_maintenance WHERE equipment_id = ?', [equipmentId]);
        await run('DELETE FROM maintenance_records WHERE equipment_id = ?', [equipmentId]);
        await run('DELETE FROM equipment WHERE id = ?', [equipmentId]);
        
        res.json({ message: '装备已删除' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/equipment/:id/components/:componentId', async (req, res) => {
    try {
        await run('DELETE FROM maintenance_records WHERE component_id = ?', [req.params.componentId]);
        await run('DELETE FROM component_maintenance WHERE id = ?', [req.params.componentId]);
        
        res.json({ message: '零件已删除' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/maintenance', async (req, res) => {
    try {
        const { equipment_id, component_id, maintenance_type, date, mileage, cost, notes } = req.body;
        
        await run(
            `INSERT INTO maintenance_records (equipment_id, component_id, maintenance_type, date, mileage, cost, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [
                equipment_id, component_id || null, maintenance_type, date,
                mileage ? parseFloat(mileage) : null, cost ? parseFloat(cost) : null, notes || null
            ]
        );
        
        if (component_id && maintenance_type === 'replacement') {
            await run(
                `UPDATE component_maintenance 
                 SET last_replacement_date = ?, last_replacement_mileage = ?
                 WHERE id = ?`,
                [date, parseFloat(mileage) || 0, component_id]
            );
        }
        
        res.json({ message: '保养记录已添加' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/maintenance/upcoming', async (req, res) => {
    try {
        const components = await all(`
            SELECT cm.*, e.name as equipment_name
            FROM component_maintenance cm
            JOIN equipment e ON cm.equipment_id = e.id
        `);
        
        const upcoming = [];
        
        for (const comp of components) {
            const mileageResult = await get(
                'SELECT COALESCE(SUM(distance), 0) as total FROM rides WHERE date >= ?',
                [comp.last_replacement_date || '1970-01-01']
            );
            const totalMileage = mileageResult.total;
            
            const usedMileage = totalMileage;
            const remaining = comp.lifespan_mileage - usedMileage;
            
            if (remaining < comp.lifespan_mileage * 0.3) {
                upcoming.push({
                    ...comp,
                    used_mileage: usedMileage,
                    remaining_mileage: remaining,
                    percentage: Math.min(100, (usedMileage / comp.lifespan_mileage) * 100)
                });
            }
        }
        
        upcoming.sort((a, b) => a.remaining_mileage - b.remaining_mileage);
        res.json({ upcoming });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== 路线规划模块 ====================

app.get('/api/routes', async (req, res) => {
    try {
        const { category } = req.query;
        let query = 'SELECT * FROM routes';
        const params = [];
        
        if (category) {
            query += ' WHERE category = ?';
            params.push(category);
        }
        
        query += ' ORDER BY created_at DESC';
        
        const routes = await all(query, params);
        
        routes.forEach(route => {
            if (route.gpx_data) {
                try {
                    route.gpx_data = JSON.parse(route.gpx_data);
                } catch (e) {}
            }
        });
        
        res.json({ routes });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/routes/:id', async (req, res) => {
    try {
        const route = await get('SELECT * FROM routes WHERE id = ?', [req.params.id]);
        if (!route) return res.status(404).json({ error: '路线不存在' });
        
        if (route.gpx_data) {
            try {
                route.gpx_data = JSON.parse(route.gpx_data);
            } catch (e) {}
        }
        
        res.json(route);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/routes', upload.single('gpx'), async (req, res) => {
    try {
        const { name, category, difficulty_rating, scenery_rating, notes } = req.body;
        
        let gpxData = null;
        let distance = null;
        let elevation = null;
        
        if (req.file) {
            const gpxContent = fs.readFileSync(req.file.path, 'utf8');
            const parsed = await parseGPX(gpxContent);
            gpxData = JSON.stringify(parsed);
            distance = parsed.totalDistance;
            elevation = parsed.totalElevation;
        }
        
        const result = await run(
            `INSERT INTO routes (name, category, distance, elevation, difficulty_rating, scenery_rating, gpx_data, notes)
             VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [
                name, category, distance, elevation,
                difficulty_rating ? parseInt(difficulty_rating) : null,
                scenery_rating ? parseInt(scenery_rating) : null,
                gpxData, notes || null
            ]
        );
        
        res.json({ id: result.lastID, message: '路线已保存' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.delete('/api/routes/:id', async (req, res) => {
    try {
        await run('DELETE FROM routes WHERE id = ?', [req.params.id]);
        res.json({ message: '删除成功' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== 骑行目标模块 ====================

app.get('/api/goals/yearly', async (req, res) => {
    try {
        const goals = await all('SELECT * FROM yearly_goals ORDER BY year DESC');
        
        for (const goal of goals) {
            const progress = await get(`
                SELECT
                    COUNT(*) as ride_count,
                    COALESCE(SUM(distance), 0) as total_distance,
                    COALESCE(SUM(elevation), 0) as total_elevation
                FROM rides
                WHERE strftime("%Y", date) = ?
            `, [goal.year.toString()]);
            
            goal.progress = {
                distance: progress.total_distance,
                distance_percentage: (progress.total_distance / goal.target_distance) * 100,
                elevation: progress.total_elevation,
                elevation_percentage: goal.target_elevation ? (progress.total_elevation / goal.target_elevation) * 100 : 0,
                rides: progress.ride_count,
                rides_percentage: goal.target_rides ? (progress.ride_count / goal.target_rides) * 100 : 0
            };
        }
        
        res.json({ goals });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/goals/yearly', async (req, res) => {
    try {
        const { year, target_distance, target_elevation, target_rides } = req.body;
        
        const existing = await get('SELECT id FROM yearly_goals WHERE year = ?', [parseInt(year)]);
        
        if (existing) {
            await run(
                `UPDATE yearly_goals 
                 SET target_distance = ?, target_elevation = ?, target_rides = ?
                 WHERE year = ?`,
                [
                    parseFloat(target_distance),
                    target_elevation ? parseFloat(target_elevation) : null,
                    target_rides ? parseInt(target_rides) : null,
                    parseInt(year)
                ]
            );
        } else {
            await run(
                `INSERT INTO yearly_goals (year, target_distance, target_elevation, target_rides)
                 VALUES (?, ?, ?, ?)`,
                [
                    parseInt(year),
                    parseFloat(target_distance),
                    target_elevation ? parseFloat(target_elevation) : null,
                    target_rides ? parseInt(target_rides) : null
                ]
            );
        }
        
        res.json({ message: '目标已设置' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.get('/api/challenges', async (req, res) => {
    try {
        const challenges = await all('SELECT * FROM challenges ORDER BY created_at DESC');
        
        for (const challenge of challenges) {
            let progress = 0;
            let rideCount = 0;
            
            if (challenge.type === 'streak') {
                const rides = await all(`
                    SELECT DISTINCT date FROM rides 
                    WHERE date >= ? AND date <= ?
                    ORDER BY date DESC
                `, [challenge.start_date, challenge.end_date]);
                
                let currentStreak = 0;
                let maxStreak = 0;
                let prevDate = null;
                
                rides.forEach(ride => {
                    const d1 = new Date(ride.date);
                    const d2 = prevDate ? new Date(prevDate) : null;
                    
                    if (d2 && (d2 - d1) === 86400000) {
                        currentStreak++;
                    } else {
                        currentStreak = 1;
                    }
                    
                    maxStreak = Math.max(maxStreak, currentStreak);
                    prevDate = ride.date;
                });
                
                progress = maxStreak;
                rideCount = rides.length;
            } else if (challenge.type === 'monthly_distance') {
                const result = await get(`
                    SELECT COALESCE(SUM(distance), 0) as total, COUNT(*) as count
                    FROM rides WHERE date >= ? AND date <= ?
                `, [challenge.start_date, challenge.end_date]);
                
                progress = result.total;
                rideCount = result.count;
            }
            
            challenge.progress = {
                current: progress,
                target: challenge.target_value,
                percentage: (progress / challenge.target_value) * 100,
                ride_count: rideCount,
                completed: progress >= challenge.target_value
            };
        }
        
        res.json({ challenges });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

app.post('/api/challenges', async (req, res) => {
    try {
        const { name, type, target_value, start_date, end_date, description } = req.body;
        
        const result = await run(
            `INSERT INTO challenges (name, type, target_value, start_date, end_date, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                name, type, parseFloat(target_value),
                start_date || null, end_date || null, description || null
            ]
        );
        
        res.json({ id: result.lastID, message: '挑战已创建' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// ==================== 辅助函数 ====================

async function updateChallengeProgress(rideId, distance, date) {
    try {
        const challenges = await all("SELECT * FROM challenges WHERE status = 'active'");
        
        for (const challenge of challenges) {
            if (challenge.start_date && date < challenge.start_date) continue;
            if (challenge.end_date && date > challenge.end_date) continue;
            
            const progressValue = challenge.type === 'streak' ? 1 : distance;
            
            await run(
                `INSERT INTO challenge_progress (challenge_id, ride_id, progress_value)
                 VALUES (?, ?, ?)`,
                [challenge.id, rideId, progressValue]
            );
        }
    } catch (err) {
        console.error('更新挑战进度失败:', err);
    }
}

// 初始化示例数据
async function initSampleData() {
    const rideCountResult = await get('SELECT COUNT(*) as count FROM rides');
    const rideCount = rideCountResult.count;
    
    if (rideCount === 0) {
        console.log('正在初始化示例数据...');
        
        const sampleRides = [
            { date: '2026-05-20', distance: 45.2, duration: 120, elevation: 350, avg_speed: 22.6, max_speed: 45.3, avg_heart_rate: 145, ride_type: '休闲骑', notes: '周末江边骑行' },
            { date: '2026-05-18', distance: 25.5, duration: 75, elevation: 120, avg_speed: 20.4, max_speed: 38.2, avg_heart_rate: 135, ride_type: '通勤', notes: '上班通勤' },
            { date: '2026-05-15', distance: 80.3, duration: 240, elevation: 850, avg_speed: 20.1, max_speed: 52.1, avg_heart_rate: 155, ride_type: '挑战', notes: '妙峰山爬坡' },
            { date: '2026-05-10', distance: 35.0, duration: 90, elevation: 200, avg_speed: 23.3, max_speed: 42.0, avg_heart_rate: 140, ride_type: '训练', notes: '间歇训练' },
            { date: '2026-04-28', distance: 60.5, duration: 180, elevation: 450, avg_speed: 20.2, max_speed: 48.5, avg_heart_rate: 148, ride_type: '休闲骑', notes: '潭柘寺骑行' }
        ];
        
        for (const ride of sampleRides) {
            await run(
                `INSERT INTO rides (date, distance, duration, elevation, avg_speed, max_speed, avg_heart_rate, ride_type, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
                [ride.date, ride.distance, ride.duration, ride.elevation, ride.avg_speed, ride.max_speed, ride.avg_heart_rate, ride.ride_type, ride.notes]
            );
        }
        
        const sampleEquipment = [
            { name: '闪电 Tarmac SL7', type: '公路车', brand: 'Specialized', model: 'Tarmac SL7 Expert', purchase_date: '2025-03-15', purchase_price: 28000, weight: 7.2, notes: '主力公路车' },
            { name: '头盔', type: '配件', brand: 'Giro', model: 'Aether MIPS', purchase_date: '2025-04-01', purchase_price: 1800, weight: 0.25, notes: '' },
            { name: '码表', type: '配件', brand: 'Garmin', model: 'Edge 840', purchase_date: '2025-04-10', purchase_price: 3200, weight: 0.1, notes: '' }
        ];
        
        for (const eq of sampleEquipment) {
            await run(
                `INSERT INTO equipment (name, type, brand, model, purchase_date, purchase_price, weight, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [eq.name, eq.type, eq.brand, eq.model, eq.purchase_date, eq.purchase_price, eq.weight, eq.notes]
            );
        }
        
        await run(
            `INSERT INTO component_maintenance (equipment_id, component_name, installed_date, installed_mileage, lifespan_mileage, last_replacement_date, last_replacement_mileage, notes)
             VALUES (?, ?, ?, 0, ?, ?, 0, ?)`,
            [1, '链条', '2025-03-15', 3000, '2025-03-15', '每3000公里更换']
        );
        await run(
            `INSERT INTO component_maintenance (equipment_id, component_name, installed_date, installed_mileage, lifespan_mileage, last_replacement_date, last_replacement_mileage, notes)
             VALUES (?, ?, ?, 0, ?, ?, 0, ?)`,
            [1, '外胎', '2025-03-15', 5000, '2025-03-15', '每5000公里更换']
        );
        await run(
            `INSERT INTO component_maintenance (equipment_id, component_name, installed_date, installed_mileage, lifespan_mileage, last_replacement_date, last_replacement_mileage, notes)
             VALUES (?, ?, ?, 0, ?, ?, 0, ?)`,
            [1, '刹车片', '2025-03-15', 4000, '2025-03-15', '每4000公里更换']
        );
        
        const sampleRoutes = [
            { name: '长安街通勤线', category: '通勤', distance: 15.5, elevation: 50, difficulty_rating: 2, scenery_rating: 3, notes: '从家到公司的通勤路线' },
            { name: '妙峰山爬坡', category: '挑战', distance: 20.5, elevation: 880, difficulty_rating: 5, scenery_rating: 4, notes: '经典爬坡路线' },
            { name: '温榆河休闲骑', category: '休闲', distance: 40.0, elevation: 100, difficulty_rating: 1, scenery_rating: 5, notes: '沿河风景优美' }
        ];
        
        for (const route of sampleRoutes) {
            await run(
                `INSERT INTO routes (name, category, distance, elevation, difficulty_rating, scenery_rating, notes)
                 VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [route.name, route.category, route.distance, route.elevation, route.difficulty_rating, route.scenery_rating, route.notes]
            );
        }
        
        await run(
            `INSERT INTO yearly_goals (year, target_distance, target_elevation, target_rides)
             VALUES (?, ?, ?, ?)`,
            [2026, 5000, 50000, 100]
        );
        
        const now = new Date();
        const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        
        await run(
            `INSERT INTO challenges (name, type, target_value, start_date, end_date, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                '连续30天骑行挑战',
                'streak',
                30,
                monthStart.toISOString().split('T')[0],
                monthEnd.toISOString().split('T')[0],
                '本月连续骑行30天'
            ]
        );
        
        await run(
            `INSERT INTO challenges (name, type, target_value, start_date, end_date, description)
             VALUES (?, ?, ?, ?, ?, ?)`,
            [
                '月度1000公里挑战',
                'monthly_distance',
                1000,
                monthStart.toISOString().split('T')[0],
                monthEnd.toISOString().split('T')[0],
                '本月骑行总里程达到1000公里'
            ]
        );
        
        console.log('示例数据已初始化');
    }
}

// 启动服务器
async function startServer() {
    await initDatabase();
    await initSampleData();
    
    app.listen(PORT, () => {
        console.log(`========================================`);
        console.log(`🚴 骑行管理平台已启动`);
        console.log(`📍 访问地址: http://localhost:${PORT}`);
        console.log(`========================================`);
    });
}

startServer().catch(err => {
    console.error('启动失败:', err);
    process.exit(1);
});
