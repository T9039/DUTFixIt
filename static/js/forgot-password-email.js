console.log("forgot-password-email.js loaded");

document.addEventListener("DOMContentLoaded", () => {
  console.log("DOM fully loaded");

  const form = document.getElementById("emailForm");
  console.log("form found?", form);

  form.addEventListener("submit", async (e) => {
    console.log("submit handler triggered");
    e.preventDefault();

    const emailInput = form.email;
    const emailError = document.getElementById("emailError");

    function isValidDUTEmail(email) {
      return /^[a-zA-Z0-9._%+-]+@dut(4life)?\.ac\.za$/i.test(email);
    }

    emailError.classList.add("hidden");
    const email = (emailInput.value || "").trim();

    if (!email) {
      emailError.textContent = "Please enter your email.";
      emailError.classList.remove("hidden");
      emailInput.focus();
      return;
    }

    if (!isValidDUTEmail(email)) {
      emailError.textContent =
        "Please use your DUT email (e.g. name@dut4life.ac.za).";
      emailError.classList.remove("hidden");
      emailInput.focus();
      return;
    }

    try {
      const response = await fetch("/forgot-password/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const result = await response.json();

      if (result.success) {
        sessionStorage.setItem("resetEmail", email);
        window.location.href = result.redirect;
      } else {
        window.location.href = result.redirect;
      }
    } catch (err) {
      console.error("Request failed", err);
      emailError.textContent = "Something went wrong. Please try again later.";
      emailError.classList.remove("hidden");
    }
  });
});


// const form = document.getElementById('emailForm');
// const emailInput = form.email;
// const emailError = document.getElementById('emailError');
//
// function isValidDUTEmail(email) {
//   return /^[a-zA-Z0-9._%+-]+@dut(4life)?\.ac\.za$/i.test(email);
// }
//
// form.addEventListener('submit', async (e) => {
//   e.preventDefault();
//   emailError.classList.add('hidden');
//
//   const email = (emailInput.value || '').trim();
//
//   if (!email) {
//     emailError.textContent = 'Please enter your email.';
//     emailError.classList.remove('hidden');
//     emailInput.focus();
//     return;
//   }
//
//   if (!isValidDUTEmail(email)) {
//     emailError.textContent = 'Please use your DUT email (e.g. name@dut4life.ac.za).';
//     emailError.classList.remove('hidden');
//     emailInput.focus();
//     return;
//   }
//
//   try {
//     const response = await fetch("/forgot-password/email", {
//       method: "POST",
//       headers: { "Content-Type": "application/json" },
//       body: JSON.stringify({ email })
//     });
//
//     const result = await response.json();
//
//     if (result.success) {
//       sessionStorage.setItem('resetEmail', email);
//       window.location.href = result.redirect;
//     } else {
//       window.location.href = result.redirect;
//     }
//   } catch (err) {
//     console.error("Request failed", err);
//     emailError.textContent = "Something went wrong. Please try again later.";
//     emailError.classList.remove('hidden');
//   }
// });

