const STORAGE_KEY = "dut_requests_v1";
const logoutBtn = document.getElementById("logoutBtn");
const $ = (id) => document.getElementById(id);

// ---- Campus/Block dropdown logic ----
const blockOptions = {
  Ritson: [
    "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H","Block I","Block J","Block K","Block L","Block M","Block N","Block O","Block P","Block Q","Block R","Block S","Block T","Block U","Block V","Open House Annexe","Canteen"
  ],
  Steve: [
    "S1","S2","S3","S4","S5","S6","S7","S8","S9"
  ],
  "ML Sultan": [
    "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H","Block I","Block J","Block K","Block L","Block M"
  ],
  City: [
    "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H"
  ],
  Brickfield: [
    "Block"
  ],
  Indumiso: [
    "Block"
  ],
  Riverside: [
    "Block"
  ]
};

document.addEventListener("DOMContentLoaded", function () {
  const campusSelect = $("campusSelect");
  const blockSelect = $("blockSelect");

  function populateBlocks(campus) {
    blockSelect.innerHTML = '<option value="" disabled selected>Select a block</option>';
    if (blockOptions[campus]) {
      for (const block of blockOptions[campus]) {
        const opt = document.createElement("option");
        opt.value = block;
        opt.textContent = block;
        blockSelect.appendChild(opt);
      }
    }
  }

  if (campusSelect) {
    campusSelect.addEventListener("change", function () {
      populateBlocks(campusSelect.value);
    });
  }
});

// ---- End campus/block dropdown logic ----

function generateId() {
  let lastRef = parseInt(localStorage.getItem("dut_last_ref_no") || "0", 10);
  let nextRef = lastRef + 1;
  localStorage.setItem("dut_last_ref_no", nextRef);
  return "#" + nextRef.toString().padStart(4, "0");
}

function saveRequests(arr) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
}

function loadRequests() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
  } catch {
    return [];
  }
}

// Category → Type filter
$("categorySelect").addEventListener("change", (e) => {
  const typeSel = $("typeSelect");
  const groups = typeSel.querySelectorAll("optgroup");
  groups.forEach((g) => (g.hidden = g.label !== e.target.value));
  typeSel.value = "";
  $("otherTypeInput").classList.add("hidden");
});

// Show extra input if "Other" selected
$("typeSelect").addEventListener("change", (e) => {
  if (e.target.value === "Other")
    $("otherTypeInput").classList.remove("hidden");
  else $("otherTypeInput").classList.add("hidden");
});

// Handle form submit
$("reportForm").addEventListener("submit", (e) => {
  e.preventDefault();
  let category = $("categorySelect").value;
  let type = $("typeSelect").value;
  if (type === "Other")
    type = $("otherTypeInput").value.trim() || "Other";
  // ---- USE SELECTS FOR CAMPUS/BLOCK ----
  const campus = $("campusSelect") ? $("campusSelect").value : "";
  const block = $("blockSelect") ? $("blockSelect").value : "";
  // ---- END CHANGE ----
  const nearestClass = $("nearestClassInput").value.trim();
  const description = $("descriptionInput").value.trim();
  if (!category || !type || !description) {
    alert("Please fill in required fields");
    return;
  }
  const now = new Date();
  const req = {
    id: generateId(),
    category,
    type,
    campus,
    block,
    nearestClass,
    notes: description,
    status: "pending",
    date: now.toLocaleDateString("en-GB"),
    time: now.toLocaleTimeString("en-GB", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  };
  const arr = loadRequests();
  arr.unshift(req);
  saveRequests(arr);
  window.location.href = "dashboard";
});

// Logout
if (logoutBtn) {
  logoutBtn.addEventListener("click", () => {
    localStorage.removeItem("signedInEmail");
    localStorage.removeItem("userProfile");
    window.location.href = "Sign in (DESKTOP).html";
  });
}

// Logo bounce 
document.querySelectorAll(".logo-box").forEach((logo) => {
  logo.addEventListener("mousedown", () => (logo.style.transform = "scale(0.96) rotate(-1deg)"));
  logo.addEventListener("mouseup", () => (logo.style.transform = ""));
  logo.addEventListener("mouseleave", () => (logo.style.transform = ""));
  logo.addEventListener("touchstart", () => (logo.style.transform = "scale(0.96) rotate(-1deg)"));
  logo.addEventListener("touchend", () => (logo.style.transform = ""));
});

// Ripple effect (still JS logic, only styling simplified with Tailwind classes if desired)
document.querySelectorAll(".icon-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.className =
      "absolute bg-indigo-200/30 rounded-full pointer-events-none w-9 h-9 opacity-70 transform scale-0 transition duration-300";
    ripple.style.left = e.offsetX - 18 + "px";
    ripple.style.top = e.offsetY - 18 + "px";
    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.style.transform = "scale(1.5)";
      ripple.style.opacity = "0";
    }, 10);
    setTimeout(() => {
      ripple.remove();
    }, 500);
  });
});
