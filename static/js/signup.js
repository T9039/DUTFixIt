document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("signup-form");
  const nameInput = document.getElementById("name");
  const emailInput = document.getElementById("email");
  const passwordInput = document.getElementById("password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const signupButton = document.getElementById("signup-button");

  const requirements = {
    length: document.getElementById("req-length"),
    upper: document.getElementById("req-upper"),
    lower: document.getElementById("req-lower"),
    number: document.getElementById("req-number"),
    special: document.getElementById("req-special"),
    match: document.getElementById("req-match"),
  };

  // Toggle password visibility
  document.querySelectorAll(".toggle-password").forEach((toggle) => {
    toggle.addEventListener("click", () => {
      const targetId = toggle.getAttribute("data-target");
      const target = document.getElementById(targetId);

      if (target.type === "password") {
        target.type = "text";
        toggle.innerHTML = eyeSlashSVG;
      } else {
        target.type = "password";
        toggle.innerHTML = eyeSVG;
      }
    });
  });

  const eyeSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
    </svg>`;

  const eyeSlashSVG = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.97 9.97 0 012.564-4.318M6.54 6.54A9.953 9.953 0 0112 5c4.477 0 8.267 2.943 9.541 7a9.956 9.956 0 01-4.038 4.58M15 12a3 3 0 00-4.243-2.828M9.88 9.88a3 3 0 004.242 4.242M3 3l18 18" />
    </svg>`;

  function validateName() {
    return nameInput.value.length >= 3 && nameInput.value.length <= 100;
  }

  function validateEmail() {
    const re = /^[^@]+@[^@]+\.[a-zA-Z]{2,}$/;
    return re.test(emailInput.value);
  }

  function validatePassword() {
    const password = passwordInput.value;
    const confirm = confirmPasswordInput.value;

    // Length
    const lengthValid = password.length >= 12;
    document.getElementById("req-length").className =
      lengthValid ? "text-green-500" : "text-red-500";

    // Uppercase
    const upperValid = /[A-Z]/.test(password);
    document.getElementById("req-uppercase").className =
      upperValid ? "text-green-500" : "text-red-500";

    // Lowercase
    const lowerValid = /[a-z]/.test(password);
    document.getElementById("req-lowercase").className =
      lowerValid ? "text-green-500" : "text-red-500";

    // Number
    const numberValid = /[0-9]/.test(password);
    document.getElementById("req-number").className =
      numberValid ? "text-green-500" : "text-red-500";

    // Special character
    const specialValid = /[^A-Za-z0-9]/.test(password);
    document.getElementById("req-special").className =
      specialValid ? "text-green-500" : "text-red-500";

    // Confirm password match
    const matchValid = password !== "" && password === confirm;
    document.getElementById("req-match").className =
      matchValid ? "text-green-500" : "text-red-500";

    // Return overall validity
    return (
      lengthValid &&
      upperValid &&
      lowerValid &&
      numberValid &&
      specialValid &&
      matchValid
    );
  }

  function validateConfirmPassword() {
    const match = passwordInput.value === confirmPasswordInput.value && confirmPasswordInput.value !== "";
    requirements.match.classList.toggle("text-green-600", match);
    requirements.match.classList.toggle("text-red-600", !match);
    return match;
  }

  function validateForm() {
    const valid =
      validateName() &&
      validateEmail() &&
      validatePassword() &&
      validateConfirmPassword();

    nameInput.classList.toggle("border-red-500", !validateName());
    emailInput.classList.toggle("border-red-500", !validateEmail());
    passwordInput.classList.toggle("border-red-500", !validatePassword());
    confirmPasswordInput.classList.toggle("border-red-500", !validateConfirmPassword());

    signupButton.disabled = !valid;
    signupButton.classList.toggle("opacity-50", !valid);
    signupButton.classList.toggle("cursor-not-allowed", !valid);
  }

  nameInput.addEventListener("input", validateForm);
  emailInput.addEventListener("input", validateForm);
  passwordInput.addEventListener("input", validateForm);
  confirmPasswordInput.addEventListener("input", validateForm);

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    if (signupButton.disabled) return;

    const payload = {
      name: nameInput.value,
      email: emailInput.value,
      password: passwordInput.value,
    };

    try {
      const res = await fetch("/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        alert("Signup successful!");
        form.reset();
        validateForm();
      } else {
        alert("Signup failed. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred.");
    }
  });

  validateForm(); // Initial state
});
