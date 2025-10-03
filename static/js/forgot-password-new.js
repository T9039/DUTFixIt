document.addEventListener("DOMContentLoaded", () => {
  const newForm = document.getElementById("newForm");
  const newPassword = document.getElementById("newPassword");
  const confirmPassword = document.getElementById("confirmPassword");
  const pwError = document.getElementById("pwError");
  const success = document.getElementById("success");
  const emailNotice = document.getElementById("emailNotice");

  const resetEmail = sessionStorage.getItem("resetEmail");
  if (resetEmail) {
    emailNotice.textContent = `Resetting password for ${resetEmail}`;
  }

  newForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    pwError.classList.add("hidden");

    const a = (newPassword.value || "").trim();
    const b = (confirmPassword.value || "").trim();

    if (!a || !b) {
      pwError.textContent = "Please fill both fields.";
      pwError.classList.remove("hidden");
      return;
    }
    if (a.length < 6) {
      pwError.textContent = "Password must be at least 6 characters long.";
      pwError.classList.remove("hidden");
      newPassword.focus();
      return;
    }
    if (a !== b) {
      pwError.textContent = "Passwords do not match.";
      pwError.classList.remove("hidden");
      confirmPassword.focus();
      return;
    }

    try {
      const response = await fetch("/forgot-password/new", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password: a })
      });

      const result = await response.json();
      console.log("New password result:", result);

      if (result.success) {
        success.classList.remove("hidden");
        sessionStorage.removeItem("resetEmail");

        setTimeout(() => {
          window.location.href = result.redirect;
        }, 1400);
      } else {
        pwError.textContent = result.error || "Failed to reset password.";
        pwError.classList.remove("hidden");

        if (result.redirect) {
          setTimeout(() => {
            window.location.href = result.redirect;
          }, 1400);
        }
      }
    } catch (err) {
      console.error("Password reset failed", err);
      pwError.textContent = "Something went wrong. Please try again later.";
      pwError.classList.remove("hidden");
    }
  });
});

