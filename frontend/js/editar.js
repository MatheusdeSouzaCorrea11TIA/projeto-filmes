// ---- Configuração da API ----------------------------------------------
// Ajuste a BASE_URL e as rotas abaixo para bater com o seu backend.
const BASE_URL = "https://projeto-filmes-backend-16i9n5m3i.vercel.app";
const ROUTES = {
  listar: () => `${BASE_URL}/listar-filmes`,
  atualizar: (id) => `${BASE_URL}/atualizar-filme/${id}`,
};

let filmes = [];
let selectedId = null;

const listEl = document.getElementById("movie-list");
const countEl = document.getElementById("movie-count");

const form = document.getElementById("edit-form");
const titleInput = document.getElementById("titulo");
const genreInput = document.getElementById("genero");
const durationInput = document.getElementById("duracao");
const ageInput = document.getElementById("faixa-etaria");
const inputs = [titleInput, genreInput, durationInput, ageInput];

const submitBtn = document.getElementById("submit-btn");
const cancelBtn = document.getElementById("cancel-btn");
const formSub = document.getElementById("form-sub");
const formStatus = document.getElementById("form-status");

function setStatus(msg, type) {
  formStatus.textContent = msg || "";
  formStatus.className = type || "";
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
    listEl.innerHTML = `<div class="empty-state">Nenhum filme encontrado no catálogo.</div>`;
    return;
  }

  listEl.innerHTML = filmes.map(f => `
      <div class="ticket ${String(f.id) === String(selectedId) ? "active" : ""}" data-id="${f.id}">
        <div class="info">
          <h3>${escapeHtml(f.title)}</h3>
          <div class="meta">
            <span>${escapeHtml(f.genre || "—")}</span>
            <span>${f.duration ? f.duration + " min" : "—"}</span>
            <span>${escapeHtml(f.ageRating || "—")}</span>
          </div>
        </div>
        <span class="pick">editar →</span>
      </div>
    `).join("");
}

function selectMovie(id) {
  const filme = filmes.find(f => String(f.id) === String(id));
  if (!filme) return;
  selectedId = id;

  titleInput.value = filme.title || "";
  genreInput.value = filme.genre || "";
  durationInput.value = filme.duration || "";
  ageInput.value = filme.ageRating || "";

  inputs.forEach(i => i.disabled = false);
  submitBtn.disabled = false;
  cancelBtn.style.display = "block";
  formSub.textContent = `Editando "${filme.title}"`;
  setStatus("");
  renderList();
}

function clearSelection() {
  selectedId = null;
  form.reset();
  inputs.forEach(i => i.disabled = true);
  submitBtn.disabled = true;
  cancelBtn.style.display = "none";
  formSub.textContent = "Escolha um filme na lista para editar";
  setStatus("");
  renderList();
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

// ---- Rota: atualizar (PUT) ---------------------------------------------
async function atualizarFilme(id, dataSend) {
  const res = await fetch(ROUTES.atualizar(id), {
    method: "PUT",
    headers: { "Content-Type": "application/json", "Accept": "application/json" },
    body: JSON.stringify(dataSend)
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.message || "Não foi possível atualizar o filme");
  return body;
}

listEl.addEventListener("click", (event) => {
  const ticket = event.target.closest(".ticket");
  if (ticket) selectMovie(ticket.dataset.id);
});

cancelBtn.addEventListener("click", clearSelection);

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  if (!selectedId) return;

  const dataSend = {
    title: titleInput.value.trim(),
    genre: genreInput.value.trim(),
    duration: Number(durationInput.value),
    ageRating: ageInput.value.trim()
  };

  submitBtn.disabled = true;
  setStatus("Salvando alterações…");

  try {
    await atualizarFilme(selectedId, dataSend);
    const idx = filmes.findIndex(f => String(f.id) === String(selectedId));
    if (idx >= 0) filmes[idx] = { ...filmes[idx], ...dataSend };
    setStatus("Filme atualizado com sucesso.", "ok");
    renderList();
  } catch (err) {
    setStatus(err.message, "err");
  } finally {
    submitBtn.disabled = false;
  }
});

carregarFilmes();