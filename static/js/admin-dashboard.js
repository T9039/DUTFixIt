document.addEventListener('DOMContentLoaded', function () {
  const API_URL = "/admin/dashboard";  // Flask backend route

  // Sidebar controls
  const sidebarOpenBtn = document.getElementById('sidebarOpenBtn');
  const sidebarBg = document.getElementById('sidebarBg');
  const sidebarBox = document.getElementById('sidebarBox');
  const sidebarCloseBtn = document.getElementById('sidebarCloseBtn');
  const sidebarLogoutBtn = document.getElementById('sidebarLogoutBtn');
  const sidebarProfileBtn = document.getElementById('sidebarProfileBtn');

  sidebarOpenBtn.addEventListener('click', () => {
    sidebarBg.classList.remove('hidden');
    sidebarBox.classList.remove('translate-x-full');
    sidebarBox.setAttribute('aria-hidden', 'false');
    sidebarBg.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
  });
  function closeSidebar() {
    sidebarBox.classList.add('translate-x-full');
    sidebarBg.classList.add('hidden');
    sidebarBox.setAttribute('aria-hidden', 'true');
    sidebarBg.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
  }
  sidebarCloseBtn.addEventListener('click', closeSidebar);
  sidebarBg.addEventListener('click', (e) => { if (e.target === sidebarBg) closeSidebar(); });
  sidebarLogoutBtn.addEventListener('click', () => {
    window.location.href = "sign-in.html";
  });
  sidebarProfileBtn.addEventListener('click', () => window.location.href = "profile.html");

  // Elements
  const tbody = document.getElementById('requestTableBody');
  const cardsContainer = document.getElementById('requestCards');
  const searchBar = document.getElementById('searchBar');
  const filterButtons = Array.from(document.querySelectorAll('.filter-btn'));
  const summaryText = document.getElementById('summaryText');
  const notificationCounter = document.getElementById('notificationCounter');

  let allRequests = [];
  let currentFilter = 'All';
  let currentSearch = '';
  let searchTimeout = null;

  // Helpers
  function formatLocation(campus, block) {
    if (campus && block) return `${campus.trim()} / ${block.trim()}`;
    if (campus) return campus.trim();
    if (block) return block.trim();
    return 'Unknown';
  }
  function truncateText(text, maxWords = 12) {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= maxWords) return text;
    return words.slice(0, maxWords).join(' ') + '...';
  }
  function statusClassTailwind(status) {
    const base = "rounded-full px-3 py-1 font-bold text-sm border-none outline-none";
    switch (status) {
      case 'pending': return base + " bg-amber-400 text-amber-900";
      case 'in-progress': return base + " bg-blue-500 text-white";
      case 'done': return base + " bg-emerald-500 text-white";
      default: return base + " bg-gray-300 text-gray-800";
    }
  }

  // Fetch requests from backend
  async function fetchRequests() {
    try {
      const res = await fetch(API_URL, {
        headers: {
          "Accept": "application/json"
        }
      });

      // Check for network errors
      if (!res.ok) {
        throw new Error(`HTTP error! Status: ${res.status}`);
      }

      // Clone response so we can safely inspect text if JSON parsing fails
      const resClone = res.clone();
      let data;

      try {
        data = await res.json();
      } catch (jsonErr) {
        const textBody = await resClone.text();
        console.error("⚠️ Expected JSON but got:", textBody.slice(0, 300));
        throw new Error("Response was not valid JSON");
      }

      // Validate JSON content
      if (Array.isArray(data)) {
        allRequests = data;
        renderRequests();
      } else {
        console.warn("Unexpected response format:", data);
        tbody.innerHTML = `
          <tr>
            <td colspan="7" class="p-6 text-center text-red-500 italic">
              Invalid data format.
            </td>
          </tr>`;
      }

    } catch (err) {
      console.error("Failed to fetch requests:", err);
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="p-6 text-center text-red-500 italic">
            Error loading requests.
          </td>
        </tr>`;
    }
  }

  // Get filtered data
  function getFiltered() {
    const term = currentSearch.trim().toLowerCase();
    return allRequests.filter(req => {
      if (currentFilter !== 'All' && req.status !== currentFilter) return false;
      if (!term) return true;
      const hay = `
        ${req.id} 
        ${req.category || ''} 
        ${req.type || ''} 
        ${req.campus || ''} 
        ${req.block || ''} 
        ${req.notes || ''} 
        ${req.technician || ''} 
        ${req.status || ''}   <!-- include status -->
      `.toLowerCase();
      return hay.includes(term);
    });
  }

  // Update status (syncs directly with backend)
  async function updateStatus(id, newStatus) {
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus })
      });
      if (!res.ok) throw new Error("Update failed");
      // update locally in memory
      const idx = allRequests.findIndex(r => r.id == id);
      if (idx >= 0) allRequests[idx].status = newStatus;
      renderRequests();
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update request status.");
    }
  }

  // Renderers
  function renderTableRows(requests) {
    tbody.innerHTML = '';
    if (!requests || requests.length === 0) {
      tbody.innerHTML = `<tr><td colspan="7" class="p-6 text-center text-gray-500 italic">No requests found.</td></tr>`;
      return;
    }

    requests.forEach(req => {
      const tr = document.createElement('tr');
      tr.className = 'bg-white transition-transform duration-150 hover:-translate-y-1 hover:shadow-lg';
      tr.innerHTML = `
        <td class="font-mono font-extrabold p-4">${req.id}</td>
        <td class="p-4">${formatLocation(req.campus, req.block)}</td>
        <td class="p-4">${req.category || '-'}</td>
        <td class="p-4">${req.type || '-'}</td>
        <td class="p-4">
          <span class="status-display px-2 py-1 rounded bg-gray-200 text-gray-800 font-mono text-sm">
            ${req.status}
          </span>
        </td>
        <td class="p-4">${req.technician || 'Unassigned'}</td>
        <td class="p-4">${truncateText(req.notes || 'No description provided', 14)}</td>
      `;
      tbody.appendChild(tr);

      // When row clicked → open modal
      tr.addEventListener("click", (e) => {
        if (["select", "button", "svg", "path"].includes(e.target.tagName.toLowerCase())) return;
        openRequestModal(req); // <-- use your new modal function
      });
      

      // const sel = tr.querySelector('select.status-select');
      // sel.className = statusClassTailwind(req.status) + " status-select";
      // sel.addEventListener('change', e => updateStatus(req.id, e.target.value));
    });
  }

  // Put this inside DOMContentLoaded (after your other declarations)
  let currentRequest = null;
  let openModalCount = 0; // track how many modals are open to restore scrolling properly

  // helper to lock/unlock body scroll
  function pushModalLock() {
    openModalCount++;
    document.body.style.overflow = 'hidden';
  }
  function popModalLock() {
    openModalCount = Math.max(0, openModalCount - 1);
    if (openModalCount === 0) document.body.style.overflow = '';
  }

  // ELEMENTS
  const requestModal = document.getElementById("requestModal");
  const modalContent = document.getElementById("modalContent");
  const modalCloseBtn = document.getElementById("modalCloseBtn");

  const assignModal = document.getElementById("assignModal");
  const closeAssignModal = document.getElementById("closeAssignModal");
  const assignTechSelect = document.getElementById("assignTechSelect");
  const saveAssignBtn = document.getElementById("saveAssignBtn");

  const assignTechBtn = document.getElementById("assignTechBtn");
  const notifyTechBtn = document.getElementById("notifyTechBtn");

  const notificationModal = document.getElementById("notificationModal");
  const closeNotificationModal = document.getElementById("closeNotificationModal");
  const sendNotificationBtn = document.getElementById("sendNotificationBtn");
  const notificationSubject = document.getElementById("notificationSubject");
  const notificationMessage = document.getElementById("notificationMessage");

  // SAMPLE tech list (replace with real fetch or data)

  async function loadTechnicians() {
    try {
      const res = await fetch("/admin/technicians", {
        headers: { Accept: "application/json" }
      });
      const techList = await res.json();

      assignTechSelect.innerHTML = '<option value="">-- choose technician --</option>';
      techList.forEach(t => {
        const opt = document.createElement('option');
        opt.value = t.id;          // send id to backend
        opt.textContent = t.name;
        assignTechSelect.appendChild(opt);
      });
    } catch (err) {
      console.error("Failed to load technicians:", err);
    }
  }


  // OPEN / CLOSE helpers
  function show(el) {
    el.classList.remove('hidden');
    el.classList.add('flex');
    pushModalLock();
  }
  function hide(el) {
    el.classList.add('hidden');
    el.classList.remove('flex');
    popModalLock();
  }

  // Open request modal and populate with full details
  function openRequestModal(req) {
    currentRequest = req;
    modalContent.innerHTML = `
      <p><strong>Request ID:</strong> ${req.id}</p>
      <p><strong>Campus:</strong> ${req.campus || 'N/A'}</p>
      <p><strong>Block:</strong> ${req.block || 'N/A'}</p>
      <p><strong>Category:</strong> ${req.category || 'N/A'}</p>
      <p><strong>Type:</strong> ${req.type || 'N/A'}</p>
      <p><strong>Status:</strong> ${req.status || 'N/A'}</p>
      <p><strong>Technician:</strong> <span id="modalTechName">${req.technician || 'Unassigned'}</span></p>
      <p><strong>Description:</strong></p>
      <p class="bg-gray-100 p-3 rounded-lg">${req.notes || 'No description provided'}</p>
    `;

    // enable/disable notify button depending on assignment
    if (req.technician !== "Unassigned") {
      notifyTechBtn.disabled = false;
      notifyTechBtn.classList.remove('opacity-50');
    } else {
      notifyTechBtn.disabled = true;
      notifyTechBtn.classList.add('opacity-50');
    }

    show(requestModal);
  }

  // Close request modal
  function closeRequestModal() {
    hide(requestModal);
    currentRequest = null;
  }

  // assign modal open
  function openAssignModal() {
    // populate select
    loadTechnicians();

    // if request already has tech, preselect it
    assignTechSelect.value = currentRequest && currentRequest.technician ? currentRequest.technician : '';

    show(assignModal);
  }

  // save selected technician
  saveAssignBtn.addEventListener('click', async () => {
    const chosen = assignTechSelect.value;
    const chosen_name = assignTechSelect.options[assignTechSelect.selectedIndex].text;
    if (!chosen) {
      alert('Please select a technician.');
      return;
    }

    // Update currentRequest and the in-memory allRequests (if you have it)
    try {
      const res = await fetch("/admin/assign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ report_id: currentRequest.id, technician_id: chosen })
      });
      const data = await res.json();
      if (res.ok) {
        alert(data.message);

        // Update UI immediately
        currentRequest.technician = `${chosen_name}`; // optionally fetch real name from server
        openRequestModal(currentRequest);
        renderTableRows(allRequests); // refresh table

        // enable notify
        notifyTechBtn.disabled = false;
        notifyTechBtn.classList.remove('opacity-50');

      } else {
        alert(data.message || "Assignment failed");
      }
    } catch (err) {
      console.error(err);
      alert("Error assigning technician");
    }


      // rerender table/cards
      // if (typeof renderRequests === 'function') renderRequests();

    hide(assignModal);
  });

  // Hook up assign button (from request modal)
  assignTechBtn.addEventListener('click', (e) => {
    // prevent click from bubbling to row handlers if any
    e.stopPropagation();
    if (!currentRequest) {
      alert('No request selected.');
      return;
    }
    openAssignModal();
  });

  // Notification button
  notifyTechBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    if (!currentRequest || !currentRequest.technician) {
      alert("Please assign a technician first.");
      return;
    }
    // preclear inputs
    notificationSubject.value = '';
    notificationMessage.value = '';
    show(notificationModal);
  });

  // Send notification (replace with real fetch to backend)
  sendNotificationBtn.addEventListener("click", async () => {
    const subject = document.getElementById("notificationSubject").value.trim();
    const message = document.getElementById("notificationMessage").value.trim();

    if (!subject || !message) {
      alert("Please fill in both fields.");
      return;
    }

    if (!currentRequest) return;

    try {
      const res = await fetch("/admin/notify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          report_id: currentRequest.id,
          subject,
          message
        })
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);

        // Close and reset notification modal
        document.getElementById("notificationSubject").value = "";
        document.getElementById("notificationMessage").value = "";

        
        hide(notificationModal)
      } else {
        alert(data.message || "Failed to send notification");
      }
    } catch (err) {
      console.error(err);
      alert("Error sending notification");
    }
  });

  // Close buttons / overlay click behaviour
  modalCloseBtn.addEventListener('click', closeRequestModal);
  requestModal.addEventListener('click', (e) => { if (e.target === requestModal) closeRequestModal(); });

  closeAssignModal.addEventListener('click', () => hide(assignModal));
  assignModal.addEventListener('click', (e) => { if (e.target === assignModal) hide(assignModal); });

  closeNotificationModal.addEventListener('click', () => hide(notificationModal));
  notificationModal.addEventListener('click', (e) => { if (e.target === notificationModal) hide(notificationModal); });



  function renderCards(requests) {
    cardsContainer.innerHTML = '';
    if (!requests || requests.length === 0) {
      cardsContainer.innerHTML = `<div class="text-center text-gray-500 italic py-8">No requests found.</div>`;
      return;
    }

    requests.forEach(req => {
      const card = document.createElement('article');
      card.className = 'bg-white rounded-xl shadow p-4 flex flex-col gap-3 transition-transform duration-150 hover:-translate-y-1';
      card.innerHTML = `
        <div class="flex justify-between items-start">
          <div>
            <div class="text-xs text-gray-500">Ref</div>
            <div class="font-semibold">Request ${req.id}</div>
            <div class="text-sm text-gray-600">${formatLocation(req.campus, req.block)}</div>
          </div>
          <div class="text-right">
            <div class="text-xs text-gray-500">Status</div>
            <div class="mt-1">
              <select class="status-select-card" data-id="${req.id}">
                <option value="pending"${req.status === 'pending' ? ' selected' : ''}>Pending</option>
                <option value="in-progress"${req.status === 'in-progress' ? ' selected' : ''}>In Progress</option>
                <option value="done"${req.status === 'done' ? ' selected' : ''}>Done</option>
              </select>
            </div>
          </div>
        </div>
        <div class="flex justify-between text-sm">
          <div><div class="text-xs text-gray-500">Category</div><div class="font-medium">${req.category || '-'}</div></div>
          <div><div class="text-xs text-gray-500">Type</div><div class="font-medium">${req.type || '-'}</div></div>
        </div>
        <div class="text-sm">
          <div class="text-xs text-gray-500">Notes</div>
          <div class="mt-1 text-gray-700">${truncateText(req.notes || 'No description', 20)}</div>
        </div>
      `;
      cardsContainer.appendChild(card);

      card.addEventListener("click", (e) => {
        if (["select", "button", "svg", "path"].includes(e.target.tagName.toLowerCase())) return;
        openRequestModal(req); // <-- use your new modal function
      });
      

      // const sel = card.querySelector('select.status-select-card');
      // sel.className = statusClassTailwind(req.status) + " status-select-card";
      // sel.addEventListener('change', e => updateStatus(req.id, e.target.value));
    });
  }

  function renderRequests() {
    const filtered = getFiltered();
    renderTableRows(filtered);
    renderCards(filtered);
    summaryText.textContent = `Showing ${filtered.length} request${filtered.length !== 1 ? 's' : ''}`;
  }

  // Filter and search logic
  filterButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      filterButtons.forEach(b => b.classList.remove('active', 'bg-indigo-50'));
      btn.classList.add('active', 'bg-indigo-50');
      currentFilter = btn.textContent.trim().toLowerCase();
      if (currentFilter === 'all') currentFilter = 'All';
      renderRequests();
    });
  });

  searchBar.addEventListener('input', () => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
      currentSearch = searchBar.value;
      renderRequests();
    }, 300);
  });

  // Init
  fetchRequests();
});

