
// Handles appointment booking and listing

document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('appointmentForm');
    const appointmentsList = document.getElementById('appointmentsList');

    // backend API URL
    const API_BASE = 'http://localhost:8000';
    // Retrieve token from localStorage (assumes login.html sets it)
    function getToken() {
        return localStorage.getItem('access_token');
    }

    // Fetch and display appointments
    function loadAppointments() {
        fetch(`${API_BASE}/appointments/`, {
            headers: {
                'Authorization': `Bearer ${getToken()}`
            }
        })
        .then(response => {
            if (!response.ok) throw new Error('Failed to load appointments');
            return response.json();
        })
        .then(data => {
            appointmentsList.innerHTML = '';
            data.forEach(app => {
                const li = document.createElement('li');
                li.textContent = `${app.date} ${app.time} - ${app.reason}`;
                appointmentsList.appendChild(li);
            });
        })
        .catch(err => {
            appointmentsList.innerHTML = '<li>Error loading appointments</li>';
        });
    }

    // Handle form submission
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        const date = form.date.value;
        const time = form.time.value;
        const reason = form.reason.value;

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
        .then(data => {
            alert('Appointment booked!');
            form.reset();
            loadAppointments();
        })
        .catch(err => {
            alert('Error booking appointment');
        });
    });

    loadAppointments();
});
