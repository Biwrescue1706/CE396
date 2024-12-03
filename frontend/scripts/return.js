document.getElementById("returnForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const userId = document.getElementById("userId").value;
    const bookId = document.getElementById("bookId").value;
    const returnDate = document.getElementById("returnDate").value;

    fetch('http://localhost:3000/api/return', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, bookId, returnDate }),
    })
        .then(response => response.json())
        .then(data => {
            document.getElementById("message").textContent = data.message;
        })
        .catch(error => {
            console.error(error);
            document.getElementById("message").textContent = "Error returning book!";
        });
});