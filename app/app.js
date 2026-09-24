(function () {
  "use strict";

  var STORAGE_KEY = "qomit-veille-concurrentielle-v1";
  var THREAT_ORDER = { Haute: 0, Moyenne: 1, Basse: 2 };

  // Phrases utilisées pour simuler le résultat d'une recherche IA.
  // NB : ceci est une simulation locale — voir la note en tête du fichier README
  // du dossier app/. Aucun appel réseau réel n'est fait dans cette version.
  var SEARCH_TEMPLATES = [
    "Signal détecté : {nom} aurait renforcé son argumentaire sur la gouvernance checkout ces dernières semaines (à confirmer).",
    "Mention repérée : {nom} cité dans une comparaison récente sur le sujet checkout multi-marques (source à vérifier).",
    "Changement potentiel de pricing chez {nom} signalé par une source tierce (non confirmé).",
    "{nom} aurait annoncé une nouvelle intégration ou un nouveau partenariat (détail à vérifier)."
  ];

  var state = {
    competitors: [],
    view: "dashboard", // "dashboard" | "detail"
    currentId: null,
    showArchived: false,
    dashboardError: false,
    firstLoad: true,
    dashboardTab: "liste" // "liste" | "matrice"
  };

  var MATRIX_AXES = [
    { field: "axe_gouvernance", label: "Gouvernance multi-marques" },
    { field: "axe_sophistication", label: "Sophistication IA" }
  ];

  // ---------- Données ----------

  function today() {
    return new Date().toISOString().slice(0, 10);
  }

  function loadData() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        state.competitors = SEED_COMPETITORS.map(cloneCompetitor);
        saveData();
      } else {
        state.competitors = JSON.parse(raw);
      }
    } catch (e) {
      state.dashboardError = true;
      state.competitors = [];
    }
  }

  function cloneCompetitor(c) {
    return JSON.parse(JSON.stringify(c));
  }

  function saveData() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.competitors));
  }

  function findCompetitor(id) {
    for (var i = 0; i < state.competitors.length; i++) {
      if (state.competitors[i].id === id) return state.competitors[i];
    }
    return null;
  }

  function touch(c) {
    c.date_derniere_maj = today();
  }

  // ---------- Utilitaires d'affichage ----------

  function escapeHtml(str) {
    return String(str == null ? "" : str).replace(/[&<>"']/g, function (m) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[m];
    });
  }

  function formatDate(iso) {
    if (!iso) return "";
    var d = new Date(iso + "T00:00:00");
    if (isNaN(d.getTime())) return iso;
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });
  }

  function badgeClass(niveau) {
    if (niveau === "Haute") return "badge-haute";
    if (niveau === "Moyenne") return "badge-moyenne";
    return "badge-basse";
  }

  function uid() {
    if (window.crypto && crypto.randomUUID) return crypto.randomUUID();
    return "id-" + Date.now() + "-" + Math.random().toString(16).slice(2);
  }

  // ---------- Rendu : Dashboard ----------

  function renderDashboardActionsVisibility() {
    var actions = document.getElementById("dashboard-actions");
    actions.style.display = state.view === "dashboard" ? "flex" : "none";
    var addBtn = document.getElementById("btn-add");
    addBtn.style.display = state.showArchived ? "none" : "inline-flex";
    var toggleBtn = document.getElementById("btn-toggle-archived");
    toggleBtn.classList.toggle("is-active", state.showArchived);

    // La matrice ne concerne que les concurrents actifs : on masque cet onglet
    // en vue "Archivés" et on retombe sur la liste si besoin.
    var tabMatrice = document.getElementById("tab-matrice");
    tabMatrice.style.display = state.showArchived ? "none" : "inline-flex";
    if (state.showArchived && state.dashboardTab === "matrice") {
      state.dashboardTab = "liste";
    }
    document.getElementById("tab-liste").classList.toggle("is-active", state.dashboardTab === "liste");
    document.getElementById("tab-liste").setAttribute("aria-selected", state.dashboardTab === "liste");
    tabMatrice.classList.toggle("is-active", state.dashboardTab === "matrice");
    tabMatrice.setAttribute("aria-selected", state.dashboardTab === "matrice");
  }

  function renderDashboard() {
    var list = document.getElementById("dashboard-list");
    var matrix = document.getElementById("dashboard-matrix");
    var showMatrix = state.dashboardTab === "matrice" && !state.showArchived;
    list.hidden = showMatrix;
    matrix.hidden = !showMatrix;

    if (showMatrix) {
      renderMatrix(matrix);
      return;
    }

    if (state.dashboardError) {
      list.innerHTML = '<div class="empty-state"><p>Impossible de charger les concurrents.</p></div>';
      return;
    }

    if (state.firstLoad) {
      list.innerHTML =
        '<div class="skeleton-row"></div><div class="skeleton-row"></div><div class="skeleton-row"></div>';
      window.setTimeout(function () {
        state.firstLoad = false;
        renderDashboard();
      }, 260);
      return;
    }

    var wantedStatus = state.showArchived ? "archive" : "actif";
    var items = state.competitors.filter(function (c) {
      return c.statut_fiche === wantedStatus;
    });

    items.sort(function (a, b) {
      var t = THREAT_ORDER[a.niveau_menace] - THREAT_ORDER[b.niveau_menace];
      if (t !== 0) return t;
      return a.nom.localeCompare(b.nom, "fr");
    });

    if (items.length === 0) {
      if (state.showArchived) {
        list.innerHTML = '<div class="empty-state"><p>Aucun concurrent archivé.</p></div>';
      } else {
        list.innerHTML =
          '<div class="empty-state"><p>Aucun concurrent pour l’instant.</p>' +
          '<button class="btn btn-primary" data-action="open-add" type="button">Ajouter</button></div>';
      }
      return;
    }

    list.innerHTML = items.map(rowHtml).join("");
  }

  function rowHtml(c) {
    var summary = c.positionnement ? escapeHtml(c.positionnement) : "Non renseigné.";
    return (
      '<div class="row" data-id="' + c.id + '" role="button" tabindex="0">' +
      '<span class="badge ' + badgeClass(c.niveau_menace) + '">' + c.niveau_menace + "</span>" +
      '<div class="row-main">' +
      '<div class="row-name">' + escapeHtml(c.nom) + "</div>" +
      '<div class="row-summary">' + summary + "</div>" +
      "</div>" +
      '<div class="row-date">' + formatDate(c.date_derniere_maj) + "</div>" +
      "</div>"
    );
  }

  // ---------- Rendu : Matrice de positionnement ----------

  // Zone de tracé en coordonnées SVG (viewBox 0 0 340 340), marges réservées
  // aux labels d'axes.
  var MATRIX_PLOT = { x0: 46, y0: 16, x1: 316, y1: 286 };

  function axisToCoord(value) {
    var v = value == null ? 5 : value;
    if (v < 0) v = 0;
    if (v > 10) v = 10;
    return v / 10;
  }

  function matrixPointClass(c) {
    if (c.axe_gouvernance == null || c.axe_sophistication == null) return "matrix-point matrix-point-unset";
    return "matrix-point " + badgeClass(c.niveau_menace).replace("badge-", "matrix-point-");
  }

  function renderMatrix(container) {
    var items = state.competitors.filter(function (c) {
      return c.statut_fiche === "actif";
    });

    if (items.length === 0) {
      container.innerHTML = '<div class="empty-state"><p>Aucun concurrent pour l’instant.</p>' +
        '<button class="btn btn-primary" data-action="open-add" type="button">Ajouter</button></div>';
      return;
    }

    var midX = MATRIX_PLOT.x0 + (MATRIX_PLOT.x1 - MATRIX_PLOT.x0) / 2;
    var midY = MATRIX_PLOT.y0 + (MATRIX_PLOT.y1 - MATRIX_PLOT.y0) / 2;

    var points = items
      .map(function (c) {
        var px = MATRIX_PLOT.x0 + axisToCoord(c.axe_gouvernance) * (MATRIX_PLOT.x1 - MATRIX_PLOT.x0);
        var py = MATRIX_PLOT.y1 - axisToCoord(c.axe_sophistication) * (MATRIX_PLOT.y1 - MATRIX_PLOT.y0);
        return (
          '<g class="matrix-item" data-id="' + c.id + '" role="button" tabindex="0" aria-label="' + escapeHtml(c.nom) + '">' +
          '<circle class="' + matrixPointClass(c) + '" cx="' + px + '" cy="' + py + '" r="7"></circle>' +
          '<text class="matrix-label" x="' + px + '" y="' + (py - 11) + '" text-anchor="middle">' + escapeHtml(c.nom) + "</text>" +
          "</g>"
        );
      })
      .join("");

    container.innerHTML =
      '<svg class="matrix-svg" viewBox="0 0 340 320" role="img" aria-label="Matrice de positionnement des concurrents">' +
      '<line class="matrix-axis" x1="' + MATRIX_PLOT.x0 + '" y1="' + MATRIX_PLOT.y1 + '" x2="' + MATRIX_PLOT.x1 + '" y2="' + MATRIX_PLOT.y1 + '"></line>' +
      '<line class="matrix-axis" x1="' + MATRIX_PLOT.x0 + '" y1="' + MATRIX_PLOT.y0 + '" x2="' + MATRIX_PLOT.x0 + '" y2="' + MATRIX_PLOT.y1 + '"></line>' +
      '<line class="matrix-gridline" x1="' + midX + '" y1="' + MATRIX_PLOT.y0 + '" x2="' + midX + '" y2="' + MATRIX_PLOT.y1 + '"></line>' +
      '<line class="matrix-gridline" x1="' + MATRIX_PLOT.x0 + '" y1="' + midY + '" x2="' + MATRIX_PLOT.x1 + '" y2="' + midY + '"></line>' +
      '<text class="matrix-axis-label" x="' + midX + '" y="308" text-anchor="middle">Gouvernance multi-marques →</text>' +
      '<text class="matrix-axis-label" x="0" y="0" text-anchor="middle" transform="translate(14 ' + midY + ') rotate(-90)">Sophistication IA →</text>' +
      points +
      "</svg>";
  }

  // ---------- Rendu : Fiche détail ----------

  function renderListField(items, field) {
    var lis = items
      .map(function (item, idx) {
        return (
          '<li data-index="' + idx + '">' +
          '<span class="list-item-text" contenteditable="true" data-field="' + field + '" data-index="' + idx + '">' +
          escapeHtml(item) +
          "</span>" +
          '<button class="btn-remove" data-action="remove-list-item" data-field="' + field + '" data-index="' + idx + '" type="button" aria-label="Supprimer">×</button>' +
          "</li>"
        );
      })
      .join("");
    if (items.length === 0) {
      lis = '<li class="field-empty-note">Non renseigné.</li>';
    }
    return (
      '<ul class="field-list" data-field="' + field + '">' + lis + "</ul>" +
      '<button class="btn-add-inline" data-action="add-list-item" data-field="' + field + '" type="button">+ Ajouter</button>'
    );
  }

  function renderSources(sources) {
    if (sources.length === 0) {
      return '<p class="field-editable" data-placeholder="Non renseigné."></p>';
    }
    return sources
      .map(function (s, idx) {
        var badge =
          s.statut === "verifie"
            ? '<span class="badge badge-verifie">Vérifié</span>'
            : '<span class="badge badge-nonverifie">Non vérifié</span>';
        var flagBtn =
          s.statut === "verifie"
            ? '<button class="btn-flag" data-action="flag-source" data-index="' + idx + '" type="button">À vérifier</button>'
            : "";
        return (
          '<div class="source-item" data-index="' + idx + '">' +
          '<div class="source-info" contenteditable="true" data-subfield="info" data-index="' + idx + '" data-placeholder="Information">' +
          escapeHtml(s.info) +
          "</div>" +
          '<div class="source-meta">' +
          '<span class="source-link" contenteditable="true" data-subfield="lien_ou_texte" data-index="' + idx + '" data-placeholder="Source">' +
          escapeHtml(s.lien_ou_texte) +
          "</span>" +
          "<span>" + formatDate(s.date) + "</span>" +
          badge +
          flagBtn +
          '<button class="btn-remove" data-action="remove-source" data-index="' + idx + '" type="button" aria-label="Supprimer">×</button>' +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderMatrixPositionBlock(c) {
    if (c.axe_gouvernance == null || c.axe_sophistication == null) {
      return (
        '<p class="field-empty-note">Non positionné sur la matrice.</p>' +
        '<button class="btn-add-inline" data-action="init-matrix-position" type="button">+ Positionner</button>'
      );
    }
    return MATRIX_AXES.map(function (axis) {
      var value = c[axis.field];
      return (
        '<div class="matrix-slider-row">' +
        '<label class="matrix-slider-label" for="slider-' + axis.field + '">' + axis.label + '</label>' +
        '<input type="range" id="slider-' + axis.field + '" min="0" max="10" step="1" value="' + value + '" data-axis="' + axis.field + '">' +
        '<span class="matrix-slider-value">' + value + "/10</span>" +
        "</div>"
      );
    }).join("");
  }

  function renderDetail() {
    var c = findCompetitor(state.currentId);
    if (!c) {
      state.view = "dashboard";
      render();
      return;
    }

    var container = document.getElementById("detail-content");
    container.innerHTML =
      '<div class="detail-header">' +
      '<div class="detail-title-row">' +
      '<h1 class="editable-title" contenteditable="true" data-field="nom">' + escapeHtml(c.nom) + "</h1>" +
      '<select class="menace-select ' + badgeClass(c.niveau_menace) + '" data-field="niveau_menace">' +
      ["Basse", "Moyenne", "Haute"]
        .map(function (n) {
          return '<option value="' + n + '"' + (c.niveau_menace === n ? " selected" : "") + ">" + n + "</option>";
        })
        .join("") +
      "</select>" +
      "</div>" +
      '<div class="detail-meta-row">' +
      '<span class="meta-text">Mis à jour le ' + formatDate(c.date_derniere_maj) + "</span>" +
      '<button class="btn btn-ghost btn-sm" data-action="archive-toggle" type="button">' +
      (c.statut_fiche === "actif" ? "Archiver" : "Restaurer") +
      "</button>" +
      "</div>" +
      "</div>" +
      '<div class="field-block">' +
      '<div class="field-label">Positionnement</div>' +
      '<div class="field-editable" contenteditable="true" data-field="positionnement" data-placeholder="Non renseigné.">' +
      escapeHtml(c.positionnement) +
      "</div></div>" +
      '<div class="field-block">' +
      '<div class="field-label">Position sur la matrice</div>' +
      renderMatrixPositionBlock(c) +
      "</div>" +
      '<div class="field-block-row">' +
      '<div class="field-block"><div class="field-label">Forces</div>' + renderListField(c.forces, "forces") + "</div>" +
      '<div class="field-block"><div class="field-label">Faiblesses</div>' + renderListField(c.faiblesses, "faiblesses") + "</div>" +
      "</div>" +
      '<div class="field-block">' +
      '<div class="field-label">Pricing / modèle commercial</div>' +
      '<div class="field-editable" contenteditable="true" data-field="pricing" data-placeholder="Non renseigné.">' +
      escapeHtml(c.pricing) +
      "</div></div>" +
      '<div class="field-block">' +
      '<div class="section-header-row">' +
      '<div class="field-label">Sources</div>' +
      '<button class="btn btn-secondary btn-sm" id="btn-search" data-action="search-ia" type="button">' +
      '<svg class="icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">' +
      '<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6" fill="none"/>' +
      '<path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
      "</svg> Rechercher</button>" +
      "</div>" +
      '<div class="search-status" id="search-status"></div>' +
      renderSources(c.sources) +
      '<button class="btn-add-inline" data-action="add-source" type="button">+ Ajouter une source</button>' +
      "</div>";
  }

  // ---------- Rendu global ----------

  function render() {
    document.getElementById("view-dashboard").hidden = state.view !== "dashboard";
    document.getElementById("view-detail").hidden = state.view !== "detail";
    renderDashboardActionsVisibility();
    if (state.view === "dashboard") {
      renderDashboard();
    } else {
      renderDetail();
    }
  }

  // ---------- Actions ----------

  function openDetail(id) {
    state.currentId = id;
    state.view = "detail";
    render();
  }

  function backToDashboard() {
    state.view = "dashboard";
    state.currentId = null;
    render();
  }

  function updateCompetitor(id, patch) {
    var c = findCompetitor(id);
    if (!c) return;
    Object.assign(c, patch);
    touch(c);
    saveData();
  }

  function addCompetitor(name) {
    var name2 = name.trim();
    if (!name2) return;
    var c = {
      id: uid(),
      nom: name2,
      niveau_menace: "Basse",
      positionnement: "",
      forces: [],
      faiblesses: [],
      pricing: "",
      sources: [],
      axe_gouvernance: null,
      axe_sophistication: null,
      statut_fiche: "actif",
      date_derniere_maj: today()
    };
    state.competitors.push(c);
    saveData();
    closeAddModal();
    openDetail(c.id);
  }

  function archiveToggle() {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.statut_fiche = c.statut_fiche === "actif" ? "archive" : "actif";
    touch(c);
    saveData();
    backToDashboard();
  }

  function addListItem(field) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c[field].push("");
    renderDetail();
    var lastInput = document.querySelector('.list-item-text[data-field="' + field + '"][data-index="' + (c[field].length - 1) + '"]');
    if (lastInput) lastInput.focus();
  }

  function removeListItem(field, index) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c[field].splice(index, 1);
    touch(c);
    saveData();
    renderDetail();
  }

  function saveListItemText(field, index, value) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    var trimmed = value.trim();
    if (!trimmed) {
      c[field].splice(index, 1);
    } else {
      c[field][index] = trimmed;
    }
    touch(c);
    saveData();
    renderDetail();
  }

  function addSource() {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.sources.push({ info: "", lien_ou_texte: "", date: today(), statut: "verifie" });
    touch(c);
    saveData();
    renderDetail();
    var lastInfo = document.querySelector('.source-info[data-index="' + (c.sources.length - 1) + '"]');
    if (lastInfo) lastInfo.focus();
  }

  function removeSource(index) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.sources.splice(index, 1);
    touch(c);
    saveData();
    renderDetail();
  }

  function flagSource(index) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.sources[index].statut = "non_verifie";
    touch(c);
    saveData();
    renderDetail();
  }

  function saveSourceField(index, subfield, value) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.sources[index][subfield] = value.trim();
    c.sources[index].statut = "verifie";
    touch(c);
    saveData();
    renderDetail();
  }

  function initMatrixPosition() {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c.axe_gouvernance = 5;
    c.axe_sophistication = 5;
    touch(c);
    saveData();
    renderDetail();
  }

  function setAxisValue(axis, value) {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    c[axis] = value;
    touch(c);
    saveData();
  }

  function searchIA() {
    var c = findCompetitor(state.currentId);
    if (!c) return;
    var btn = document.getElementById("btn-search");
    var status = document.getElementById("search-status");
    if (!btn) return;
    btn.disabled = true;
    btn.innerHTML = "Recherche…";
    status.textContent = "";

    window.setTimeout(function () {
      var failed = Math.random() < 0.15;
      if (failed) {
        status.textContent = "La recherche a échoué.";
        btn.disabled = false;
        btn.innerHTML =
          '<svg class="icon" viewBox="0 0 16 16" width="13" height="13" aria-hidden="true">' +
          '<circle cx="7" cy="7" r="5" stroke="currentColor" stroke-width="1.6" fill="none"/>' +
          '<path d="M11 11l3.5 3.5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/>' +
          "</svg> Rechercher";
        return;
      }
      var template = SEARCH_TEMPLATES[Math.floor(Math.random() * SEARCH_TEMPLATES.length)];
      var info = template.replace("{nom}", c.nom);
      c.sources.push({
        info: info,
        lien_ou_texte: "Résultat de recherche IA (exemple)",
        date: today(),
        statut: "non_verifie"
      });
      touch(c);
      saveData();
      renderDetail();
    }, 900);
  }

  // ---------- Modale "Ajouter" ----------

  function openAddModal() {
    var modal = document.getElementById("modal-add");
    modal.hidden = false;
    var input = document.getElementById("input-new-name");
    input.value = "";
    input.focus();
  }

  function closeAddModal() {
    document.getElementById("modal-add").hidden = true;
  }

  // ---------- Écouteurs d'événements (délégation) ----------

  function init() {
    loadData();
    render();

    document.getElementById("btn-add").addEventListener("click", openAddModal);
    document.getElementById("btn-cancel-add").addEventListener("click", closeAddModal);
    document.getElementById("btn-confirm-add").addEventListener("click", function () {
      addCompetitor(document.getElementById("input-new-name").value);
    });
    document.getElementById("input-new-name").addEventListener("keydown", function (e) {
      if (e.key === "Enter") addCompetitor(e.target.value);
      if (e.key === "Escape") closeAddModal();
    });
    document.getElementById("modal-add").addEventListener("click", function (e) {
      if (e.target.id === "modal-add") closeAddModal();
    });

    document.getElementById("btn-toggle-archived").addEventListener("click", function () {
      state.showArchived = !state.showArchived;
      render();
    });

    document.getElementById("dashboard-tabs").addEventListener("click", function (e) {
      var tab = e.target.closest("[data-tab]");
      if (!tab) return;
      state.dashboardTab = tab.dataset.tab;
      render();
    });

    document.getElementById("dashboard-matrix").addEventListener("click", function (e) {
      var item = e.target.closest(".matrix-item");
      if (item) openDetail(item.dataset.id);
    });
    document.getElementById("dashboard-matrix").addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var item = e.target.closest(".matrix-item");
      if (item) {
        e.preventDefault();
        openDetail(item.dataset.id);
      }
    });

    document.getElementById("btn-back").addEventListener("click", backToDashboard);

    document.getElementById("dashboard-list").addEventListener("click", function (e) {
      var row = e.target.closest(".row");
      if (row) openDetail(row.dataset.id);
    });
    document.getElementById("dashboard-list").addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var row = e.target.closest(".row");
      if (row) {
        e.preventDefault();
        openDetail(row.dataset.id);
      }
    });

    document.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-action]");
      if (!btn) return;
      var action = btn.dataset.action;
      if (action === "open-add") openAddModal();
      else if (action === "remove-list-item") removeListItem(btn.dataset.field, Number(btn.dataset.index));
      else if (action === "add-list-item") addListItem(btn.dataset.field);
      else if (action === "remove-source") removeSource(Number(btn.dataset.index));
      else if (action === "add-source") addSource();
      else if (action === "flag-source") flagSource(Number(btn.dataset.index));
      else if (action === "archive-toggle") archiveToggle();
      else if (action === "search-ia") searchIA();
      else if (action === "init-matrix-position") initMatrixPosition();
    });

    document.addEventListener("input", function (e) {
      if (e.target.matches("input[type='range'][data-axis]")) {
        var row = e.target.closest(".matrix-slider-row");
        row.querySelector(".matrix-slider-value").textContent = e.target.value + "/10";
      }
    });

    document.addEventListener("change", function (e) {
      if (e.target.matches(".menace-select")) {
        updateCompetitor(state.currentId, { niveau_menace: e.target.value });
        renderDetail();
      } else if (e.target.matches("input[type='range'][data-axis]")) {
        setAxisValue(e.target.dataset.axis, Number(e.target.value));
      }
    });

    document.addEventListener("focusout", function (e) {
      var el = e.target;
      if (el.matches(".editable-title")) {
        updateCompetitor(state.currentId, { nom: el.textContent.trim() || "Sans nom" });
        renderDashboard(); // le nom peut avoir changé, la liste sera à jour au retour
      } else if (el.matches(".field-editable[data-field]")) {
        var patch = {};
        patch[el.dataset.field] = el.textContent.trim();
        updateCompetitor(state.currentId, patch);
      } else if (el.matches(".list-item-text")) {
        saveListItemText(el.dataset.field, Number(el.dataset.index), el.textContent);
      } else if (el.matches(".source-info")) {
        saveSourceField(Number(el.dataset.index), "info", el.textContent);
      } else if (el.matches(".source-link")) {
        saveSourceField(Number(el.dataset.index), "lien_ou_texte", el.textContent);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", init);
})();
