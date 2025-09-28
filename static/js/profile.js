// --------- PROFILE DATA MANAGEMENT ---------
const defaultProfile = {
  dutId: "22403583", // example value, can be replaced with real data
  email: localStorage.getItem("signedInEmail") || "",
  fullName: "Suko", // example
  surname: "Mhlongo", // example
  gender: "male",
  role: "Student",
  password: "password123",
};

// Load from localStorage or use default
function getProfile() {
  return (
    JSON.parse(localStorage.getItem("userProfile") || "null") || defaultProfile
  );
}

function saveProfile(profile) {
  localStorage.setItem("userProfile", JSON.stringify(profile));
}

// --------- DISPLAY/EDIT MODE TOGGLE ---------
let isEditing = false;

// Elements
const editBtn = document.getElementById("editBtn");
const logoutBtn = document.getElementById("logoutBtn");
// Display spans
const dutIdDisplay = document.getElementById("dutIdDisplay");
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
const passwordInput = document.getElementById("passwordInput");
const passwordEditWrapper = document.getElementById("passwordEditWrapper");
const togglePassword = document.getElementById("togglePassword");
const eyeOpen = document.getElementById("eyeOpen");
const eyeClosed = document.getElementById("eyeClosed");

// Show profile info in display mode
function setDisplayMode(profile) {
  dutIdDisplay.textContent = profile.dutId;
  emailDisplay.textContent = profile.email;
  fullNameDisplay.textContent = profile.fullName;
  surnameDisplay.textContent = profile.surname;
  genderDisplay.textContent = capitalize(profile.gender);
  roleDisplay.textContent = profile.role;
  passwordDisplay.textContent = "••••••••";
  // Hide inputs, show spans
  [fullNameInput, surnameInput, genderInput, passwordEditWrapper].forEach((el) =>
    el.classList.add("hidden")
  );
  [fullNameDisplay, surnameDisplay, genderDisplay, passwordDisplay].forEach((el) =>
    el.classList.remove("hidden")
  );
  editBtn.textContent = "Edit";
}

// Show editable fields
function setEditMode(profile) {
  fullNameInput.value = profile.fullName;
  surnameInput.value = profile.surname;
  genderInput.value = profile.gender;
  passwordInput.value = profile.password;
  // Hide spans, show inputs
  [fullNameInput, surnameInput, genderInput, passwordEditWrapper].forEach((el) =>
    el.classList.remove("hidden")
  );
  [fullNameDisplay, surnameDisplay, genderDisplay, passwordDisplay].forEach((el) =>
    el.classList.add("hidden")
  );
  editBtn.textContent = "Save";
}

function capitalize(str) {
  if (!str) return "";
  return str.charAt(0).toUpperCase() + str.slice(1);
}

// Load profile on page load
function loadProfile() {
  const profile = getProfile();
  setDisplayMode(profile);
}

// Toggle edit/save mode
editBtn.addEventListener("click", () => {
  const profile = getProfile();
  if (!isEditing) {
    setEditMode(profile);
    isEditing = true;
  } else {
    // Save changes
    profile.fullName = fullNameInput.value.trim();
    profile.surname = surnameInput.value.trim();
    profile.gender = genderInput.value;
    profile.password = passwordInput.value;
    saveProfile(profile);
    setDisplayMode(profile);
    isEditing = false;
  }
});

// Password show/hide toggle
togglePassword.addEventListener("click", () => {
  const type = passwordInput.type;
  passwordInput.type = type === "password" ? "text" : "password";
  eyeOpen.classList.toggle("hidden");
  eyeClosed.classList.toggle("hidden");
});

// Logout clears email and user profile
logoutBtn.addEventListener("click", () => {
  localStorage.removeItem("signedInEmail");
  localStorage.removeItem("userProfile");
  window.location.href = "Sign in (DESKTOP).html";
});

// On page load
document.addEventListener("DOMContentLoaded", loadProfile);

