const API_KEY = "88674f35a4024141b8d14c202d367f01";
const API_URL = "https://ai-proxy.lab.epam.com/openai/deployments/gpt-4/chat/completions?api-version=2023-08-01-preview";

// DOM Elements
const complexitySelect = document.getElementById("complexity");
const categorySelect = document.getElementById("category");
const generateBtn = document.getElementById("generate-problem");
const submitBtn = document.getElementById("submit-solution");
const problemTitle = document.getElementById("problem-title");
const problemDescription = document.getElementById("problem-description");
const solutionInput = document.getElementById("solution");
const feedback = document.getElementById("feedback");

// Helper Function to Call OpenAI API
async function callAPI(messages) {
  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": API_KEY
      },
      body: JSON.stringify({
        messages: messages,
        temperature: 0.7,
        max_tokens: 800,
      })
    });

    if (response.ok) {
      const data = await response.json();
      document.getElementById("hidden").style.display = "block";
      return data.choices[0].message.content;
    } else {
      console.error("Error calling API:", response.status, response.statusText);
      return "Error fetching data from API.";
    }
  } catch (error) {
    console.error("API call failed:", error);
    return "There was an error communicating with the server.";
  }
}

// Convert Markdown to HTML
function renderMarkdown(markdown) {
  return marked.parse(markdown); // Render markdown to HTML using Marked.js
}

// Parse Evaluation to Extract Grades & Complexity
function parseEvaluation(evaluation) {
  const grades = {
    cleanliness: 0, // 1–5
    complexityTime: '',
    complexitySpace: '',
    testability: 0, // 1–5
  };

  // Extract grades manually based on expected feedback structure
  const cleanlinessRegex = /Code Cleanliness[\s\S]+?Readability[\s\S]+?Structure[\s\S]+?(\d)\/5/m;
  const timeComplexityRegex = /Time Complexity:[\s\S]+?O\((.*?)\)/m;
  const spaceComplexityRegex = /Space Complexity:[\s\S]+?O\((.*?)\)/m;
  const testabilityRegex = /Testability[\s\S]+?(\d)\/5/m;

  // Find matches using regular expressions
  const cleanlinessMatch = cleanlinessRegex.exec(evaluation);
  const timeComplexityMatch = timeComplexityRegex.exec(evaluation);
  const spaceComplexityMatch = spaceComplexityRegex.exec(evaluation);
  const testabilityMatch = testabilityRegex.exec(evaluation);

  // Assign extracted values (fallback to default if not found)
  grades.cleanliness = cleanlinessMatch ? parseInt(cleanlinessMatch[1]) : 0;
  grades.complexityTime = timeComplexityMatch ? `O(${timeComplexityMatch[1]})` : '';
  grades.complexitySpace = spaceComplexityMatch ? `O(${spaceComplexityMatch[1]})` : '';
  grades.testability = testabilityMatch ? parseInt(testabilityMatch[1]) : 0;

  return grades;
}

// Generate Problem
generateBtn.addEventListener("click", async () => {
  const complexity = complexitySelect.value;
  const category = categorySelect.value;

  // Prepare API prompt
  const prompt = `Generate a ${complexity} level DS-ALGO problem for the category ${category}. Please include a clear description, input format, and expected output.`;
  const messages = [{ role: "user", content: prompt }];

  // Fetch Problem from API
  const generatedProblem = await callAPI(messages);

  // Render Markdown into HTML
  problemTitle.textContent = `Problem (${complexity.toUpperCase()} - ${category.toUpperCase()})`;
  problemDescription.innerHTML = renderMarkdown(generatedProblem); // Render markdown
});

// Submit Solution
submitBtn.addEventListener("click", async () => {
  const solutionCode = solutionInput.value;

  if (!solutionCode) {
    feedback.textContent = "Please write a solution before submitting.";
    feedback.style.color = "var(--epam-red)";
    return;
  }

  // Prepare API prompt for evaluating solution
  const prompt = `Provide an analysis and grade for the following code solution for a DS-ALGO problem. Consider:
1. Code Cleanliness (Grade 1–5)
2. Time Complexity (e.g., O(n), O(n^2))
3. Space Complexity (e.g., O(1), O(log n))
4. Test Case Coverage (Grade 1–5).

Return the output in the format of below
 Final Grades:
Code Cleanliness: 4/5
Time Complexity: O(n)
Space Complexity: O(1)
Test Case Coverage: 3/5:

Only in this way as I have provided give the result

${solutionCode}`;
  const messages = [{ role: "user", content: prompt }];

  // Fetch Feedback from API
  const evaluationFeedback = await callAPI(messages);

  // Parse Evaluation Feedback
  const grades = parseEvaluation(evaluationFeedback);

  // Display Grades and Complexity in Results Section
  feedback.innerHTML = `
    <h3>Grades and Complexity</h3>
    <ul>
      <li><strong>Code Cleanliness:</strong> ${grades.cleanliness}/5</li>
      <li><strong>Time Complexity:</strong> ${grades.complexityTime}</li>
      <li><strong>Space Complexity:</strong> ${grades.complexitySpace}</li>
      <li><strong>Testability:</strong> ${grades.testability}/5</li>
    </ul>
    <h4>Detailed Feedback</h4>
    <div>${renderMarkdown(evaluationFeedback)}</div>
  `;
  feedback.style.color = "var(--epam-green)";
});