// --------- PROFILE MANAGEMENT ---------
let isEditing = false;

// Wait until DOM is fully loaded
document.addEventListener("DOMContentLoaded", () => {
  // Elements
  const editBtn = document.getElementById("editBtn");
  const logoutBtn = document.getElementById("logoutBtn");
  const changePasswordBtn = document.getElementById("changePasswordBtn");

  // Display spans
  const idDisplay = document.getElementById("idDisplay");
  const emailDisplay = document.getElementById("emailDisplay");
  const fullNameDisplay = document.getElementById("fullNameDisplay");
  const surnameDisplay = document.getElementById("surnameDisplay");
  const genderDisplay = document.getElementById("genderDisplay");
  const roleDisplay = document.getElementById("roleDisplay");
  const passwordDisplay = document.getElementById("passwordDisplay");

  // Edit inputs
  const fullNameInput = document.getElementById("fullNameInput");
  const surnameInput = document.getElementById("surnameInput");
  const genderInput = document.getElementById("genderInput");

  // --------- FETCH PROFILE DATA FROM BACKEND ---------
  async function getProfile() {
    try {
      const res = await fetch("/profile",{
        method: "GET",
        headers: { "Accept": "application/json" } 
      });

      if (!res.ok) {
        if (res.status === 401) {
          alert("You must be logged in to view your profile.");
          window.location.href = "/login";
          return null;
        }
        console.error("Error fetching profile data");
        return null;
      }
      const data = await res.json();
      return data.success ? data : null;
    } catch (err) {
      console.error("Network error fetching profile:", err);
      return null;
    }
  }

  // --------- DISPLAY PROFILE ---------
  function setDisplayMode(profile) {
    idDisplay.textContent = profile.id;
    emailDisplay.textContent = profile.email;
    fullNameDisplay.textContent = profile.fullName || "—";
    surnameDisplay.textContent = profile.surname || "—";
    genderDisplay.textContent = capitalize(profile.gender);
    roleDisplay.textContent = profile.role;
    passwordDisplay.textContent = "•".repeat(profile.passwordLength || 8);

    [fullNameInput, surnameInput, genderInput].forEach(el =>
      el.classList.add("hidden")
    );
    [fullNameDisplay, surnameDisplay, genderDisplay, passwordDisplay].forEach(el =>
      el.classList.remove("hidden")
    );
    editBtn.textContent = "Edit";
    isEditing = false;
  }

  // --------- EDIT MODE (placeholders for now) ---------
  function setEditMode(profile) {
    fullNameInput.value = profile.fullName || "";
    surnameInput.value = profile.surname || "";
    genderInput.value = profile.gender || "";

    [fullNameInput, surnameInput, genderInput].forEach(el =>
      el.classList.remove("hidden")
    );
    [fullNameDisplay, surnameDisplay, genderDisplay, passwordDisplay].forEach(el =>
      el.classList.add("hidden")
    );
    editBtn.textContent = "Save";
    isEditing = true;
  }

  // --------- LOAD PROFILE ---------
  async function loadProfile() {
    const profile = await getProfile();
    if (!profile) return;
    setDisplayMode(profile);
  }

  // --------- TOGGLE EDIT ---------
  editBtn.addEventListener("click", async () => {
    const profile = await getProfile();
    if (!profile) return;

    if (!isEditing) {
      setEditMode(profile);
    } else {
      // For now, keep placeholders locally
      profile.fullName = fullNameInput.value.trim();
      profile.surname = surnameInput.value.trim();
      profile.gender = genderInput.value;
      // TODO: send updated data to backend later
      setDisplayMode(profile);
    }
  });

  // --------- CHANGE PASSWORD BUTTON ---------
  if (changePasswordBtn) {
    changePasswordBtn.addEventListener("click", () => {
      window.location.href = "/change-password"; // dedicated route
    });
  }

  // --------- LOGOUT ---------
  logoutBtn.addEventListener("click", async () => {
    try {
      const res = await fetch("/logout", { method: "GET" });
      if (res.redirected) {
        window.location.href = res.url;
      } else {
        alert("Failed to log out. Please try again.");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging out. Try again later.");
    }
  });

  // --------- UTILITIES ---------
  function capitalize(str) {
    if (!str) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  // Load profile on page load
  loadProfile();
});
