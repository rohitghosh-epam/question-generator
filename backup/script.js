// API Configuration
const API_KEY = "88674f35a4024141b8d14c202d367f01"; 
const API_URL = "https://ai-proxy.lab.epam.com/openai/deployments/gpt-4/chat/completions?api-version=2023-08-01-preview";

// Generate Problem Logic - Dynamically Fetch Problem From API
document.getElementById("generateProblem").addEventListener("click", async () => {
  // Get user-selected complexity and problem type
  const complexity = document.getElementById("complexity").value;
  const problemType = document.getElementById("problemType").value;

  // Formulate the API prompt
  const problemPrompt = `Generate a ${complexity} DSA problem related to ${problemType}.`;

  try {
    // Call the EPAM Dial API to fetch the problem
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY
      },
      body: JSON.stringify({
        "model": "gpt-4",
        "temperature": 0,
        "messages": [
          {
            "role": "user",
            "content": problemPrompt // Use constructed `problemPrompt`
          }
        ]
      }),
    });

    if (response.ok) {
      // Parse the response data
      const rawData = await response.json();

      // Beautify the response data for debugging purposes
      const beautifiedJSON = JSON.stringify(rawData, null, 2); // Format JSON

      // Extract the generated problem
      const generatedProblem =
        rawData.choices && rawData.choices.length > 0
          ? rawData.choices[0].message.content.trim()
          : "Error fetching problem from API.";

      // Update the problem statement on the UI
      document.getElementById("problemSection").classList.remove("hidden");
      document.getElementById("problemStatement").textContent = generatedProblem;

      // Optionally, show the raw JSON response for debugging purposes (inside a pre block)
      document.getElementById("jsonResponseSection").classList.remove("hidden");
      document.getElementById("jsonResponse").textContent = beautifiedJSON;

      // Show the solution section
      document.getElementById("solutionSection").classList.remove("hidden");

      // Reset grade section
      document.getElementById("gradeSection").classList.add("hidden");
      document.getElementById("gradeResult").textContent = "";
    } else {
      // Handle API errors
      alert("Failed to fetch the problem from the API. Please try again later.");
    }
  } catch (error) {
    console.error("Error while fetching the problem:", error);
    alert("An error occurred while fetching the problem. Please try again!");
  }
});

// Solution Submission Logic (Grading Placeholder)
document.getElementById("submitSolution").addEventListener("click", () => {
  const solution = document.getElementById("solutionInput").value.trim();

  if (!solution) {
    alert("Please write a solution before submitting!");
    return;
  }

  // Placeholder logic for grading
  const grade = Math.ceil(Math.random() * 5); // Random grading for now

  // Display grade
  document.getElementById("gradeSection").classList.remove("hidden");
  document.getElementById("gradeResult").textContent = `Your grade is: ${grade}/5.`;

  // Clear the solution input area
  document.getElementById("solutionInput").value = "";
});