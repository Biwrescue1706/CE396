const express = require('express');
const router = express.Router();
const sql = require('../db/connection'); // ใช้การเชื่อมต่อ SQL Server

// ดึงข้อมูลผู้ใช้ทั้งหมด
router.get('/users', async (req, res) => {
    try {
        const query = 'SELECT * FROM Users';
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ message: 'Error fetching users' });
    }
});

// Login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const query = 'SELECT * FROM Users WHERE Email = @Email AND Password = @Password';
        const request = new sql.Request();
        request.input('Email', sql.VarChar, email);
        request.input('Password', sql.VarChar, password);

        const result = await request.query(query);
        if (result.recordset.length > 0) {
            res.json({ message: 'Login successful', user: result.recordset[0] });
        } else {
            res.status(401).json({ message: 'Invalid credentials' });
        }
    } catch (err) {
        console.error('Error during login:', err);
        res.status(500).json({ message: 'Error during login' });
    }
});

// Register a new user
router.post('/register', async (req, res) => {
    const { fname, lname, email, password } = req.body;

    if (!fname || !lname || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        const pool = await sql.connect();

        // ตรวจสอบว่าอีเมลมีอยู่แล้วหรือไม่
        const checkRequest = pool.request();
        checkRequest.input('Email', sql.VarChar, email);

        const checkQuery = 'SELECT * FROM Users WHERE Email = @Email';
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset.length > 0) {
            return res.status(400).json({ message: 'Email already exists' });
        }

        // เข้ารหัสรหัสผ่าน
        const hashedPassword = await bcrypt.hash(password, 10);

        // เพิ่มผู้ใช้ใหม่
        const insertRequest = pool.request();
        insertRequest.input('FName', sql.VarChar, fname);
        insertRequest.input('LName', sql.VarChar, lname);
        insertRequest.input('Email', sql.VarChar, email);
        insertRequest.input('Password', sql.VarChar, hashedPassword);

        const insertQuery = `
            INSERT INTO Users (FName, LName, Email, Password)
            VALUES (@FName, @LName, @Email, @Password)
        `;
        await insertRequest.query(insertQuery);

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        console.error('Error during registration:', err);
        res.status(500).json({ message: 'Error registering user' });
    }
});

// Borrow a book
router.post('/borrow', async (req, res) => {
    const { userId, bookId, borrowDate, dueDate } = req.body;

    try {
        const checkQuery = 'SELECT Status FROM Books WHERE BookID = @BookID';
        const checkRequest = new sql.Request();
        checkRequest.input('BookID', sql.Int, bookId);

        const checkResult = await checkRequest.query(checkQuery);
        if (checkResult.recordset[0].Status === 2) {
            res.status(400).json({ message: 'Book is already borrowed' });
        } else {
            const updateQuery = 'UPDATE Books SET Status = 2 WHERE BookID = @BookID';
            const insertQuery = `
                INSERT INTO History (UserID, BookID, BorrowDate, DueDate, OverdueStatus)
                VALUES (@UserID, @BookID, @BorrowDate, @DueDate, 2)
            `;
            const request = new sql.Request();
            request.input('UserID', sql.Int, userId);
            request.input('BookID', sql.Int, bookId);
            request.input('BorrowDate', sql.Date, borrowDate);
            request.input('DueDate', sql.Date, dueDate);

            await request.query(updateQuery);
            await request.query(insertQuery);
            res.json({ message: 'Book borrowed successfully' });
        }
    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).json({ message: 'Error borrowing book' });
    }
});

// Return a book
router.post('/return', async (req, res) => {
    const { userId, bookId, returnDate } = req.body;

    try {
        const updateHistoryQuery = `
            UPDATE History
            SET ReturnDate = @ReturnDate, OverdueStatus = CASE WHEN DueDate < @ReturnDate THEN 1 ELSE 2 END
            WHERE UserID = @UserID AND BookID = @BookID AND ReturnDate IS NULL
        `;
        const updateBookQuery = 'UPDATE Books SET Status = 1 WHERE BookID = @BookID';

        const request = new sql.Request();
        request.input('ReturnDate', sql.Date, returnDate);
        request.input('UserID', sql.Int, userId);
        request.input('BookID', sql.Int, bookId);

        const result = await request.query(updateHistoryQuery);
        if (result.rowsAffected[0] === 0) {
            res.status(400).json({ message: 'No active borrow record found for this book' });
        } else {
            await request.query(updateBookQuery);
            res.json({ message: 'Book returned successfully' });
        }
    } catch (err) {
        console.error('Error returning book:', err);
        res.status(500).json({ message: 'Error returning book' });
    }
});

module.exports = router;
