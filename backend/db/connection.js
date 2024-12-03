const sql = require('mssql');
const dotenv = require('dotenv');
dotenv.config();

const config = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_HOST,
    database: process.env.DB_NAME, // ใช้ค่า DB_NAME จาก .env
    port: parseInt(process.env.DB_PORT, 10),
    options: {
        encrypt: false,
        enableArithAbort: true
    }
};

const connectToDatabase = async () => {
    try {
        await sql.connect(config);
        console.log('Connected to SQL Server!');
    } catch (err) {
        console.error('Error connecting to SQL Server:', err);
    }
};

connectToDatabase();

module.exports = sql;
