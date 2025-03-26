const signupForm = document.getElementById("signupForm");
const signupError = document.getElementById("signupError");

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            signupError.textContent = "All fields are mandatory!";
            return;
        }

        signupError.textContent = "";

        try {
            const response = await axios.post("http://localhost:3000/user/signup", {
                name,
                email,
                password
            });

            alert("Signup successful!");
            console.log("Response:", response.data);
            signupForm.reset();

        } catch (err) {
            console.error("Error:", err);
            signupError.textContent = err.response?.data?.message || "Something went wrong!";
        }
    });
}

const loginForm = document.getElementById("loginForm");
const loginError = document.getElementById("loginError");

if (loginForm) {
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            loginError.textContent = "All fields are mandatory!";
            return;
        }

        loginError.textContent = "";

        try {
            const response = await axios.post("http://localhost:3000/user/login", {
                email,
                password
            });

            alert("Login successful!");
            console.log("Response:", response.data);
            loginForm.reset();

        } catch (err) {
            console.error("Error:", err);

            if (err.response) {
                const { message } = err.response.data;

                if (message === "User doesn't exist") {
                    loginError.textContent = "User doesn't exist!";
                } else if (message === "Incorrect password") {
                    loginError.textContent = "Incorrect password!";
                } else {
                    loginError.textContent = "Something went wrong!";
                }
            }
        }
    });
}

function showSignup() {
    document.getElementById("login").style.display = "none";
    document.getElementById("signup").style.display = "block";
}

function showLogin() {
    document.getElementById("signup").style.display = "none";
    document.getElementById("login").style.display = "block";
}
