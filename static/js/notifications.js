// const list = document.getElementById("notificationList");
// const loading = document.getElementById("loading");
// const markAllBtn = document.getElementById("markAllReadBtn");
// const modal = document.getElementById("notifModal");
// const closeModal = document.getElementById("closeModal");
//
// const modalType = document.getElementById("modalType");
// const modalRef = document.getElementById("modalRef");
// const modalHeading = document.getElementById("modalHeading");
// const modalMessage = document.getElementById("modalMessage");
// const modalSender = document.getElementById("modalSender");
// const modalDate = document.getElementById("modalDate");

async function fetchNotifications() {
  const list = document.getElementById("notificationsList");
  const loading = document.getElementById("loading");
  list.innerHTML = "";
  loading.textContent = "Loading notifications...";

  try {
    const res = await fetch("/user/notifications-data");
    const data = await res.json();
    list.innerHTML = "";
    loading.textContent = "";

    if (!data.notifications.length) {
      loading.textContent = "No notifications found.";
      return;
    }

    data.notifications.forEach((notif) => {
      const typeColor =
        notif.type === "Status Update"
          ? "text-blue-600 bg-blue-50"
          : "text-green-600 bg-green-50";

      // Build notification card (compressed by default)
      const div = document.createElement("div");
      div.className =
        "bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition cursor-pointer flex flex-col gap-2";

      // If unread — highlight
      if (!notif.read) div.classList.add("ring-2", "ring-blue-300");

      div.innerHTML = `
        <div class="flex justify-between items-center">
          <span class="inline-block text-sm font-medium px-3 py-1 rounded-full ${typeColor}">
            ${notif.type}
          </span>
          <span class="text-xs text-gray-400">${new Date(
            notif.date
          ).toLocaleString()}</span>
        </div>

        <p class="text-sm text-gray-500">Report Ref: <span class="font-medium text-gray-700">#${notif.report_ref}</span></p>
        <h3 class="text-lg font-semibold text-gray-800">${notif.heading}</h3>
        ${
          notif.read
            ? `<p class="text-gray-700">${notif.message}</p>
               <p class="text-sm text-gray-500 mt-2">From: <span class="font-medium text-gray-700">${notif.sender}</span></p>`
            : ""
        }
      `;

      // On click — open modal and mark as read
      div.addEventListener("click", async () => {
        showModal(notif);

        // mark as read backend
        if (!notif.read) {
          await fetch(`/user/notifications-read/${notif.id}`, {
            method: "POST",
          });
          div.classList.remove("ring-2", "ring-blue-300");
          notif.read = true;
        }
      });

      list.appendChild(div);
    });
  } catch (error) {
    console.error(error);
    loading.textContent = "Error loading notifications.";
  }
}

// Modal Logic
const modal = document.getElementById("notificationModal");
const modalContent = document.getElementById("modalContent");
const closeModal = document.getElementById("closeModal");

function showModal(notif) {
  modalContent.innerHTML = `
    <div class="flex flex-col gap-3">
      <span class="inline-block text-sm font-medium px-3 py-1 rounded-full ${
        notif.type === "Status Update"
          ? "text-blue-600 bg-blue-50"
          : "text-green-600 bg-green-50"
      }">${notif.type}</span>
      <p class="text-sm text-gray-500">Report Ref: <span class="font-medium text-gray-700">#${notif.report_ref}</span></p>
      <h2 class="text-xl font-semibold text-gray-800">${notif.heading}</h2>
      <p class="text-gray-700 mt-1">${notif.message}</p>
      <div class="flex justify-between items-center mt-3 text-sm text-gray-500">
        <p>From: <span class="font-medium text-gray-700">${notif.sender}</span></p>
        <p>${new Date(notif.date).toLocaleString()}</p>
      </div>
    </div>
  `;
  modal.classList.remove("hidden");
}

closeModal.addEventListener("click", () => modal.classList.add("hidden"));
modal.addEventListener("click", (e) => {
  if (e.target === modal) modal.classList.add("hidden");
});

// Mark all as read
document
  .getElementById("markAllBtn")
  .addEventListener("click", async () => {
    await fetch("/user/notifications-read-all", { method: "POST" });
    fetchNotifications();
  });

// Initial fetch
fetchNotifications();
