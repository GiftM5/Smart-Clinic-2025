document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault(); 

    // Show the error message element
    errorMessage.style.display = 'block';
    errorMessage.textContent = 'Logging in...';

    // The backend expects x-www-form-urlencoded data not JSON.
    const formData = new URLSearchParams();
    formData.append('username', document.getElementById('username').value);
    formData.append('password', document.getElementById('password').value);

    try {
      // Send the request to your FastAPI backend
      const response = await fetch("http://127.0.0.1:8000/auth/login", {
        method: "POST",
        body: formData, 
      });

      const data = await response.json();

      if (!response.ok) {
        errorMessage.textContent = data.detail || "Incorrect email or password.";
      } else {
        errorMessage.style.color = 'green';
        errorMessage.textContent = 'Success! Redirecting...';
        
  localStorage.setItem("accessToken", data.access_token);
  // store logged-in email for dashboard/profile
  localStorage.setItem('user_email', document.getElementById('username').value);
        
        setTimeout(() => {
          window.location.href = "dashboard.html"; // The page to go to after login
        }, 1000);
      }
    } catch (error) {
      errorMessage.textContent = "Cannot connect to the server. Please try again later.";
      console.error("Login error:", error);
    }
  });
});