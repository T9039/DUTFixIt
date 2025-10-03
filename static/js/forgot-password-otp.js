document.addEventListener("DOMContentLoaded", () => {
  const otpForm = document.getElementById("otpForm");
  const otpInput = document.getElementById("otp");
  const otpError = document.getElementById("otpError");
  const emailNotice = document.getElementById("emailNotice");
  const resendBtn = document.getElementById("resendBtn");

  const resetEmail = sessionStorage.getItem("resetEmail");
  if (resetEmail) {
    emailNotice.textContent = `Enter the code sent to ${resetEmail}`;
  }

  // OTP form submission
  otpForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    otpError.classList.add("hidden");

    const otp = (otpInput.value || "").trim();
    if (!otp || otp.length !== 6) {
      otpError.textContent = "Please enter the 6-digit code.";
      otpError.classList.remove("hidden");
      otpInput.focus();
      return;
    }

    try {
      const response = await fetch("/forgot-password/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ otp })
      });

      const result = await response.json();
      if (result.success) {
        window.location.href = result.redirect;
      } else {
        otpError.textContent = result.error || "Invalid code. Try again.";
        otpError.classList.remove("hidden");

        if (result.redirect) {
          setTimeout(() => window.location.href = result.redirect, 1500);
        }
      }
    } catch (err) {
      console.error("OTP request failed", err);
      otpError.textContent = "Something went wrong. Please try again later.";
      otpError.classList.remove("hidden");
    }
  });

  // Resend button
  resendBtn.addEventListener("click", async () => {
    try {
      const response = await fetch("/forgot-password/otp/resend", {
        method: "POST",
        headers: { "Content-Type": "application/json" }
      });
      const result = await response.json();
      alert(result.message || "A new OTP has been sent.");
    } catch (err) {
      console.error("Resend failed", err);
      alert("Could not resend code. Please try again.");
    }
  });
});
