(function () {
  const token = localStorage.getItem("token");
  if (!token) {
    alert("Please login first.");
    window.location.href = "login.html"; // or your actual login page
  }
})();