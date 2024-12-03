const express = require('express');
const router = express.Router();
const sql = require('../db/connection'); // ใช้การเชื่อมต่อ SQL Server

// ดึงข้อมูลหนังสือทั้งหมด
router.get('/books', async (req, res) => {
    try {
        const query = 'SELECT * FROM Books';
        const result = await sql.query(query);
        res.json(result.recordset);
    } catch (err) {
        console.error('Error fetching books:', err);
        res.status(500).json({ message: 'Error fetching books' });
    }
});

// เพิ่มหนังสือใหม่
router.post('/books', async (req, res) => {
    const { title, author, category, status } = req.body;

    if (!title || !author || !category) {
        return res.status(400).json({ message: 'Missing required fields' });
    }

    try {
        const query = `
            INSERT INTO Books (Title, Author, Category, Status)
            VALUES (@Title, @Author, @Category, @Status)
        `;
        const request = new sql.Request();
        request.input('Title', sql.VarChar, title);
        request.input('Author', sql.VarChar, author);
        request.input('Category', sql.VarChar, category);
        request.input('Status', sql.Int, status || 1);

        await request.query(query);
        res.status(201).json({ message: 'Book added successfully' });
    } catch (err) {
        console.error('Error adding book:', err);
        res.status(500).json({ message: 'Error adding book' });
    }
});

// ลบหนังสือ
router.delete('/books/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const query = 'DELETE FROM Books WHERE BookID = @BookID';
        const request = new sql.Request();
        request.input('BookID', sql.Int, id);

        await request.query(query);
        res.json({ message: 'Book deleted successfully' });
    } catch (err) {
        console.error('Error deleting book:', err);
        res.status(500).json({ message: 'Error deleting book' });
    }
});

module.exports = router;
