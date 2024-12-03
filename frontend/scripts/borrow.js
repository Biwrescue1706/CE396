document.getElementById("borrowForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const userId = document.getElementById("userId").value;
    const bookId = document.getElementById("bookId").value;
    const borrowDate = document.getElementById("borrowDate").value;
    const dueDate = document.getElementById("dueDate").value;

    fetch('http://localhost:3000/api/borrow', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId, borrowDate, dueDate }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("message").textContent = data.message;
        })
        .catch(error => {
            console.error(error);
            document.getElementById("message").textContent = "Error borrowing book!";
        });
});
