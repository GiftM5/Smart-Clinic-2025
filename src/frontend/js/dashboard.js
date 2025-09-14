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
    
    // INITIAL DATA (Simulated
    // Later, you will fetch this data from a `/users/me` endpoint.
    const mockUserData = {
        fullName: "Jessica Zulu",
        email: "jessica.zulu@example.com",
        healthPoints: 240,
    };
    
    userNameDisplay.textContent = mockUserData.fullName.split(' ')[0]; 
    profileNameDisplay.textContent = mockUserData.fullName;
    document.getElementById('profileEmail').textContent = mockUserData.email;
    document.getElementById('healthPoints').textContent = mockUserData.healthPoints;


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