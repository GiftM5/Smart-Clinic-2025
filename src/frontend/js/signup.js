document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const message = document.getElementById("message");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    message.style.display = 'block';
    message.style.color = '#333';
    message.textContent = 'Creating account...';

    // The backend expects a JSON object. We create one here.
    const userData = {
      full_name: document.getElementById("signupName").value,
      email: document.getElementById("signupEmail").value,
      password: document.getElementById("signupPassword").value,
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        
        message.style.color = '#dc2626';
        message.textContent = data.detail || "An error occurred during sign up.";
      } else {
        message.style.color = 'green';
        message.textContent = 'Account created successfully! Redirecting to login...';

        setTimeout(() => {
          window.location.href = "login.html";
        }, 2000);
      }
    } catch (error) {
      message.style.color = '#dc2626';
      message.textContent = "Cannot connect to the server. Please try again later.";
      console.error("Signup error:", error);
    }
  });
});