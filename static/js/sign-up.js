function isValidDUTEmail(email) {
  return /^[a-zA-Z0-9._%+-]+@(dut\.ac\.za|dut4life\.ac\.za)$/.test(email);
}

function attachValidation(formId, passwordId, confirmId) {
  const form = document.getElementById(formId);
  if (!form) return;
  const emailInput = form.querySelector('input[type="email"]');
  const passwordInput = document.getElementById(passwordId);
  const confirmPasswordInput = document.getElementById(confirmId);

  form.addEventListener("submit", function (e) {
    if (!isValidDUTEmail(emailInput.value.trim())) {
      e.preventDefault();
      alert("Please use a valid DUT email ending with @dut.ac.za or @dut4life.ac.za.");
      emailInput.focus();
      return;
    }
    if (passwordInput.value !== confirmPasswordInput.value) {
      e.preventDefault();
      alert("Passwords do not match. Please check and try again.");
      confirmPasswordInput.focus();
      return;
    }
  });
}

// Mobile form
attachValidation("mobileSignUpForm", "mobilePassword", "mobileConfirmPassword");

// Desktop form
attachValidation("desktopSignUpForm", "desktopPassword", "desktopConfirmPassword");

