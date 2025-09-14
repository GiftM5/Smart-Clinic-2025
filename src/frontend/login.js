// login.js - sends credentials to backend and stores access token

const API_BASE = 'http://localhost:8000';

document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('loginForm');

  form.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username: email, password })
    })
    .then(async res => {
      if (!res.ok) {
        const err = await res.text();
        throw new Error(err || 'Login failed');
      }
      return res.json();
    })
    .then(data => {
      // backend expected to return access token as { access_token: '...', token_type: 'bearer' }
      if (data.access_token) {
        localStorage.setItem('access_token', data.access_token);
        // optionally store user email
        localStorage.setItem('user_email', email);
        window.location.href = 'appointments.html';
      } else {
        alert('Login succeeded but no token returned');
      }
    })
    .catch(err => {
      console.error(err);
      alert('Login failed: ' + err.message);
    });
  });
});
