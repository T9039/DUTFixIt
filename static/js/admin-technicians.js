document.addEventListener("DOMContentLoaded", () => {
  // --- Sidebar controls ---
  const sidebarBg = document.getElementById("sidebarBg");
  const sidebarBox = document.getElementById("sidebarBox");
  const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
  const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
  const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");

  sidebarOpenBtn?.addEventListener("click", () => {
    sidebarBg.classList.add("open");
    sidebarBox.classList.add("open");
  });
  sidebarCloseBtn?.addEventListener("click", () => {
    sidebarBg.classList.remove("open");
    sidebarBox.classList.remove("open");
  });
  sidebarBg?.addEventListener("click", () => {
    sidebarBg.classList.remove("open");
    sidebarBox.classList.remove("open");
  });
  sidebarLogoutBtn?.addEventListener("click", () => {
    fetch("/logout", { method: "POST" }).then(() => (window.location.href = "/login"));
  });

  // --- Custom multiselect ---
  const categoryToggleBtn = document.getElementById("categoryToggleBtn");
  const categoryOptions = document.getElementById("categoryOptions");
  const categoryCheckboxes = categoryOptions?.querySelectorAll("input[type='checkbox']");

  categoryToggleBtn?.addEventListener("click", () => {
    categoryOptions.classList.toggle("show");
  });

  categoryCheckboxes?.forEach((checkbox) => {
    checkbox.addEventListener("change", updateCategoryButton);
  });

  function updateCategoryButton() {
    const selected = Array.from(categoryCheckboxes)
      .filter((c) => c.checked)
      .map((c) => c.value);

    if (selected.length > 0) {
      categoryToggleBtn.innerHTML =
        selected.map((cat) => `<span class="category-badge">${cat}</span>`).join(" ") +
        '<span class="float-right">▼</span>';
    } else {
      categoryToggleBtn.innerHTML = 'Select Categories <span class="float-right">▼</span>';
    }
  }

  document.addEventListener("click", (e) => {
    if (!categoryToggleBtn.contains(e.target) && !categoryOptions.contains(e.target)) {
      categoryOptions.classList.remove("show");
    }
  });

  // --- Technician data ---
  const addForm = document.getElementById("addTechnicianForm");
  const statusFilter = document.getElementById("statusFilter");
  const techniciansTableBody = document.querySelector("#techniciansTable");
  const mobileCardsContainer = document.querySelector("#mobileTechnicianCards");

  let technicians = [];

  async function loadTechnicians() {
    try {
      const res = await fetch("/admin/technicians", {
        headers: {
          "Accept": "application/json"
        }
        
      });

      if (!res.ok) throw new Error("Failed to fetch technicians");
      technicians = await res.json();
      console.log(technicians)
      renderTechnicians();
    } catch (err) {
      console.error(err);
    }
  }

  function renderTechnicians() {
    const status = statusFilter.value;
    const filtered = status === "All" ? technicians : technicians.filter((t) => t.status === status);
    console.log(filtered)

    // Desktop table rendering
    if (techniciansTableBody) {
      console.log(filtered)
      techniciansTableBody.innerHTML = filtered
        .map(
          (t) => `
          <tr>
            <td class="border px-3 py-2">${t.id}</td>
            <td class="border px-3 py-2">${t.name}</td>
            <td class="border px-3 py-2">${t.status}</td>
          </tr>`
        )
        .join("");
    }

    // Mobile card rendering
    if (mobileCardsContainer) {
      mobileCardsContainer.innerHTML = filtered
        .map(
          (t) => `
          <div class="card">
            <div class="row">
              <div><strong>${t.name}</strong></div>
              <div class="small-muted">${t.staff_id}</div>
            </div>
            <div class="badges">${t.categories
              .map((cat) => `<span class="category-badge">${cat}</span>`)
              .join("")}</div>
            <div class="small-muted mt-2">Status: ${t.status}</div>
          </div>`
        )
        .join("");
    }
  }

  // Filter change
  statusFilter?.addEventListener("change", renderTechnicians);

  // Add technician
  addForm?.addEventListener("submit", async (e) => {
    e.preventDefault();

    const staffId = document.getElementById("staffId").value.trim();
    const name = document.getElementById("technicianName").value.trim();
    const categories = Array.from(categoryCheckboxes)
      .filter((c) => c.checked)
      .map((c) => c.value);
    const status = document.getElementById("availabilityStatus").value;

    if (!staffId || !name || !status) return alert("Please fill all fields");

    const newTech = { staff_id: staffId, name, categories, status };

    try {
      const res = await fetch("/admin/technicians", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newTech),
      });

      if (!res.ok) throw new Error("Failed to add technician");

      await loadTechnicians(); // refresh list
      addForm.reset();
      updateCategoryButton();
    } catch (err) {
      console.error(err);
      alert("Error adding technician");
    }
  });

  // Initialize
  loadTechnicians();
});




// ___________________________________________________________________________________________________________


    // <script>
    //   /* ---------- Keys ---------- */
    //   const STORAGE_KEY = "dut_technicians_v1";
    //
    //   /* ---------- Sidebar (keeps your .open toggles) ---------- */
    //   const sidebarOpenBtn = document.getElementById("sidebarOpenBtn");
    //   const sidebarBg = document.getElementById("sidebarBg");
    //   const sidebarBox = document.getElementById("sidebarBox");
    //   const sidebarCloseBtn = document.getElementById("sidebarCloseBtn");
    //   const sidebarLogoutBtn = document.getElementById("sidebarLogoutBtn");
    //   const sidebarProfileBtn = document.getElementById("sidebarProfileBtn");
    //
    //   if (sidebarOpenBtn) {
    //     sidebarOpenBtn.addEventListener("click", () => {
    //       sidebarBg.classList.add("open");
    //       sidebarBox.classList.add("open");
    //       document.body.style.overflow = "hidden";
    //     });
    //   }
    //   function closeSidebar() {
    //     sidebarBg.classList.remove("open");
    //     sidebarBox.classList.remove("open");
    //     document.body.style.overflow = "";
    //   }
    //   if (sidebarCloseBtn)
    //     sidebarCloseBtn.addEventListener("click", closeSidebar);
    //   if (sidebarBg)
    //     sidebarBg.addEventListener("click", (e) => {
    //       if (e.target === sidebarBg) closeSidebar();
    //     });
    //   if (sidebarLogoutBtn)
    //     sidebarLogoutBtn.addEventListener("click", () => {
    //       localStorage.removeItem("signedInEmail");
    //       localStorage.removeItem("userProfile");
    //       window.location.href = "sign-in.html";
    //     });
    //   if (sidebarProfileBtn)
    //     sidebarProfileBtn.addEventListener(
    //       "click",
    //       () => (window.location.href = "profile.html"),
    //     );
    //
    //   /* notification counter (keeps your original behavior) */
    //   function updateNotificationCounter() {
    //     const c = document.getElementById("notificationCounter");
    //     if (!c) return;
    //     const n = JSON.parse(
    //       localStorage.getItem("admin_notifications") || "[]",
    //     );
    //     c.style.display = n.length ? "inline-flex" : "none";
    //     c.textContent = n.length;
    //   }
    //   updateNotificationCounter();
    //   setInterval(updateNotificationCounter, 30000);
    //
    //   /* ---------- Rest of your technician management script ---------- */
    //   const form = document.getElementById("addTechnicianForm");
    //   const tableBody = document.getElementById("techniciansTable");
    //   const mobileCardsWrap = document.getElementById("mobileCardsWrap");
    //   const statusFilter = document.getElementById("statusFilter");
    //   const searchInput = document.getElementById("searchInput");
    //
    //   const catBtn = document.getElementById("categoryToggleBtn");
    //   const catOptions = document.getElementById("categoryOptions");
    //   let selectedCategories = [];
    //
    //   const editModal = document.getElementById("editModal");
    //   const editForm = document.getElementById("editTechnicianForm");
    //   const cancelEditBtn = document.getElementById("cancelEditBtn");
    //   const editStaffId = document.getElementById("editStaffId");
    //   const editTechnicianName = document.getElementById("editTechnicianName");
    //   const editCategoryOptions = document.getElementById(
    //     "editCategoryOptions",
    //   );
    //   const editAvailabilityStatus = document.getElementById(
    //     "editAvailabilityStatus",
    //   );
    //
    //   let technicians = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
    //   let editIndex = null;
    //
    //   /* Multiselect & UI helpers */
    //   if (catBtn) {
    //     catBtn.addEventListener("click", () => {
    //       const expanded = catBtn.getAttribute("aria-expanded") === "true";
    //       catBtn.setAttribute("aria-expanded", String(!expanded));
    //       catOptions.classList.toggle("show");
    //     });
    //   }
    //   if (catOptions) {
    //     catOptions.querySelectorAll('input[type="checkbox"]').forEach((chk) =>
    //       chk.addEventListener("change", () => {
    //         selectedCategories = Array.from(
    //           catOptions.querySelectorAll("input:checked"),
    //         ).map((c) => c.value);
    //         catBtn.textContent = selectedCategories.length
    //           ? selectedCategories.join(", ")
    //           : "Select Categories ▼";
    //       }),
    //     );
    //   }
    //   document.addEventListener("click", (e) => {
    //     if (!catBtn || !catOptions) return;
    //     if (!catBtn.contains(e.target) && !catOptions.contains(e.target)) {
    //       catOptions.classList.remove("show");
    //       catBtn.setAttribute("aria-expanded", "false");
    //     }
    //   });
    //
    //   function saveTechnicians(arr) {
    //     localStorage.setItem(STORAGE_KEY, JSON.stringify(arr));
    //   }
    //   function escapeHtml(str) {
    //     if (str === null || str === undefined) return "";
    //     return String(str).replace(
    //       /[&<>\"'`=\/]/g,
    //       (s) =>
    //         ({
    //           "&": "&amp;",
    //           "<": "&lt;",
    //           ">": "&gt;",
    //           '\"': "&quot;",
    //           "'": "&#39;",
    //           "`": "&#96;",
    //           "=": "&#61;",
    //           "/": "&#47;",
    //         })[s],
    //     );
    //   }
    //   function createBadgeHTML(text) {
    //     return `<span class="category-badge">${escapeHtml(text)}</span>`;
    //   }
    //
    //   let renderTimer = null;
    //   function renderTechnicians() {
    //     if (renderTimer) clearTimeout(renderTimer);
    //     renderTimer = setTimeout(_renderTechniciansNow, 80);
    //   }
    //   function _renderTechniciansNow() {
    //     const filter = statusFilter
    //       ? (statusFilter.value || "All").toLowerCase()
    //       : "all";
    //     const term = searchInput
    //       ? (searchInput.value || "").trim().toLowerCase()
    //       : "";
    //
    //     const withIndex = technicians.map((t, idx) => ({ ...t, _idx: idx }));
    //     const filtered = withIndex.filter((t) => {
    //       const statusMatches =
    //         filter === "all" || (t.status || "").toLowerCase() === filter;
    //       const termMatches =
    //         !term ||
    //         (t.staffId && t.staffId.toLowerCase().includes(term)) ||
    //         (t.name && t.name.toLowerCase().includes(term)) ||
    //         (t.categories &&
    //           t.categories.some((c) => c.toLowerCase().includes(term)));
    //       return statusMatches && termMatches;
    //     });
    //
    //     const ordered = [...filtered].reverse();
    //
    //     if (tableBody) {
    //       tableBody.innerHTML = ordered.length
    //         ? ordered
    //             .map(
    //               (t) => `
    //     <tr>
    //       <td class="px-4 py-2">${escapeHtml(t.staffId)}</td>
    //       <td class="px-4 py-2">${escapeHtml(t.name)}</td>
    //       <td class="px-4 py-2">${(t.categories || []).map((c) => createBadgeHTML(c)).join("")}</td>
    //       <td class="px-4 py-2">${t.assignedRequests ?? 0}</td>
    //       <td class="px-4 py-2 flex gap-2">
    //         <button class="bg-gray-600 text-white px-3 py-1 rounded-md hover:bg-gray-700 edit-btn" data-index="${t._idx}">Edit</button>
    //         <button class="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-600 delete-btn" data-index="${t._idx}">Delete</button>
    //       </td>
    //     </tr>
    //   `,
    //             )
    //             .join("")
    //         : `<tr><td colspan="5" class="text-center py-4 text-gray-500 italic">No technicians found.</td></tr>`;
    //     }
    //
    //     document
    //       .querySelectorAll(".edit-btn")
    //       .forEach((btn) => btn.removeEventListener("click", onEditBtnClick));
    //     document
    //       .querySelectorAll(".edit-btn")
    //       .forEach((btn) => btn.addEventListener("click", onEditBtnClick));
    //
    //     document
    //       .querySelectorAll(".delete-btn")
    //       .forEach((btn) => btn.removeEventListener("click", onDeleteBtnClick));
    //     document
    //       .querySelectorAll(".delete-btn")
    //       .forEach((btn) => btn.addEventListener("click", onDeleteBtnClick));
    //
    //     if (mobileCardsWrap) {
    //       mobileCardsWrap.innerHTML = "";
    //       ordered.forEach((t) => {
    //         const card = document.createElement("div");
    //         card.className = "card";
    //         card.innerHTML = `
    //     <div class="row">
    //       <div style="flex:1;min-width:0">
    //         <div style="display:flex;justify-content:space-between;gap:8px;align-items:center">
    //           <div style="font-weight:800">${escapeHtml(t.name)}</div>
    //           <div style="font-family:monospace;font-weight:700">${escapeHtml(t.staffId)}</div>
    //         </div>
    //         <div class="badges">${(t.categories || []).map((c) => createBadgeHTML(c)).join("")}</div>
    //         <div class="small-muted" style="margin-top:8px">Assigned: ${t.assignedRequests ?? 0} • ${escapeHtml(t.status || "")}</div>
    //       </div>
    //     </div>
    //     <div style="display:flex;gap:8px;margin-top:8px">
    //       <button class="btn btn-primary mobile-edit" data-index="${t._idx}" style="flex:1">Edit</button>
    //       <button class="btn btn-danger mobile-delete" data-index="${t._idx}" style="flex:1">Delete</button>
    //     </div>
    //   `;
    //         mobileCardsWrap.appendChild(card);
    //       });
    //
    //       mobileCardsWrap.querySelectorAll(".mobile-edit").forEach((b) => {
    //         b.removeEventListener("click", onMobileEditClick);
    //         b.addEventListener("click", onMobileEditClick);
    //       });
    //       mobileCardsWrap.querySelectorAll(".mobile-delete").forEach((b) => {
    //         b.removeEventListener("click", onMobileDeleteClick);
    //         b.addEventListener("click", onMobileDeleteClick);
    //       });
    //     }
    //   }
    //
    //   function onEditBtnClick(e) {
    //     const idx = +e.currentTarget.dataset.index;
    //     openEditModal(idx);
    //   }
    //   function onDeleteBtnClick(e) {
    //     const idx = +e.currentTarget.dataset.index;
    //     deleteTechnician(idx);
    //   }
    //   function onMobileEditClick(e) {
    //     const idx = +e.currentTarget.dataset.index;
    //     openEditModal(idx);
    //     window.scrollTo({ top: 0, behavior: "smooth" });
    //   }
    //   function onMobileDeleteClick(e) {
    //     const idx = +e.currentTarget.dataset.index;
    //     deleteTechnician(idx);
    //   }
    //
    //   function deleteTechnician(realIndex) {
    //     if (!Number.isFinite(realIndex)) return;
    //     const t = technicians[realIndex];
    //     if (!t) return;
    //     const ok = confirm(
    //       `Delete technician ${t.name} (ID: ${t.staffId})? This cannot be undone.`,
    //     );
    //     if (!ok) return;
    //     technicians.splice(realIndex, 1);
    //     saveTechnicians(technicians);
    //     editModal.classList.remove("active");
    //     editIndex = null;
    //     renderTechnicians();
    //   }
    //
    //   if (form) {
    //     form.addEventListener("submit", (e) => {
    //       e.preventDefault();
    //       const staffId = (form.staffId.value || "").trim();
    //       const name = (form.technicianName.value || "").trim();
    //       const status = form.availabilityStatus.value;
    //
    //       if (!staffId || !name || !status || selectedCategories.length === 0) {
    //         alert("Please fill all fields");
    //         return;
    //       }
    //
    //       if (!/^\d{8}$/.test(staffId)) {
    //         alert("Staff ID must be exactly 8 digits");
    //         return;
    //       }
    //
    //       if (
    //         technicians.some(
    //           (t) => (t.staffId || "").toLowerCase() === staffId.toLowerCase(),
    //         )
    //       ) {
    //         alert("Staff ID exists");
    //         return;
    //       }
    //
    //       technicians.push({
    //         staffId,
    //         name,
    //         categories: [...selectedCategories],
    //         status,
    //         assignedRequests: 0,
    //       });
    //
    //       saveTechnicians(technicians);
    //
    //       form.reset();
    //       selectedCategories = [];
    //       if (catBtn) catBtn.textContent = "Select Categories ▼";
    //
    //       renderTechnicians();
    //       window.scrollTo({ top: 0, behavior: "smooth" });
    //     });
    //   }
    //
    //   function openEditModal(i) {
    //     const t = technicians[i];
    //     if (!t) return;
    //     editStaffId.value = t.staffId;
    //     editTechnicianName.value = t.name || "";
    //
    //     editCategoryOptions
    //       .querySelectorAll('input[type="checkbox"]')
    //       .forEach((chk) => {
    //         chk.checked =
    //           Array.isArray(t.categories) && t.categories.includes(chk.value);
    //       });
    //
    //     editAvailabilityStatus.value = t.status || "Active";
    //     editModal.classList.add("active");
    //     editIndex = i;
    //     setTimeout(() => editTechnicianName.focus(), 120);
    //   }
    //   if (cancelEditBtn) {
    //     cancelEditBtn.addEventListener("click", () => {
    //       editModal.classList.remove("active");
    //       editIndex = null;
    //     });
    //   }
    //   if (editForm) {
    //     editForm.addEventListener("submit", (e) => {
    //       e.preventDefault();
    //       if (editIndex === null) return;
    //
    //       technicians[editIndex].name = (editTechnicianName.value || "").trim();
    //       technicians[editIndex].categories = Array.from(
    //         editCategoryOptions.querySelectorAll("input:checked"),
    //       ).map((c) => c.value);
    //       technicians[editIndex].status = editAvailabilityStatus.value;
    //
    //       saveTechnicians(technicians);
    //       editModal.classList.remove("active");
    //       editIndex = null;
    //       renderTechnicians();
    //     });
    //   }
    //
    //   if (statusFilter)
    //     statusFilter.addEventListener("change", () => renderTechnicians());
    //   let _searchDebounce = null;
    //   if (searchInput) {
    //     searchInput.addEventListener("input", () => {
    //       if (_searchDebounce) clearTimeout(_searchDebounce);
    //       _searchDebounce = setTimeout(renderTechnicians, 180);
    //     });
    //   }
    //
    //   renderTechnicians();
    //
    //   /* keyboard + modal close helpers */
    //   document.addEventListener("keydown", (e) => {
    //     if (e.key === "Escape" && editModal.classList.contains("active")) {
    //       editModal.classList.remove("active");
    //       editIndex = null;
    //     }
    //   });
    //   editModal.addEventListener("click", (e) => {
    //     if (e.target === editModal) {
    //       editModal.classList.remove("active");
    //       editIndex = null;
    //     }
    //   });
    // </script>
    //
