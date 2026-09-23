// ---- Configuração da API ----------------------------------------------
// Ajuste a BASE_URL e as rotas abaixo para bater com o seu backend.
const BASE_URL = "https://projeto-filmes-backend-16i9n5m3i.vercel.app";
const ROUTES = {
  listar: () => `${BASE_URL}/`,
  deletar: (id) => `${BASE_URL}/deletar-filme/${id}`,
};

let filmes = [];
let confirmingId = null;

const listEl = document.getElementById("movie-list");
const countEl = document.getElementById("movie-count");
const statusEl = document.getElementById("global-status");

function setStatus(msg, type) {
  statusEl.textContent = msg || "";
  statusEl.className = type || "";
}

function escapeHtml(str) {
  return String(str ?? "").replace(/[&<>"']/g, c => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function renderList() {
  countEl.textContent = filmes.length
    ? `${filmes.length} ${filmes.length === 1 ? "filme" : "filmes"}`
    : "";

  if (!filmes.length) {
    listEl.innerHTML = `<div class="empty-state">Nenhum filme cadastrado.</div>`;
    return;
  }

  listEl.innerHTML = filmes.map(f => {
    const confirming = String(f.id) === String(confirmingId);
    return `
      <div class="ticket" data-id="${f.id}">
        <div class="info">
          <h3>${escapeHtml(f.title)}</h3>
          <div class="meta">
            <span>${escapeHtml(f.genre || "—")}</span>
            <span>${f.duration ? f.duration + " min" : "—"}</span>
            <span>${escapeHtml(f.ageRating || "—")}</span>
          </div>
        </div>
        <button class="btn-delete" data-id="${f.id}" style="${confirming ? "display:none;" : ""}">Excluir</button>
        <div class="confirm-row ${confirming ? "show" : ""}">
          <span>Confirmar exclusão?</span>
          <button class="btn-confirm" data-id="${f.id}">Sim, excluir</button>
          <button class="btn-cancel-inline" data-cancel="${f.id}">Cancelar</button>
        </div>
      </div>
    `;
  }).join("");
}

async function carregarFilmes() {
  listEl.innerHTML = `<div class="loading-state">Carregando catálogo…</div>`;
  try {
    const res = await fetch(ROUTES.listar());
    if (!res.ok) throw new Error("Falha ao carregar");
    const data = await res.json();
    filmes = Array.isArray(data) ? data : (data.filmes || []);
  } catch (err) {
    filmes = [];
  }
  renderList();
}

// ---- Rota: excluir (DELETE) --------------------------------------------
async function deletarFilme(id) {
  const res = await fetch(ROUTES.deletar(id), {
    method: "DELETE",
    headers: { "Accept": "application/json" }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Não foi possível excluir o filme");
  return body;
}

listEl.addEventListener("click", async (event) => {
  const askBtn = event.target.closest(".btn-delete");
  const confirmBtn = event.target.closest(".btn-confirm");
  const cancelBtn = event.target.closest(".btn-cancel-inline");

  if (askBtn) {
    confirmingId = askBtn.dataset.id;
    renderList();
    return;
  }

  if (cancelBtn) {
    confirmingId = null;
    renderList();
    return;
  }

  if (confirmBtn) {
    const id = confirmBtn.dataset.id;
    const filme = filmes.find(f => String(f.id) === String(id));
    const ticketEl = confirmBtn.closest(".ticket");
    ticketEl.classList.add("removing");
    confirmBtn.disabled = true;

    try {
      await deletarFilme(id);
      filmes = filmes.filter(f => String(f.id) !== String(id));
      confirmingId = null;
      setStatus(`"${filme ? filme.title : "Filme"}" foi excluído do catálogo.`, "ok");
      renderList();
    } catch (err) {
      setStatus(err.message, "err");
      ticketEl.classList.remove("removing");
      confirmBtn.disabled = false;
    }
  }
});

carregarFilmes();