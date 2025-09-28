const STORAGE_KEY = "dut_requests_v1";
const logoutBtn = document.getElementById("logoutBtn");

function statusColor(status) {
  if (status === "pending") return "bg-gray-300 text-gray-700";
  if (status === "in-progress") return "bg-yellow-200 text-yellow-800";
  if (status === "done") return "bg-green-200 text-green-800";
  return "bg-gray-100 text-gray-600";
}

function loadRequests() {
  const requests = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

  // Desktop table
  const tableBody = document.querySelector("#issuesTable tbody");
  if (tableBody) {
    tableBody.innerHTML = "";
    requests.forEach((req) => {
      const row = document.createElement("tr");
      row.classList.add("border", "border-gray-300", "hover:bg-indigo-50", "hover:shadow", "hover:scale-[1.01]", "transition");
      row.innerHTML = `
        <td class="px-4 py-2">${req.id}</td>
        <td class="px-4 py-2">${req.category}</td>
        <td class="px-4 py-2">${req.type}</td>
        <td class="px-4 py-2">
          <span class="inline-block px-2 py-1 rounded ${statusColor(req.status)} text-xs font-semibold">
            ${req.status.charAt(0).toUpperCase() + req.status.slice(1)}
          </span>
        </td>
        <td class="px-4 py-2">${req.notes}</td>
        <td class="px-4 py-2">${req.date}</td>
        <td class="px-4 py-2">${req.time}</td>
      `;
      tableBody.appendChild(row);
    });
  }

  // Mobile cards
  const cardsBox = document.getElementById("issuesCards");
  if (cardsBox) {
    cardsBox.innerHTML = "";
    requests.forEach((req) => {
      const card = document.createElement("div");
      card.className = "bg-white rounded-xl shadow p-4 flex flex-col hover:shadow-lg hover:scale-[1.02] transition";
      card.innerHTML = `
        <div class="flex justify-between"><span class="font-semibold">Ref No.</span><span>${req.id}</span></div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Category</span><span>${req.category}</span></div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Type</span><span>${req.type}</span></div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Status</span>
          <span class="px-2 py-1 rounded ${statusColor(req.status)} text-xs font-semibold">${req.status.charAt(0).toUpperCase() + req.status.slice(1)}</span>
        </div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Notes</span><span>${req.notes}</span></div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Date</span><span>${req.date}</span></div>
        <div class="flex justify-between mt-1"><span class="font-semibold">Time</span><span>${req.time}</span></div>
      `;
      cardsBox.appendChild(card);
    });
  }
}

window.onload = loadRequests;

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

// Ripple for icon buttons
document.querySelectorAll(".icon-btn").forEach((btn) => {
  btn.addEventListener("click", function (e) {
    const ripple = document.createElement("span");
    ripple.className = "absolute bg-indigo-200/40 rounded-full pointer-events-none w-9 h-9 opacity-70 scale-0";
    ripple.style.left = e.offsetX - 18 + "px";
    ripple.style.top = e.offsetY - 18 + "px";
    btn.appendChild(ripple);
    setTimeout(() => {
      ripple.style.transform = "scale(1.5)";
      ripple.style.opacity = "0";
    }, 10);
    setTimeout(() => ripple.remove(), 500);
  });
});

