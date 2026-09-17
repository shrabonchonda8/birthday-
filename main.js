// ==========================================
// DAILY DIU REPORT
// No Node.js required
// Data saved in browser localStorage
// ==========================================

const STORAGE_KEY = "daily_diu_reports";

let reports = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];

const reportForm = document.getElementById("reportForm");
const dateInput = document.getElementById("date");
const diuInput = document.getElementById("diu");
const incomeInput = document.getElementById("income");
const expenseInput = document.getElementById("expense");
const expenseReasonInput = document.getElementById("expenseReason");
const noteInput = document.getElementById("note");
const editIdInput = document.getElementById("editId");

const reportsContainer = document.getElementById("reportsContainer");
const emptyState = document.getElementById("emptyState");
const searchInput = document.getElementById("searchInput");

const totalDays = document.getElementById("totalDays");
const totalDiu = document.getElementById("totalDiu");
const totalIncome = document.getElementById("totalIncome");
const totalExpense = document.getElementById("totalExpense");
const netBalance = document.getElementById("netBalance");

const saveBtn = document.getElementById("saveBtn");
const cancelBtn = document.getElementById("cancelBtn");
const formMode = document.getElementById("formMode");
const reportCount = document.getElementById("reportCount");
const clearAllBtn = document.getElementById("clearAllBtn");


// ==========================================
// Today date
// ==========================================

function setToday() {
  const today = new Date();

  const yyyy = today.getFullYear();
  const mm = String(today.getMonth() + 1).padStart(2, "0");
  const dd = String(today.getDate()).padStart(2, "0");

  dateInput.value = `${yyyy}-${mm}-${dd}`;
}

setToday();


// ==========================================
// Save data
// ==========================================

function saveData() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
}


// ==========================================
// Currency
// ==========================================

function money(value) {
  return "৳" + Number(value || 0).toLocaleString("en-US");
}


// ==========================================
// Date format
// ==========================================

function formatDate(dateString) {

  if (!dateString) return "";

  const date = new Date(dateString + "T00:00:00");

  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
}


// ==========================================
// Add / Edit report
// ==========================================

reportForm.addEventListener("submit", function(e) {

  e.preventDefault();

  const date = dateInput.value;
  const diu = Number(diuInput.value) || 0;
  const income = Number(incomeInput.value) || 0;
  const expense = Number(expenseInput.value) || 0;
  const expenseReason = expenseReasonInput.value.trim();
  const note = noteInput.value.trim();

  if (!date) {
    alert("তারিখ নির্বাচন করুন।");
    return;
  }

  if (diu < 0 || income < 0 || expense < 0) {
    alert("Negative value দেওয়া যাবে না।");
    return;
  }

  const editId = editIdInput.value;

  if (editId) {

    const index = reports.findIndex(r => r.id === editId);

    if (index !== -1) {
      reports[index] = {
        ...reports[index],
        date,
        diu,
        income,
        expense,
        expenseReason,
        note
      };
    }

    formMode.textContent = "New Report";
    saveBtn.innerHTML = "💾 রিপোর্ট Save করুন";
    cancelBtn.classList.add("hidden");

  } else {

    const newReport = {
      id: Date.now().toString(),
      date,
      diu,
      income,
      expense,
      expenseReason,
      note,
      createdAt: Date.now()
    };

    reports.push(newReport);
  }

  saveData();

  resetForm();
  renderReports();

});


// ==========================================
// Reset form
// ==========================================

function resetForm() {

  reportForm.reset();

  editIdInput.value = "";

  setToday();

  formMode.textContent = "New Report";

  saveBtn.innerHTML = "💾 রিপোর্ট Save করুন";

  cancelBtn.classList.add("hidden");
}


// ==========================================
// Edit
// ==========================================

function editReport(id) {

  const report = reports.find(r => r.id === id);

  if (!report) return;

  dateInput.value = report.date;
  diuInput.value = report.diu;
  incomeInput.value = report.income;
  expenseInput.value = report.expense;
  expenseReasonInput.value = report.expenseReason || "";
  noteInput.value = report.note || "";

  editIdInput.value = report.id;

  formMode.textContent = "Edit Report";

  saveBtn.innerHTML = "✏️ পরিবর্তন Save করুন";

  cancelBtn.classList.remove("hidden");

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });
}


// ==========================================
// Cancel edit
// ==========================================

cancelBtn.addEventListener("click", function() {
  resetForm();
});


// ==========================================
// Delete
// ==========================================

function deleteReport(id) {

  const report = reports.find(r => r.id === id);

  if (!report) return;

  const confirmDelete = confirm(
    `${formatDate(report.date)}-এর রিপোর্টটি Delete করতে চান?`
  );

  if (!confirmDelete) return;

  reports = reports.filter(r => r.id !== id);

  saveData();

  renderReports();
}


// ==========================================
// Render reports
// ==========================================

function renderReports() {

  const search = searchInput.value.toLowerCase().trim();

  let filtered = reports.filter(report => {

    const text = `
      ${report.date}
      ${formatDate(report.date)}
      ${report.expenseReason || ""}
      ${report.note || ""}
    `.toLowerCase();

    return text.includes(search);
  });

  // Newest date first
  filtered.sort((a, b) => {
    return new Date(b.date) - new Date(a.date);
  });

  reportsContainer.innerHTML = "";

  if (filtered.length === 0) {

    emptyState.style.display = "block";

    if (reports.length > 0) {
      emptyState.querySelector("h3").textContent =
        "কোনো রিপোর্ট পাওয়া যায়নি";

      emptyState.querySelector("p").textContent =
        "অন্য কোনো শব্দ দিয়ে Search করুন।";
    } else {
      emptyState.querySelector("h3").textContent =
        "এখনও কোনো রিপোর্ট নেই";

      emptyState.querySelector("p").textContent =
        "উপরের ফর্ম থেকে আপনার প্রথম Daily Report যোগ করুন।";
    }

  } else {

    emptyState.style.display = "none";

    filtered.forEach(report => {

      const net = Number(report.income) - Number(report.expense);

      const div = document.createElement("div");

      div.className = "report";

      div.innerHTML = `
        <div class="report-top">

          <div class="report-date">
            📅 ${formatDate(report.date)}
            <small>Daily Report</small>
          </div>

          <div>
            <strong>${report.diu} DIU</strong>
          </div>

        </div>

        <div class="report-values">

          <div class="value-box">
            <span>📊 DIU</span>
            <strong class="diu-value">
              ${Number(report.diu).toLocaleString("en-US")}
            </strong>
          </div>

          <div class="value-box">
            <span>💰 আয়</span>
            <strong class="income-value">
              ${money(report.income)}
            </strong>
          </div>

          <div class="value-box">
            <span>💸 খরচ</span>
            <strong class="expense-value">
              ${money(report.expense)}
            </strong>
          </div>

          <div class="value-box">
            <span>💵 Net</span>
            <strong class="net-value">
              ${money(net)}
            </strong>
          </div>

        </div>

        ${
          report.expenseReason
          ? `<div class="reason">
              💸 <b>খরচের কারণ:</b> ${escapeHTML(report.expenseReason)}
             </div>`
          : ""
        }

        ${
          report.note
          ? `<div class="note">
              📌 <b>নোট:</b> ${escapeHTML(report.note)}
             </div>`
          : ""
        }

        <div class="actions">

          <button class="edit-btn"
            onclick="editReport('${report.id}')">
            ✏️ Edit
          </button>

          <button class="delete-btn"
            onclick="deleteReport('${report.id}')">
            🗑️ Delete
          </button>

        </div>
      `;

      reportsContainer.appendChild(div);
    });
  }

  reportCount.textContent =
    `${filtered.length} Report`;

  updateTotals();
}


// ==========================================
// Automatic Total Calculation
// ==========================================

function updateTotals() {

  const days = reports.length;

  const diu = reports.reduce(
    (sum, report) => sum + Number(report.diu || 0),
    0
  );

  const income = reports.reduce(
    (sum, report) => sum + Number(report.income || 0),
    0
  );

  const expense = reports.reduce(
    (sum, report) => sum + Number(report.expense || 0),
    0
  );

  const balance = income - expense;

  totalDays.textContent =
    days.toLocaleString("en-US");

  totalDiu.textContent =
    diu.toLocaleString("en-US");

  totalIncome.textContent =
    money(income);

  totalExpense.textContent =
    money(expense);

  netBalance.textContent =
    money(balance);
}


// ==========================================
// Search
// ==========================================

searchInput.addEventListener("input", function() {
  renderReports();
});


// ==========================================
// Clear all
// ==========================================

clearAllBtn.addEventListener("click", function() {

  if (reports.length === 0) {
    alert("মুছে ফেলার মতো কোনো রিপোর্ট নেই।");
    return;
  }

  const confirmClear = confirm(
    "সব Daily Report মুছে ফেলতে চান?\nএই কাজটি Undo করা যাবে না।"
  );

  if (!confirmClear) return;

  reports = [];

  saveData();

  resetForm();

  renderReports();
});


// ==========================================
// Security helper
// ==========================================

function escapeHTML(text) {

  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}


// ==========================================
// Initial render
// ==========================================

renderReports();
