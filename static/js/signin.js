document.getElementById("signin-form").addEventListener("submit", async () => {
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value.trim();

  const responseBox = document.getElementById("result");
  const responseJson = document.getElementById("responseJson");

  try {
    const res = await fetch("/signin", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();
    responseBox.classList.remove("hidden");
    responseJson.textContent = JSON.stringify(data, null, 2);
  } catch (err) {
    responseBox.classList.remove("hidden");
    responseJson.textContent = "Error: " + err.message;
  }
});

