import * as mysql from 'mysql2/promise';

let connectionPool: mysql.Pool;

export async function db(): Promise<mysql.Pool> {
  if (!connectionPool) {
    connectionPool = mysql.createPool({
      host: process.env.DB_HOST, // Replace with your hostname
      user: process.env.DB_USER, // Replace with your username
      password: process.env.DB_PASS, // Replace with your password
      database: process.env.DB_NAME, 
      waitForConnections: true, // Ensures connection pool doesn't overflow
      connectionLimit: 10, // Maximum number of concurrent connections
      queueLimit: 0,
    });
    console.log('Connected to MySQL database!');
  }
  return connectionPool;
}
