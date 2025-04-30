const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            alert("All fields are mandatory!");
            return;
        }

        try {
            await axios.post("http://localhost:4200/user/signup", {
                name, email, password
            });

            alert("Signup successful!");
            signupForm.reset();

            showLogin();

        } catch (error) {
            console.error("Signup error:", error);
            alert("Failed to signup!");
        }
    });
}

if (loginForm) {
    loginForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            alert("All fields are mandatory!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:4200/user/login", {
                email, password
            });

            const { token, refreshToken, externalCustomerId } = response.data;

            localStorage.setItem("token", token);
            localStorage.setItem("refreshToken", refreshToken);
            localStorage.setItem("externalCustomerId", externalCustomerId);
        
        
            alert("Login successful!");
            window.location.href = "expense.html";

        } catch (error) {
            console.error("Login error:", error);
            alert("Invalid credentials!");
        }
    });
}

const expenseForm = document.getElementById("expenseForm");

if (expenseForm) {
    expenseForm.addEventListener("submit", async function (event) {
        event.preventDefault();

        const money = document.getElementById("amount").value.trim();
        const description = document.getElementById("description").value.trim();
        const category = document.getElementById("category").value;

        if (!money || !description || !category) {
            alert("Please fill all fields!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                alert("You are not authorized. Please login.");
                window.location.href = "login.html";  

                return;
            }

            await axios.post("http://localhost:4200/expense", {
                money, description, category
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });

            fetchExpenses();
            expenseForm.reset();

        } catch (error) {
            console.error("Expense error:", error);
            alert("Failed to add expense!");
        }
    });

    window.addEventListener('DOMContentLoaded', fetchExpenses);
}

async function fetchExpenses() {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not authorized. Please login.");
            window.location.href = "login.html";  

            return;
        }

        const response = await axios.get("http://localhost:4200/expense", {
            headers: { Authorization:` Bearer ${token}` }
        });

        const expenses = response.data.expenses || response.data;
        const isPremium = response.data.isPremiumUser;

        const statusDiv = document.getElementById("premiumStatus");
        const premiumBtn = document.getElementById("buyPremiumBtn");
        const msgDiv = document.getElementById("paymentMessage");

        const urlParams = new URLSearchParams(window.location.search);
        const orderIdFromRedirect = urlParams.get("order_id");

        if (isPremium === "YES") {
            if (statusDiv) statusDiv.textContent = "You are a Premium User ✅";

            if (premiumBtn) premiumBtn.style.display = "none";


            //const urlParams = new URLSearchParams(window.location.search);
        //const orderIdFromRedirect = urlParams.get("order_id");


            if (msgDiv && orderIdFromRedirect) {
                msgDiv.textContent = "🎉 Payment successful! Premium Activated.";
                msgDiv.style.display = "block";
                msgDiv.style.color = "green";
            }

        } else {
            if (statusDiv) statusDiv.textContent = "";
            if (premiumBtn) premiumBtn.style.display = "inline-block";
        }

        const expensesList = document.getElementById("expensesList");
        expensesList.innerHTML = "";

        expenses.forEach(expense => {
            const li = document.createElement("li");
            li.textContent = `${expense.money} - ${expense.category} - ${expense.description}`;

            const deleteBtn = document.createElement("button");
            deleteBtn.textContent = "Delete";
            deleteBtn.onclick = () => deleteExpense(expense.id);
            deleteBtn.style.marginLeft = "10px";

            li.appendChild(deleteBtn);
            expensesList.appendChild(li);
        });

    } catch (error) {
        console.error("Error fetching expenses:", error);
    }
}


async function deleteExpense(id) {
    try {
        const token = localStorage.getItem("token");
        if (!token) {
            alert("You are not authorized. Please login.");
            window.location.href = "login.html";  

            return;
        }

        await axios.delete(`http://localhost:4200/expense/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });

        fetchExpenses();

    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}

function showLogin() {
    const loginSection = document.getElementById("login");
    const signupSection = document.getElementById("signup");

    if (loginSection && signupSection) {
        loginSection.style.display = "block";
        signupSection.style.display = "none";
    }
}

function showSignup() {
    const loginSection = document.getElementById("login");
    const signupSection = document.getElementById("signup");

    if (loginSection && signupSection) {
        loginSection.style.display = "none";
        signupSection.style.display = "block";
    }
}
