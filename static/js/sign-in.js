function setupSignInForm(formId, emailId, passwordId, emailErrorId, passwordErrorId) {
  const form = document.getElementById(formId);
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const emailInput = document.getElementById(emailId);
    const passwordInput = document.getElementById(passwordId);
    const emailError = document.getElementById(emailErrorId);
    const passwordError = document.getElementById(passwordErrorId);

    // reset errors
    emailError.classList.add('hidden');
    passwordError.classList.add('hidden');

    let valid = true;
    const dutEmailPattern = /^[a-zA-Z0-9._%+-]+@dut(4life)?\.ac\.za$/;

    // --- format validation ---
    if (!emailInput.value.trim()) {
      emailError.textContent = 'Email is required.';
      emailError.classList.remove('hidden');
      valid = false;
    } else if (!dutEmailPattern.test(emailInput.value.trim())) {
      emailError.textContent = 'Please enter a valid DUT email address.';
      emailError.classList.remove('hidden');
      valid = false;
    }

    if (!passwordInput.value) {
      passwordError.textContent = 'Password is required.';
      passwordError.classList.remove('hidden');
      valid = false;
    }

    if (!valid) return;

    // --- send to backend ---
    try {
      const response = await fetch('/sign-in', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailInput.value.trim(),
          password: passwordInput.value
        })
      });

      const result = await response.json();

      if (response.ok && result.success) {
        alert('✅ Login successful! Redirecting...');
        // Redirect based on the URL sent from backend
        window.location.href = result.redirect || '/dashboard';
      } else {
        alert('❌ ' + (result.message || 'Invalid credentials. Please sign up.'));
      }
    } catch (err) {
      console.error('Login error:', err);
      alert('⚠️ Something went wrong. Please try again.');
    }
  });
}

// Setup both forms
setupSignInForm('loginForm', 'email', 'password', 'desktopEmailError', 'desktopPasswordError');
setupSignInForm('mobileSignInForm', 'mobileEmail', 'mobilePassword', 'mobileEmailError', 'mobilePasswordError');
