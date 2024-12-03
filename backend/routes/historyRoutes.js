const express = require('express');
const router = express.Router();
const sql = require('../db/connection');

// ยืมหนังสือ
router.post('/history/borrow', async (req, res) => {
    const { userId, bookId, borrowDate, dueDate } = req.body;

    try {
        const checkQuery = 'SELECT Status FROM Books WHERE BookID = @BookID';
        const checkRequest = new sql.Request();
        checkRequest.input('BookID', sql.Int, bookId);
        const checkResult = await checkRequest.query(checkQuery);

        if (checkResult.recordset[0].Status === 2) {
            return res.status(400).json({ message: 'Book is already borrowed' });
        }

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
    } catch (err) {
        console.error('Error borrowing book:', err);
        res.status(500).json({ message: 'Error borrowing book' });
    }
});

// คืนหนังสือ
router.post('/history/return', async (req, res) => {
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
