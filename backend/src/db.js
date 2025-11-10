const mysql = require('mysql2/promise');

const pool = mysql.createPool({
  host: process.env.MYSQL_HOST || 'localhost',
  port: Number(process.env.MYSQL_PORT || 3306),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'finderhub',
  waitForConnections: true,
  connectionLimit: Number(process.env.MYSQL_CONNECTION_LIMIT || 10),
  queueLimit: 0,
});

async function ensureTables() {
  const createUserTable = `
    CREATE TABLE IF NOT EXISTS user (
      id int NOT NULL AUTO_INCREMENT,
      email VARCHAR(255) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      name VARCHAR(255) NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'user',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createItemTable = `
    CREATE TABLE IF NOT EXISTS item (
      id int NOT NULL AUTO_INCREMENT,
      name VARCHAR(255) NOT NULL,
      found_date DATE NOT NULL,
      location VARCHAR(255) NOT NULL,
      image_url VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      created_by int NOT NULL,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      updated_by int NOT NULL,
      deleted_at TIMESTAMP NULL,
      deleted_by int NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `

  const createLostItemTable = `
    CREATE TABLE IF NOT EXISTS lost_item (
      id INT NOT NULL AUTO_INCREMENT,
      title VARCHAR(255) NOT NULL,
      description TEXT NOT NULL,
      status ENUM('lost', 'found', 'returned') NOT NULL DEFAULT 'lost',
      location VARCHAR(255) NULL,
      image_url VARCHAR(500) NULL,
      contact_name VARCHAR(255) NULL,
      contact_phone VARCHAR(50) NULL,
      tags TEXT NULL,
      reported_at DATETIME NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      created_by INT NULL,
      updated_by INT NULL,
      PRIMARY KEY (id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `;

  const createSimpleUserData = `
    INSERT INTO user (email, password_hash, name, role)
    SELECT 'admin@1', '$2a$12$NaZuypFd3AmadVWpW8gsD.DoCco./dHkx/pTzQYU65EAh70ppiJfa', 'Admin', 'admin'
    WHERE NOT EXISTS (SELECT 1 FROM user WHERE email = 'admin@1');
  `

  const connection = await pool.getConnection();
  try {
    await connection.query(createUserTable);
    await connection.query(createItemTable);
    await connection.query(createLostItemTable);
    await connection.query(createSimpleUserData);
  } finally {
    connection.release();
  }
}

module.exports = {
  pool,
  ensureTables,
};

