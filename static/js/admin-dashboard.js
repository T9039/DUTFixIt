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
      const hay = `${req.id} ${req.category || ''} ${req.type || ''} ${req.campus || ''} ${req.block || ''} ${req.notes || ''} ${req.technician || ''}`.toLowerCase();
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
          <select class="status-select p-0" data-id="${req.id}">
            <option value="pending"${req.status === 'pending' ? ' selected' : ''}>Pending</option>
            <option value="in-progress"${req.status === 'in-progress' ? ' selected' : ''}>In Progress</option>
            <option value="done"${req.status === 'done' ? ' selected' : ''}>Done</option>
          </select>
        </td>
        <td class="p-4">${req.technician || 'Unassigned'}</td>
        <td class="p-4">${truncateText(req.notes || 'No description provided', 14)}</td>
      `;
      tbody.appendChild(tr);

      const sel = tr.querySelector('select.status-select');
      sel.className = statusClassTailwind(req.status) + " status-select";
      sel.addEventListener('change', e => updateStatus(req.id, e.target.value));
    });
  }

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
            <div class="font-semibold">${req.id}</div>
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

      const sel = card.querySelector('select.status-select-card');
      sel.className = statusClassTailwind(req.status) + " status-select-card";
      sel.addEventListener('change', e => updateStatus(req.id, e.target.value));
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

