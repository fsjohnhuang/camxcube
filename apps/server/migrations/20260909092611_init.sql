-- Device table
CREATE TABLE device (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mac TEXT UNIQUE NOT NULL,
    ip TEXT,
    name TEXT,
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME,
    -- status: 1=online, 2=offline, 0=deleted
    status INTEGER DEFAULT 1 CHECK (status IN (0, 1, 2)),
    battery INTEGER,
    synced_at INTEGER,
    location TEXT
);

-- File table
CREATE TABLE file (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    device_id INTEGER NOT NULL,
    path TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (device_id) REFERENCES device(id)
);
