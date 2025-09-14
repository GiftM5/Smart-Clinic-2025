document.addEventListener("DOMContentLoaded", () => {
    
    // This part stays the same for now.
    /*
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        window.location.href = "login.html";
        return;
    }
    */

    // All your element references stay the same.
    const userNameDisplay = document.getElementById("userName");
    const profileNameDisplay = document.getElementById("profileName");
    const logoutButton = document.getElementById("logoutButton");
    const triageForm = document.getElementById("triageForm");
    const triageResultContainer = document.getElementById("triageResult");
    
    // Your simulated user data stays the same for now.
    const mockUserData = {
        fullName: "Jessica Zulu",
        email: "jessica.zulu@example.com",
        healthPoints: 240,
    };
    
    userNameDisplay.textContent = mockUserData.fullName.split(' ')[0]; 
    profileNameDisplay.textContent = mockUserData.fullName;
    document.getElementById('profileEmail').textContent = mockUserData.email;
    document.getElementById('healthPoints').textContent = mockUserData.healthPoints;

    // The logout button logic stays the same.
    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("accessToken");
        window.location.href = "login.html";
    });


    triageForm.addEventListener("submit", async (e) => { // Added 'async'
        e.preventDefault();
        
        // Update UI to show analysis is in progress
        triageResultContainer.style.display = 'block';
        triageResultContainer.innerHTML = `<p>Analyzing your symptoms with Gemini AI...</p>`;
        triageResultContainer.className = 'triage-result'; // Reset any previous color styling

        // Step 1: Gather all the data from the form fields
        const symptomsData = {
            symptoms: document.getElementById("symptoms").value,
            // Use parseFloat/parseInt and handle empty inputs by sending `null`
            temperature_c: parseFloat(document.getElementById("temperature").value) || null,
            heart_rate_bpm: parseInt(document.getElementById("heartRate").value) || null,
        };

        try {
            // Step 2: Send the data to YOUR FastAPI backend (not directly to Google)
            const response = await fetch("http://127.0.0.1:8000/triage/check", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    // When user management is fixed, you will uncomment and add the token:
                    // "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify(symptomsData) // Convert the JavaScript object to a JSON string
            });

            const result = await response.json(); // Get the JSON response from your backend

            if (!response.ok) {
                // If the backend returned an error (like 400 or 500)
                displayError(result.detail || "An unknown error occurred.");
            } else {
                // If the backend returned a successful response (200 OK)
                displayTriageResult(result);
            }
        } catch (error) {
            // This 'catch' block handles network errors, like if the backend is offline
            displayError("Could not connect to the server. Please check your connection and try again.");
            console.error("Fetch Error:", error);
        }
    });
    
    // This function for displaying the result stays the same, as it's still needed.
    function displayTriageResult(result) {
        triageResultContainer.className = 'triage-result'; // Reset classes
        triageResultContainer.classList.add(`severity-${result.severity}`);
        
        triageResultContainer.innerHTML = `
            <h4>Recommendation: ${result.severity.charAt(0).toUpperCase() + result.severity.slice(1)}</h4>
            <p>${result.recommendation}</p>
            <strong>Reasons:</strong>
            <ul>
                ${result.reasons.map(reason => `<li>${reason}</li>`).join('')}
            </ul>
        `;
    }

    function displayError(message) {
        triageResultContainer.className = 'triage-result severity-urgent'; // Use the red "urgent" style for errors
        triageResultContainer.innerHTML = `<h4>Error</h4><p>${message}</p>`;
    }


});