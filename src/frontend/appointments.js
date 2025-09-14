
// Handles appointment booking and listing

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');

    // backend API URL
    const API_BASE = 'http://localhost:8000';
    // Retrieve token from localStorage (be tolerant of key naming differences)
    function getToken() {
        const token1 = localStorage.getItem('access_token');
        const token2 = localStorage.getItem('accessToken');
        if (token1) return token1;
        if (token2) {
            // migrate to access_token for compatibility
            localStorage.setItem('access_token', token2);
            return token2;
        }
        return null;
    }

    // Fetch and display appointments
    function loadAppointments() {
        appointmentsList.innerHTML = '<li>Loading appointments...</li>';
        fetch(`${API_BASE}/appointments/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => {
            if (response.status === 401) {
                // token invalid or expired
                localStorage.removeItem('access_token');
                localStorage.removeItem('accessToken');
                window.location.href = 'login.html';
                throw new Error('Unauthorized');
            }
            if (!response.ok) throw new Error('Failed to load appointments');
            return response.json();
        })
        .then(data => {
            appointmentsList.innerHTML = '';
            if (!data.length) {
                appointmentsList.innerHTML = '<li>No appointments found</li>';
                return;
            }
            data.forEach(app => {
                const li = document.createElement('li');
                li.textContent = `${app.date} ${app.time} - ${app.reason}`;
                appointmentsList.appendChild(li);
            });
        })
        .catch(err => {
            if (err.message !== 'Unauthorized') {
                appointmentsList.innerHTML = '<li>Error loading appointments</li>';
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = form.date.value;
        const time = form.time.value;
        const reason = form.reason.value;

    // disable submit while sending
    const submitBtn = form.querySelector('button[type="submit"]');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Booking...';

        fetch(`${API_BASE}/appointments/`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${getToken()}`
            },
            body: JSON.stringify({ date, time, reason })
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to book appointment');
            return response.json();
        })
        .then(response => {
            if (response.status === 401) {
                localStorage.removeItem('access_token');
                localStorage.removeItem('accessToken');
                window.location.href = 'login.html';
                throw new Error('Unauthorized');
            }
            if (!response.ok) throw new Error('Failed to book appointment');
            return response.json();
        })
        .then(data => {
            // success
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
            form.reset();
            loadAppointments();
        })
        .catch(err => {
            submitBtn.disabled = false;
            submitBtn.textContent = 'Book Appointment';
            if (err.message !== 'Unauthorized') alert('Error booking appointment');
        });
    });

    // Display logged-in user
    const userLabel = document.getElementById('userLabel');
    const userEmail = localStorage.getItem('user_email') || localStorage.getItem('userEmail');
    if (userLabel) userLabel.textContent = userEmail ? `Signed in as ${userEmail}` : '';

    loadAppointments();
});
