document.getElementById("registerForm").addEventListener("submit", function (e) {
    e.preventDefault();

    // ดึงค่าจากฟอร์ม
    const fname = document.getElementById("fname").value;
    const lname = document.getElementById("lname").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    // ส่งข้อมูลไปยัง API
    fetch('http://localhost:3000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ fname, lname, email, password }),
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Email already exists');
            }
            return response.json();
        })
        .then(data => {
            document.getElementById("message").textContent = data.message;
            document.getElementById("message").style.color = "green";

            // เปลี่ยนเส้นทางไปหน้า Login
            setTimeout(() => {
                window.location.href = "login.html";
            }, 2000);
        })
        .catch(error => {
            console.error(error);
            document.getElementById("message").textContent = "Registration failed: " + error.message;
            document.getElementById("message").style.color = "red";
        });
});
