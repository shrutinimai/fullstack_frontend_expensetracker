const form = document.getElementById("signupForm");
const error = document.getElementById("error");

form.addEventListener("submit", function(event) {
    event.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value.trim();

    if (!name || !email || !password) {
        error.textContent = "All fields are mandatory!";
        return;
    }

    error.textContent = "";  
    alert("Signup successful!");
    form.reset();
});
