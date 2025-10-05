// === Helper for selecting elements ===
function $(id) {
  return document.getElementById(id);
}

// === Category / Type Dropdown Logic ===
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

// ---- Class options for each campus/block combination ----
// You can edit these arrays to match your actual class names
const classOptions = {
  // RITSON CAMPUS
  "Ritson-Block A": ["A0101", "A0102", "A0103", "A0104", "A0105"],
  "Ritson-Block B": ["B0101", "B0102", "B0103", "B0104", "B0105"],
  "Ritson-Block C": ["C0101", "C0102", "C0103", "C0104", "C0105"],
  "Ritson-Block D": ["D0101", "D0102", "D0103", "D0104", "D0105"],
  "Ritson-Block E": ["E0101", "E0102", "E0103", "E0104", "E0105"],
  "Ritson-Block F": ["F0101", "F0102", "F0103", "F0104", "F0105"],
  "Ritson-Block G": ["G0101", "G0102", "G0103", "G0104", "G0105"],
  "Ritson-Block H": ["H0101", "H0102", "H0103", "H0104", "H0105"],
  "Ritson-Block I": ["I0101", "I0102", "I0103", "I0104", "I0105"],
  "Ritson-Block J": ["J0101", "J0102", "J0103", "J0104", "J0105"],
  "Ritson-Block K": ["K0101", "K0102", "K0103", "K0104", "K0105"],
  "Ritson-Block L": ["L0101", "L0102", "L0103", "L0104", "L0105"],
  "Ritson-Block M": ["M0101", "M0102", "M0103", "M0104", "M0105"],
  "Ritson-Block N": ["N0101", "N0102", "N0103", "N0104", "N0105"],
  "Ritson-Block O": ["O0101", "O0102", "O0103", "O0104", "O0105"],
  "Ritson-Block P": ["P0101", "P0102", "P0103", "P0104", "P0105"],
  "Ritson-Block Q": ["Q0101", "Q0102", "Q0103", "Q0104", "Q0105"],
  "Ritson-Block R": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Block S": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Block T": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Block U": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Block V": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Open House Annexe": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Ritson-Canteen": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // STEVE CAMPUS
  "Steve-S1": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S2": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S3": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S4": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S5": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S6": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S7": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S8": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "Steve-S9": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // ML SULTAN CAMPUS
  "ML Sultan-Block A": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block B": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block C": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block D": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block E": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block F": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block G": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block H": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block I": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block J": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block K": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block L": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "ML Sultan-Block M": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // CITY CAMPUS
  "City-Block A": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block B": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block C": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block D": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block E": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block F": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block G": ["Class A", "Class B", "Class C", "Class D", "Class E"],
  "City-Block H": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // BRICKFIELD CAMPUS
  "Brickfield-Block": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // INDUMISO CAMPUS
  "Indumiso-Block": ["Class A", "Class B", "Class C", "Class D", "Class E"],

  // RIVERSIDE CAMPUS
  "Riverside-Block": ["Class A", "Class B", "Class C", "Class D", "Class E"]
};

// Populate blocks based on campus selection
function populateBlocks(campus) {
  const blockSelect = $("blockSelect");
  const classSelect = $("classSelect");
  
  blockSelect.innerHTML = '<option value="" disabled selected>Select a block</option>';
  classSelect.innerHTML = '<option value="" disabled selected>Select a class</option>';
  
  if (blockOptions[campus]) {
    for (const block of blockOptions[campus]) {
      const opt = document.createElement("option");
      opt.value = block;
      opt.textContent = block;
      blockSelect.appendChild(opt);
    }
  }
}

// Populate classes based on campus and block selection
function populateClasses(campus, block) {
  const classSelect = $("classSelect");
  const key = `${campus}-${block}`;
  
  classSelect.innerHTML = '<option value="" disabled selected>Select a class</option>';
  
  if (classOptions[key]) {
    for (const className of classOptions[key]) {
      const opt = document.createElement("option");
      opt.value = className;
      opt.textContent = className;
      classSelect.appendChild(opt);
    }
  }
}

// Show/hide class dropdown or nearest class input based on location type
function toggleLocationFields() {
  const locationInside = $("locationInside");
  const locationOutside = $("locationOutside");
  const classSelect = $("classSelect");
  const nearestClassInput = $("nearestClassInput");
  const campusSelect = $("campusSelect");
  const blockSelect = $("blockSelect");
  
  if (locationInside && locationInside.checked) {
    classSelect.classList.remove("hidden");
    nearestClassInput.classList.add("hidden");
    nearestClassInput.value = ""; // Clear the textbox
    
    // Populate classes if campus and block are already selected
    const campus = campusSelect.value;
    const block = blockSelect.value;
    if (campus && block) {
      populateClasses(campus, block);
    }
  } else if (locationOutside && locationOutside.checked) {
    classSelect.classList.add("hidden");
    nearestClassInput.classList.remove("hidden");
    classSelect.value = ""; // Clear the dropdown
  } else {
    // Neither selected - hide both
    classSelect.classList.add("hidden");
    nearestClassInput.classList.add("hidden");
  }
}

// Wait for DOM to be ready
document.addEventListener("DOMContentLoaded", function () {
  const campusSelect = $("campusSelect");
  const blockSelect = $("blockSelect");
  const locationInside = $("locationInside");
  const locationOutside = $("locationOutside");

  // Campus change event
  if (campusSelect) {
    campusSelect.addEventListener("change", function () {
      populateBlocks(campusSelect.value);
    });
  }

  // Block change event
  if (blockSelect) {
    blockSelect.addEventListener("change", function () {
      // Only populate classes if "Inside a class" is selected
      if (locationInside && locationInside.checked) {
        const campus = campusSelect.value;
        const block = blockSelect.value;
        if (campus && block) {
          populateClasses(campus, block);
        }
      }
    });
  }

  // Location type radio button events
  if (locationInside) {
    locationInside.addEventListener("change", toggleLocationFields);
  }

  if (locationOutside) {
    locationOutside.addEventListener("change", toggleLocationFields);
  }
});
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


// === Form Submission ===
$("reportForm").addEventListener("submit", async (e) => {
  e.preventDefault();

  let typeVal = $("typeSelect").value;
  if (typeVal === "Other") typeVal = $("otherTypeInput").value.trim() || "Other";

  const formData = new FormData();
  formData.append("category", $("categorySelect").value);
  formData.append("type", typeVal);
  formData.append("campus", $("campusSelect").value);
  formData.append("block", $("blockSelect").value);
  formData.append("nearestClass", $("nearestClassInput").value.trim());
  formData.append("notes", $("descriptionInput").value.trim());

  const imageFile = $("issueImage").files[0];
  if (imageFile) {
    formData.append("issueImage", imageFile);
  }

  try {
    const res = await fetch("/report", {
      method: "POST",
      body: formData, // No need for headers, fetch sets it for FormData
    });

    if (res.status === 401) {
      const result = await res.json();
      alert(result.message || "You must be logged in to submit a report.");
      window.location.href = "/sign-in";
      return;
    }

    const result = await res.json();
    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred submitting the report.");
  }



  // Basic frontend validation
  if (!data.category || !data.type || !data.notes) {
    alert("Please fill in required fields.");
    return;
  }

  try {
    const res = await fetch("/report", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    // If the backend explicitly returned 401 (not logged in)
    if (res.status === 401) {
      const result = await res.json();
      alert(result.message || "You must be logged in to submit a report.");
      window.location.href = "/sign-in"; // redirect
      return;
    }

    const result = await res.json();
    if (result.success) {
      // Redirect on success
      window.location.href = "/dashboard";
    } else {
      alert("Error: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred submitting the report.");
  }
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




















// const STORAGE_KEY = "dut_requests_v1";
// const logoutBtn = document.getElementById("logoutBtn");
// const $ = (id) => document.getElementById(id);
//
// // ---- Campus/Block dropdown logic ----
// const blockOptions = {
//   Ritson: [
//     "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H","Block I","Block J","Block K","Block L","Block M","Block N","Block O","Block P","Block Q","Block R","Block S","Block T","Block U","Block V","Open House Annexe","Canteen"
//   ],
//   Steve: [
//     "S1","S2","S3","S4","S5","S6","S7","S8","S9"
//   ],
//   "ML Sultan": [
//     "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H","Block I","Block J","Block K","Block L","Block M"
//   ],
//   City: [
//     "Block A","Block B","Block C","Block D","Block E","Block F","Block G","Block H"
//   ],
//   Brickfield: [
//     "Block"
//   ],
//   Indumiso: [
//     "Block"
//   ],
//   Riverside: [
//     "Block"
//   ]
// };
//
// document.addEventListener("DOMContentLoaded", function () {
//   const campusSelect = $("campusSelect");
//   const blockSelect = $("blockSelect");
//
//   function populateBlocks(campus) {
//     blockSelect.innerHTML = '<option value="" disabled selected>Select a block</option>';
//     if (blockOptions[campus]) {
//       for (const block of blockOptions[campus]) {
//         const opt = document.createElement("option");
//         opt.value = block;
//         opt.textContent = block;
//         blockSelect.appendChild(opt);
//       }
//     }
//   }
//
//   if (campusSelect) {
//     campusSelect.addEventListener("change", function () {
//       populateBlocks(campusSelect.value);
//     });
//   }
// });
//
// // ---- End campus/block dropdown logic ----
//
// function generateId() {
//   let lastRef = parseInt(localStorage.getItem("dut_last_ref_no") || "0", 10);
//   let nextRef = lastRef + 1;
//   localStorage.setItem("dut_last_ref_no", nextRef);
//   return "#" + nextRef.toString().padStart(4, "0");
// }
//
// function saveRequests(arr) {
//   localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
// }
//
// function loadRequests() {
//   try {
//     return JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
//   } catch {
//     return [];
//   }
// }
//
// // Category → Type filter
// $("categorySelect").addEventListener("change", (e) => {
//   const typeSel = $("typeSelect");
//   const groups = typeSel.querySelectorAll("optgroup");
//   groups.forEach((g) => (g.hidden = g.label !== e.target.value));
//   typeSel.value = "";
//   $("otherTypeInput").classList.add("hidden");
// });
//
// // Show extra input if "Other" selected
// $("typeSelect").addEventListener("change", (e) => {
//   if (e.target.value === "Other")
//     $("otherTypeInput").classList.remove("hidden");
//   else $("otherTypeInput").classList.add("hidden");
// });
//
// // Handle form submit
// $("reportForm").addEventListener("submit", (e) => {
//   e.preventDefault();
//   let category = $("categorySelect").value;
//   let type = $("typeSelect").value;
//   if (type === "Other")
//     type = $("otherTypeInput").value.trim() || "Other";
//   // ---- USE SELECTS FOR CAMPUS/BLOCK ----
//   const campus = $("campusSelect") ? $("campusSelect").value : "";
//   const block = $("blockSelect") ? $("blockSelect").value : "";
//   // ---- END CHANGE ----
//   const nearestClass = $("nearestClassInput").value.trim();
//   const description = $("descriptionInput").value.trim();
//   if (!category || !type || !description) {
//     alert("Please fill in required fields");
//     return;
//   }
//   const now = new Date();
//   const req = {
//     id: generateId(),
//     category,
//     type,
//     campus,
//     block,
//     nearestClass,
//     notes: description,
//     status: "pending",
//     date: now.toLocaleDateString("en-GB"),
//     time: now.toLocaleTimeString("en-GB", {
//       hour: "2-digit",
//       minute: "2-digit",
//     }),
//   };
//   const arr = loadRequests();
//   arr.unshift(req);
//   saveRequests(arr);
//   window.location.href = "dashboard";
// });
//
// // Logout
// if (logoutBtn) {
//   logoutBtn.addEventListener("click", () => {
//     localStorage.removeItem("signedInEmail");
//     localStorage.removeItem("userProfile");
//     window.location.href = "Sign in (DESKTOP).html";
//   });
// }
//
// // Logo bounce 
// document.querySelectorAll(".logo-box").forEach((logo) => {
//   logo.addEventListener("mousedown", () => (logo.style.transform = "scale(0.96) rotate(-1deg)"));
//   logo.addEventListener("mouseup", () => (logo.style.transform = ""));
//   logo.addEventListener("mouseleave", () => (logo.style.transform = ""));
//   logo.addEventListener("touchstart", () => (logo.style.transform = "scale(0.96) rotate(-1deg)"));
//   logo.addEventListener("touchend", () => (logo.style.transform = ""));
// });
//
// // Ripple effect (still JS logic, only styling simplified with Tailwind classes if desired)
// document.querySelectorAll(".icon-btn").forEach((btn) => {
//   btn.addEventListener("click", function (e) {
//     const ripple = document.createElement("span");
//     ripple.className =
//       "absolute bg-indigo-200/30 rounded-full pointer-events-none w-9 h-9 opacity-70 transform scale-0 transition duration-300";
//     ripple.style.left = e.offsetX - 18 + "px";
//     ripple.style.top = e.offsetY - 18 + "px";
//     btn.appendChild(ripple);
//     setTimeout(() => {
//       ripple.style.transform = "scale(1.5)";
//       ripple.style.opacity = "0";
//     }, 10);
//     setTimeout(() => {
//       ripple.remove();
//     }, 500);
//   });
// });
