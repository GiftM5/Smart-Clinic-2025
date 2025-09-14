document.addEventListener("DOMContentLoaded", () => {
  const signupForm = document.getElementById("signupForm");
  const message = document.getElementById("message");

  signupForm.addEventListener("submit", async (e) => {
    e.preventDefault();

    message.style.display = 'block';
    message.style.color = '#333';
    message.textContent = 'Creating account...';


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
        message.textContent = 'Account created successfully! Logging you in...';

        const formBody = new URLSearchParams();
        formBody.append('username', userData.email);
        formBody.append('password', userData.password);

        try {
          const loginRes = await fetch('http://127.0.0.1:8000/auth/login', {
            method: 'POST',
            body: formBody
          });
          const loginData = await loginRes.json();
          if (!loginRes.ok) {
            message.style.color = '#dc2626';
            message.textContent = loginData.detail || 'Auto-login failed; please login manually.';
            setTimeout(() => window.location.href = 'login.html', 2000);
          } else {
            
            localStorage.setItem('accessToken', loginData.access_token);
            localStorage.setItem('user_email', userData.email);
            localStorage.setItem('user_fullname', userData.full_name);
            message.style.color = 'green';
            message.textContent = 'Logged in! Redirecting to appointments...';
            setTimeout(() => window.location.href = 'appointments.html', 1000);
          }
        } catch (err) {
          console.error('Auto-login error:', err);
          message.style.color = '#dc2626';
          message.textContent = 'Auto-login failed; please login manually.';
          setTimeout(() => window.location.href = 'login.html', 2000);
        }
      }
    } catch (error) {
      message.style.color = '#dc2626';
      message.textContent = "Cannot connect to the server. Please try again later.";
      console.error("Signup error:", error);
    }
  });
});