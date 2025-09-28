function isValidDUTEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@(dut\.ac\.za|dut4life\.ac\.za)$/.test(email);
}

function showToast(message, type = "success") {
  const container = document.getElementById("toast-container");

  const toast = document.createElement("div");
  toast.className = `
    px-4 py-3 rounded-lg shadow-lg text-white font-semibold transition-opacity duration-500
    ${type === "success" ? "bg-green-600" : "bg-red-600"}
  `;
  toast.textContent = message;

  container.appendChild(toast);

  // Fade out after 3s
  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function attachValidation(formId, passwordId, confirmId) {
  const form = document.getElementById(formId);
  if (!form) return;

  const emailInput = form.querySelector('input[type="email"]');
  const roleSelect = form.querySelector("select");
  const passwordInput = document.getElementById(passwordId);
  const confirmPasswordInput = document.getElementById(confirmId);

  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Client-side validation
    if (!isValidDUTEmail(emailInput.value.trim())) {
      showToast("Please use a valid DUT email (@dut.ac.za or @dut4life.ac.za).", "error");
      emailInput.focus();
      return;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      showToast("Passwords do not match. Please try again.", "error");
      confirmPasswordInput.focus();
      return;
    }

    const payload = {
      email: emailInput.value.trim(),
      role: roleSelect.value,
      password: passwordInput.value,
    };

    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        showToast("User created successfully!", "success");
        setTimeout(() => (window.location.href = "/"), 1500);
      } else if (response.status === 409) {
        showToast("An account with this email already exists.", "error");
      } else {
        const data = await response.json().catch(() => ({}));
        showToast(data.message || "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showToast("Network error. Please try again later.", "error");
    }
  });
}

// Mobile + Desktop forms
attachValidation("mobileSignUpForm", "mobilePassword", "mobileConfirmPassword");
attachValidation("desktopSignUpForm", "desktopPassword", "desktopConfirmPassword");
