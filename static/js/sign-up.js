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
  setTimeout(() => {
    toast.classList.add("opacity-0");
    setTimeout(() => toast.remove(), 500);
  }, 3000);
}

function getEmailDomain(email) {
  return email.split("@")[1].toLowerCase();
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

    const email = emailInput.value.trim().toLowerCase();
    const role = roleSelect.value.trim();
    const domain = getEmailDomain(email);

    // ✅ Domain check
    if (!isValidDUTEmail(email)) {
      showToast("Please use a valid DUT email (@dut.ac.za or @dut4life.ac.za).", "error");
      return;
    }

    // ✅ Role & domain match logic
    if (domain === "dut4life.ac.za" && role !== "Student") {
      showToast("DUT4Life emails belong to students only!", "error");
      return;
    }
    if (domain === "dut.ac.za" && role === "Student") {
      showToast("DUT staff emails cannot register as students.", "error");
      return;
    }

    // ✅ Passwords match
    if (passwordInput.value !== confirmPasswordInput.value) {
      showToast("Passwords do not match. Please try again.", "error");
      return;
    }

    const validRoles = ["Student", "Staff", "Admin", "Technician"];
    if (!validRoles.includes(role)) {
        showToast("Please select a valid role.", "error");
        return;
    }


    const payload = {
      email,
      role,
      password: passwordInput.value,
    };

    try {
      const response = await fetch("/sign-up", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.ok) {
        showToast("Account created successfully!", "success");
        setTimeout(() => (window.location.href = "/sign-in"), 1500);
      } else {
        showToast(data.message || "Something went wrong. Please try again.", "error");
      }
    } catch (err) {
      console.error("Signup error:", err);
      showToast("Network error. Please try again later.", "error");
    }
  });
}

attachValidation("mobileSignUpForm", "mobilePassword", "mobileConfirmPassword");
attachValidation("desktopSignUpForm", "desktopPassword", "desktopConfirmPassword");
