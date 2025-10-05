document.addEventListener("DOMContentLoaded", async () => {
  const requestsGrid = document.getElementById("requestsGrid");
  const filterStatus = document.getElementById("filterStatus");
  const filterCategory = document.getElementById("filterCategory");
  const filterType = document.getElementById("filterType");
  const filterSearch = document.getElementById("filterSearch");
  const clearFiltersBtn = document.getElementById("clearFilters");

  const modalBg = document.getElementById("modalBg");
  const closeModalBtn = document.getElementById("closeModal");
  const editForm = document.getElementById("editForm");
  const editRef = document.getElementById("editRef");
  const editCategory = document.getElementById("editCategory");
  const editType = document.getElementById("editType");
  const editStatus = document.getElementById("editStatus");
  const editDesc = document.getElementById("editDesc");
  const charCount = document.getElementById("charCount");

  const customTechDropdownBtn = document.getElementById("customTechDropdownBtn");
  const customTechDropdownList = document.getElementById("customTechDropdownList");
  const customTechSelectedName = document.getElementById("customTechSelectedName");
  const customTechSelectedCount = document.getElementById("customTechSelectedCount");

  let allReports = [];
  let allTechnicians = [];
  let selectedTechnicianId = null;
  let currentReportId = null;

  /* ------------------- Fetch Reports ------------------- */
  async function fetchReports() {
    try {
      const res = await fetch("/admin/reports", {
        headers: {
          "Accept": "application/json"
        }
      });

      if (!res.ok) throw new Error("Failed to fetch reports");
      allReports = await res.json();
      renderReports(allReports);
    } catch (err) {
      console.error("Error fetching reports:", err);
      requestsGrid.innerHTML = `<p class="text-red-600">Error loading reports.</p>`;
    }
  }

  /* ------------------- Fetch Technicians ------------------- */
  async function fetchTechnicians() {
    try {
      const res = await fetch("/admin/technicians", {
        headers: {
          "Accept": "application/json"
        }
        
      });

      if (!res.ok) throw new Error("Failed to fetch technicians");
      allTechnicians = await res.json();
      renderTechnicianDropdown(allTechnicians);
    } catch (err) {
      console.error("Error fetching technicians:", err);
    }
  }

  /* ------------------- Render Reports ------------------- */
  function renderReports(reports) {
    requestsGrid.innerHTML = "";

    if (!reports.length) {
      requestsGrid.innerHTML = `<p class="text-gray-600">No reports found.</p>`;
      return;
    }

    reports.forEach((r) => {
      const card = document.createElement("div");
      card.className =
        "card-static bg-white p-5 rounded-xl shadow hover:shadow-lg transition cursor-pointer";
      card.innerHTML = `
        <div class="flex justify-between items-center mb-2">
          <span class="font-mono text-sm text-gray-500">#${r.ref_no}</span>
          <span class="status-badge status-${r.status}">${r.status
        .replace("-", " ")
        .toUpperCase()}</span>
        </div>
        <div class="font-semibold text-lg mb-1">${r.category}</div>
        <div class="text-gray-700 mb-2">${r.type}</div>
        <p class="text-sm text-gray-600 mb-3">${r.description}</p>
        <div class="flex justify-between text-sm text-gray-500">
          <span>${r.campus}</span>
          <span>${r.report_date}</span>
        </div>
      `;
      card.addEventListener("click", () => openModal(r));
      requestsGrid.appendChild(card);
    });
  }

  /* ------------------- Modal Handling ------------------- */
  function openModal(report) {
    currentReportId = report.id;
    editRef.textContent = report.ref_no;
    editCategory.value = report.category;
    editStatus.value = report.status;
    editDesc.value = report.description;
    updateCharCount();

    // Load type options dynamically per category
    populateTypeDropdown(editCategory.value, report.type);

    // Select current technician
    if (report.technician_id) {
      const tech = allTechnicians.find((t) => t.id === report.technician_id);
      if (tech) {
        selectedTechnicianId = tech.id;
        customTechSelectedName.textContent = tech.name;
        customTechSelectedCount.textContent = tech.current_jobs;
      }
    } else {
      selectedTechnicianId = null;
      customTechSelectedName.textContent = "Unassigned";
      customTechSelectedCount.textContent = "0";
    }

    modalBg.style.display = "flex";
  }

  closeModalBtn.addEventListener("click", () => (modalBg.style.display = "none"));
  modalBg.addEventListener("click", (e) => {
    if (e.target === modalBg) modalBg.style.display = "none";
  });

  /* ------------------- Update Report ------------------- */
  editForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const updated = {
      category: editCategory.value,
      type: editType.value,
      status: editStatus.value,
      description: editDesc.value,
      technician_id: selectedTechnicianId,
    };

    try {
      const res = await fetch(`/admin/reports/${currentReportId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to update report");
      modalBg.style.display = "none";
      await fetchReports();
    } catch (err) {
      console.error("Error updating report:", err);
      alert("Failed to update report.");
    }
  });

  /* ------------------- Character Counter ------------------- */
  function updateCharCount() {
    charCount.textContent = `${editDesc.value.length}/500`;
  }
  editDesc.addEventListener("input", updateCharCount);

  /* ------------------- Category -> Type Dropdown ------------------- */
  const typeOptions = {
    Electrical: ["Wiring", "Power Outage", "Lighting", "Equipment"],
    Plumbing: ["Leak", "Clog", "Fixture", "Water Pressure"],
    Infrastructure: ["Wall", "Ceiling", "Door/Window", "Flooring"],
    "General / Other": ["Cleaning", "Furniture", "Other"],
  };

  function populateTypeDropdown(category, selectedType = "") {
    editType.innerHTML = '<option value="" disabled>Select a type</option>';
    if (typeOptions[category]) {
      typeOptions[category].forEach((type) => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        if (type === selectedType) opt.selected = true;
        editType.appendChild(opt);
      });
    }
  }

  editCategory.addEventListener("change", () =>
    populateTypeDropdown(editCategory.value)
  );

  /* ------------------- Technician Dropdown ------------------- */
  function renderTechnicianDropdown(techs) {
    customTechDropdownList.innerHTML = "";
    techs.forEach((t) => {
      const row = document.createElement("div");
      row.className = "dropdown-list-row";
      row.textContent = `${t.name}`;
      const count = document.createElement("span");
      count.textContent = t.current_jobs;
      row.appendChild(count);
      row.addEventListener("click", () => {
        selectedTechnicianId = t.id;
        customTechSelectedName.textContent = t.name;
        customTechSelectedCount.textContent = t.current_jobs;
        customTechDropdownList.classList.add("hidden");
      });
      customTechDropdownList.appendChild(row);
    });
  }

  customTechDropdownBtn.addEventListener("click", () => {
    customTechDropdownList.classList.toggle("hidden");
  });

  document.addEventListener("click", (e) => {
    if (
      !customTechDropdownBtn.contains(e.target) &&
      !customTechDropdownList.contains(e.target)
    ) {
      customTechDropdownList.classList.add("hidden");
    }
  });

  /* ------------------- Filters ------------------- */
  function applyFilters() {
    let filtered = [...allReports];
    const status = filterStatus.value;
    const category = filterCategory.value;
    const type = filterType.value;
    const search = filterSearch.value.toLowerCase();

    if (status) filtered = filtered.filter((r) => r.status === status);
    if (category) filtered = filtered.filter((r) => r.category === category);
    if (type) filtered = filtered.filter((r) => r.type === type);
    if (search)
      filtered = filtered.filter(
        (r) =>
          r.ref_no.toLowerCase().includes(search) ||
          r.description.toLowerCase().includes(search) ||
          r.campus.toLowerCase().includes(search)
      );

    renderReports(filtered);
  }

  [filterStatus, filterCategory, filterType, filterSearch].forEach((el) =>
    el.addEventListener("input", applyFilters)
  );

  filterCategory.addEventListener("change", () => {
    const category = filterCategory.value;
    filterType.disabled = !category;
    filterType.innerHTML = `<option value="">Type: All</option>`;
    if (category && typeOptions[category]) {
      typeOptions[category].forEach((type) => {
        const opt = document.createElement("option");
        opt.value = type;
        opt.textContent = type;
        filterType.appendChild(opt);
      });
    }
    applyFilters();
  });

  clearFiltersBtn.addEventListener("click", () => {
    filterStatus.value = "";
    filterCategory.value = "";
    filterType.innerHTML = `<option value="">Type: All</option>`;
    filterType.disabled = true;
    filterSearch.value = "";
    renderReports(allReports);
  });

  /* ------------------- Init ------------------- */
  await fetchTechnicians();
  await fetchReports();
});
