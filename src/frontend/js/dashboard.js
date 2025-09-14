document.addEventListener("DOMContentLoaded", () => {
    
    /*
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
        // If no token, redirect to login page
        window.location.href = "login.html";
        return; // Stop executing the rest of the script
    }
    */

    //DOM ELEMENT REFERENCES
    const userNameDisplay = document.getElementById("userName");
    const profileNameDisplay = document.getElementById("profileName");
    const logoutButton = document.getElementById("logoutButton");
    const triageForm = document.getElementById("triageForm");
    const triageResultContainer = document.getElementById("triageResult");
    
    // Try to read user info from localStorage (set at login/signup)
    const storedFullName = localStorage.getItem('user_fullname');
    const storedEmail = localStorage.getItem('user_email');
    const storedHealthPoints = localStorage.getItem('user_healthPoints');

    const userData = {
        fullName: storedFullName || 'Mock User',
        email: storedEmail || 'mock@example.com',
        healthPoints: storedHealthPoints ? Number(storedHealthPoints) : 240,
    };

    userNameDisplay.textContent = userData.fullName.split(' ')[0]; 
    profileNameDisplay.textContent = userData.fullName;
    document.getElementById('profileEmail').textContent = userData.email;
    document.getElementById('healthPoints').textContent = userData.healthPoints;


    logoutButton.addEventListener("click", (e) => {
        e.preventDefault();
        localStorage.removeItem("accessToken"); // Clear the token
        window.location.href = "login.html"; // Redirect to login
    });

    // Handle Symptom Checker Form Submission
    triageForm.addEventListener("submit", (e) => {
        e.preventDefault();
        triageResultContainer.style.display = 'block';
        triageResultContainer.innerHTML = `<p>Analyzing your symptoms...</p>`;

        setTimeout(() => {
            const mockResponse = getMockTriageResult();
            displayTriageResult(mockResponse);
        }, 1500); // Wait 1.5 seconds to simulate network delay
    });

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

    //Mock
    function getMockTriageResult() {
        const results = [
            {
                severity: "mild",
                recommendation: "Home care with rest, fluids, and over-the-counter medication is advised. Monitor your symptoms.",
                reasons: ["No red flags detected", "Vitals appear stable"]
            },
            {
                severity: "moderate",
                recommendation: "A clinic visit is recommended within the next 24 hours. Continue to monitor symptoms closely.",
                reasons: ["Elevated heart rate detected", "Persistent symptoms reported"]
            },
            {
                severity: "urgent",
                recommendation: "Seek immediate medical attention at the nearest clinic or hospital.",
                reasons: ["High fever detected", "Potentially critical symptom 'chest pain' mentioned"]
            }
        ];
        return results[Math.floor(Math.random() * results.length)];
    }
});