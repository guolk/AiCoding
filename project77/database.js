const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'cycling.db');
const db = new sqlite3.Database(dbPath);

function run(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) reject(err);
            else resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
}

function get(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.get(sql, params, (err, row) => {
            if (err) reject(err);
            else resolve(row);
        });
    });
}

function all(sql, params = []) {
    return new Promise((resolve, reject) => {
        db.all(sql, params, (err, rows) => {
            if (err) reject(err);
            else resolve(rows);
        });
    });
}

function exec(sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) reject(err);
            else resolve();
        });
    });
}

async function initDatabase() {
    await exec(`
        CREATE TABLE IF NOT EXISTS rides (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            date TEXT NOT NULL,
            distance REAL NOT NULL,
            duration INTEGER NOT NULL,
            elevation REAL DEFAULT 0,
            avg_speed REAL,
            max_speed REAL,
            avg_heart_rate INTEGER,
            ride_type TEXT,
            gpx_data TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS ride_photos (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            ride_id INTEGER NOT NULL,
            filename TEXT NOT NULL,
            filepath TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS equipment (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            brand TEXT,
            model TEXT,
            purchase_date TEXT,
            purchase_price REAL,
            weight REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS component_maintenance (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id INTEGER NOT NULL,
            component_name TEXT NOT NULL,
            installed_date TEXT,
            installed_mileage REAL DEFAULT 0,
            lifespan_mileage REAL NOT NULL,
            last_replacement_date TEXT,
            last_replacement_mileage REAL DEFAULT 0,
            notes TEXT,
            FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS maintenance_records (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            equipment_id INTEGER NOT NULL,
            component_id INTEGER,
            maintenance_type TEXT NOT NULL,
            date TEXT NOT NULL,
            mileage REAL,
            cost REAL,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (equipment_id) REFERENCES equipment(id) ON DELETE CASCADE,
            FOREIGN KEY (component_id) REFERENCES component_maintenance(id) ON DELETE SET NULL
        );

        CREATE TABLE IF NOT EXISTS routes (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            category TEXT NOT NULL,
            distance REAL,
            elevation REAL,
            difficulty_rating INTEGER,
            scenery_rating INTEGER,
            gpx_data TEXT,
            notes TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS yearly_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            year INTEGER NOT NULL UNIQUE,
            target_distance REAL NOT NULL,
            target_elevation REAL,
            target_rides INTEGER,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS challenges (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            type TEXT NOT NULL,
            target_value REAL NOT NULL,
            start_date TEXT,
            end_date TEXT,
            status TEXT DEFAULT 'active',
            description TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS challenge_progress (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            challenge_id INTEGER NOT NULL,
            ride_id INTEGER NOT NULL,
            progress_value REAL NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (challenge_id) REFERENCES challenges(id) ON DELETE CASCADE,
            FOREIGN KEY (ride_id) REFERENCES rides(id) ON DELETE CASCADE
        );
    `);
    
    console.log('数据库初始化完成');
}

module.exports = {
    db,
    run,
    get,
    all,
    exec,
    initDatabase
};
