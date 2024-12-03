const apiUrl = 'http://localhost:3000/api/books';

// ดึงข้อมูลหนังสือทั้งหมด
async function fetchBooks() {
    try {
        const response = await fetch(apiUrl);
        const books = await response.json();
        populateBookTable(books);
    } catch (err) {
        console.error('Error fetching books:', err);
    }
}

// เติมข้อมูลในตาราง
function populateBookTable(books) {
    const tableBody = document.getElementById('bookTable').querySelector('tbody');
    tableBody.innerHTML = '';

    books.forEach(book => {
        const row = document.createElement('tr');

        row.innerHTML = `
            <td>${book.BookID}</td>
            <td>${book.Title}</td>
            <td>${book.Author}</td>
            <td>${book.Category}</td>
            <td>${book.Status === 1 ? 'Available' : 'Checked Out'}</td>
        `;

        tableBody.appendChild(row);
    });
}

// เริ่มต้นดึงข้อมูลหนังสือเมื่อโหลดหน้าเว็บ
fetchBooks();
