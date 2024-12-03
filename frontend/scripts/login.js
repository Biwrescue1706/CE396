document.getElementById("loginForm").addEventListener("submit", function (e) {
    e.preventDefault();

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    fetch('http://localhost:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Invalid credentials');
            }
            return response.json();
        })
        .then(data => {
            console.log(data);
            document.getElementById("message").textContent = "Login successful!";
            setTimeout(() => {
                window.location.href = "dashboard.html"; // เปลี่ยนหน้าไป Dashboard
            }, 1000);
        })
        .catch(error => {
            console.error(error);
            document.getElementById("message").textContent = "Login failed!";
        });
});
