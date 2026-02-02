const API_URL = "/api/final_count"; 

const tableBody = document.querySelector("#studentTable tbody");
const refreshBtn = document.querySelector("#refreshBtn");
const statusEl = document.querySelector("#status");
const messageEl = document.querySelector("#message");

function setStatus(text) {
  statusEl.textContent = text;
}

function showMessage(text) {
  messageEl.textContent = text;
  messageEl.classList.remove("hidden");
}

function hideMessage() {
  messageEl.textContent = "";
  messageEl.classList.add("hidden");
}

function renderRows(rows) {
  if (!rows || rows.length === 0) {
    tableBody.innerHTML = `<tr><td colspan="2">No data returned.</td></tr>`;
    return;
  }

  tableBody.innerHTML = rows
    .map(r => {
      const country = r.Country ?? r.country ?? "Unknown";
      const count = r.StudentCount ?? r.studentCount ?? r.count ?? 0;
      return `<tr><td>${escapeHtml(country)}</td><td class="num">${count}</td></tr>`;
    })
    .join("");
}

function renderLoading() {
  tableBody.innerHTML = `
    <tr><td class="skeleton">Loading...</td><td class="num skeleton">...</td></tr>
    <tr><td class="skeleton">Loading...</td><td class="num skeleton">...</td></tr>
    <tr><td class="skeleton">Loading...</td><td class="num skeleton">...</td></tr>
  `;
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function loadData() {
  hideMessage();
  setStatus("Loading...");
  renderLoading();

  try {
    const res = await fetch(API_URL, { method: "GET" });

    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`API error ${res.status} ${res.statusText}\n${text}`);
    }

    const data = await res.json();
    renderRows(data);
    setStatus(`Loaded ${Array.isArray(data) ? data.length : 0} rows`);
  } catch (err) {
    setStatus("Failed");
    renderRows([]);
    showMessage(
      "Error loading data.\n\nWhat to check:\n" +
      "1) The API route should be /api/final_count\n" +
      "2) Azure Function must be deployed (not 404)\n" +
      "3) SQL firewall must allow Azure services + your client IP\n\n" +
      `Details:\n${err.message}`
    );
  }
}

refreshBtn.addEventListener("click", loadData);
loadData();
