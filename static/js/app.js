// Simple JS that gathers form data and POSTs JSON to / (root)
document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("demo-form");
  const submitBtn = document.getElementById("submit-btn");
  const clearBtn = document.getElementById("clear-btn");
  const resultEl = document.getElementById("result");
  const responseJson = document.getElementById("responseJson");
  
  function getFormData() {
    return {
      name: document.getElementById("name").value,
      email: document.getElementById("email").value,
      message: document.getElementById("message").value
    };
  }
  
  async function postData(payload) {
    try {
      const res = await fetch("/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      
      const json = await res.json();
      
      if (res.ok && json.success) {
        // Success case
        responseJson.textContent = JSON.stringify(json, null, 2);
        resultEl.classList.remove("hidden");
        
        // Clear form on success
        form.reset();
        
        return json;
      } else {
        // Error case
        responseJson.textContent = JSON.stringify(json, null, 2);
        resultEl.classList.remove("hidden");
        
        // Show user-friendly error message
        alert(json.error || "An error occurred");
        
        throw new Error(json.error || "Server error");
      }
    } catch (err) {
      console.error("POST failed:", err);
      
      // Handle JSON parsing errors or network errors
      if (err.name === 'SyntaxError') {
        responseJson.textContent = "Error: Server returned invalid response";
        alert("Server error - please try again");
      } else {
        responseJson.textContent = `Error: ${err.message}`;
      }
      
      resultEl.classList.remove("hidden");
      return null;
    }
  }
  
  submitBtn.addEventListener("click", () => {
    const payload = getFormData();
    // Example client-side validation (also validated server-side)
    if (!payload.name.trim() || !payload.email.trim()) {
      alert("Please provide name and email.");
      return;
    }
    // Disable button while sending
    submitBtn.disabled = true;
    submitBtn.textContent = "Sending...";
    postData(payload).finally(() => {
      submitBtn.disabled = false;
      submitBtn.textContent = "Send";
    });
  });
  
  clearBtn.addEventListener("click", () => {
    form.reset();
    resultEl.classList.add("hidden");
    responseJson.textContent = "";
  });
});
