const signupForm = document.getElementById("signupForm");
const loginForm = document.getElementById("loginForm");

if (signupForm) {
    signupForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const name = document.getElementById("name").value.trim();
        const email = document.getElementById("email").value.trim();
        const password = document.getElementById("password").value.trim();

        if (!name || !email || !password) {
            alert("All fields are mandatory!");
            return;
        }

        try {
            await axios.post("http://localhost:3000/user/signup", {
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
    loginForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value.trim();

        if (!email || !password) {
            alert("All fields are mandatory!");
            return;
        }

        try {
            const response = await axios.post("http://localhost:3000/user/login", {
                email, password
            });

            const token = response.data.token;  
            localStorage.setItem("token", token);  

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
    expenseForm.addEventListener("submit", async function(event) {
        event.preventDefault();

        const money = document.getElementById("amount").value.trim();
        const description = document.getElementById("description").value.trim();
        const category = document.getElementById("category").value;

        console.log("Sending Expense:", { money, description, category });  

        if (!money || !description || !category) {
            alert("Please fill all fields!");
            return;
        }

        try {
            const token = localStorage.getItem("token");
            if (!token) {
                console.error("No token found!");
                alert("You are not authorized. Please login.");
                return;
            }

            console.log("Token being sent:", token);  
            const response = await axios.post("http://localhost:3000/expense", {
                money, description, category
            },
            {
                headers: { Authorization: `Bearer ${localStorage.getItem("token")}` }            });

            console.log("Response:", response);  
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
            console.error("No token found!");
            alert("You are not authorized. Please login.");
            return;
        }

        const response = await axios.get("http://localhost:3000/expense", {
            headers: { Authorization: `Bearer ${token}` }  
        });

        const expensesList = document.getElementById("expensesList");
        expensesList.innerHTML = "";

        response.data.forEach(expense => {
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
            console.error("No token found!");
            alert("You are not authorized. Please login.");
            return;
        }

        await axios.delete(`http://localhost:3000/expense/${id}`, {
            headers: { Authorization: `Bearer ${token}` }   
        });

        fetchExpenses();   

    } catch (error) {
        console.error("Error deleting expense:", error);
    }
}
function showSignup() {
    document.getElementById("signup").style.display = "block";
    document.getElementById("login").style.display = "none";
}

function showLogin() {
    document.getElementById("signup").style.display = "none";
    document.getElementById("login").style.display = "block";
}
