// Desktop form validation
document.getElementById('loginForm')?.addEventListener('submit', (e) => {
  e.preventDefault();
  const email = e.target.email.value.trim();
  const password = e.target.password.value;
  const emailError = document.getElementById('desktopEmailError');
  const passwordError = document.getElementById('desktopPasswordError');
  emailError.classList.add('hidden');
  passwordError.classList.add('hidden');
  let valid = true;
  const dutEmailPattern = /^[a-zA-Z0-9._%+-]+@dut(4life)?\.ac\.za$/;

  if (!email) {
    emailError.textContent = 'Email is required.';
    emailError.classList.remove('hidden');
    valid = false;
  } else if (!dutEmailPattern.test(email)) {
    emailError.textContent = 'Please enter a valid DUT email address.';
    emailError.classList.remove('hidden');
    valid = false;
  }

  if (!password) {
    passwordError.textContent = 'Password is required.';
    passwordError.classList.remove('hidden');
    valid = false;
  }

  if (valid) {
    window.location.href = "dashboard.html";
  }
});

// Mobile form validation
document.getElementById('mobileSignInForm')?.addEventListener('submit', (e) => {
  const emailInput = document.getElementById('mobileEmail');
  const passwordInput = document.getElementById('mobilePassword');
  const emailError = document.getElementById('mobileEmailError');
  const passwordError = document.getElementById('mobilePasswordError');
  emailError.classList.add('hidden');
  passwordError.classList.add('hidden');
  let valid = true;
  const dutEmailPattern = /^[a-zA-Z0-9._%+-]+@dut(4life)?\.ac\.za$/;

  if (!emailInput.value.trim()) {
    emailError.textContent = 'Email is required.';
    emailError.classList.remove('hidden');
    emailInput.focus();
    valid = false;
  } else if (!dutEmailPattern.test(emailInput.value.trim())) {
    emailError.textContent = 'Please enter a valid DUT email address.';
    emailError.classList.remove('hidden');
    emailInput.focus();
    valid = false;
  }

  if (!passwordInput.value) {
    passwordError.textContent = 'Password is required.';
    passwordError.classList.remove('hidden');
    passwordInput.focus();
    valid = false;
  }

  if (!valid) e.preventDefault();
});

// Logo bounce effect
document.querySelectorAll('.fixit-logo').forEach(logo => {
  logo.addEventListener('mousedown', () => logo.style.transform = 'scale(0.96) rotate(-1deg)');
  logo.addEventListener('mouseup', () => logo.style.transform = '');
  logo.addEventListener('mouseleave', () => logo.style.transform = '');
  logo.addEventListener('touchstart', () => logo.style.transform = 'scale(0.96) rotate(-1deg)');
  logo.addEventListener('touchend', () => logo.style.transform = '');
});

