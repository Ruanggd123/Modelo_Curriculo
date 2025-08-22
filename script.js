// --- ESTADO INICIAL DOS DADOS ---
const initialDataStores = {
  experiencias: [],
  formacoes: [],
  certificacoes: [],
  habilidades: [],
  idiomas: [],
  projetos: [],
};
const initialSectionVisibility = {
  resumo: true,
  experiencias: true,
  formacoes: true,
  certificacoes: true,
  habilidades: true,
  idiomas: true,
  projetos: true,
};

let dataStores = JSON.parse(JSON.stringify(initialDataStores));
let secoesVisiveis = JSON.parse(JSON.stringify(initialSectionVisibility));
let fotoUrl = "perfil.png"; // Foto padrão local
let activeTemplate = "template-compacto";
let cropper = null; // Variável para a instância do Cropper

// --- FUNÇÕES DE GERENCIAMENTO DE DADOS ---
function getAllFormValues() {
  const ids = [
    "input-nome",
    "input-subtitulo",
    "input-email",
    "input-telefone",
    "input-linkedin",
    "input-github",
    "input-cnh",
    "input-resumo",
    "input-font",
    "input-cor",
    "input-nome-tamanho",
    "input-titulo-tamanho",
    "input-corpo-tamanho",
    "input-foto-formato",
    "toggle-foto",
  ];
  const values = {};
  ids.forEach((id) => {
    const element = document.getElementById(id);
    if (element) {
      values[id] =
        element.type === "checkbox" ? element.checked : element.value;
    }
  });
  values.activeTemplate = activeTemplate;
  return values;
}

function salvarDados() {
  const data = {
    formValues: getAllFormValues(),
    dataStores: dataStores,
    fotoUrl: fotoUrl,
    secoesVisiveis: secoesVisiveis,
  };
  localStorage.setItem("cvBuilderData", JSON.stringify(data));
}

function carregarDados(dataString) {
  const data = JSON.parse(dataString);
  if (!data) return;

  // Carrega valores dos campos simples
  for (const [id, value] of Object.entries(data.formValues)) {
    const element = document.getElementById(id);
    if (element) {
      if (element.type === "checkbox") element.checked = value;
      else element.value = value;
    }
  }
  activeTemplate = data.formValues.activeTemplate || "template-compacto";
  document.querySelectorAll(".template-choice").forEach((choice) => {
    choice.classList.toggle(
      "active",
      choice.dataset.template === activeTemplate
    );
  });
  dataStores = { ...initialDataStores, ...data.dataStores };
  fotoUrl = data.fotoUrl;
  secoesVisiveis = { ...initialSectionVisibility, ...data.secoesVisiveis };

  updateSectionVisibilityUI();
}

function limparDados() {
  if (
    confirm(
      "Você tem certeza que quer apagar todo o seu progresso? Esta ação não pode ser desfeita."
    )
  ) {
    localStorage.removeItem("cvBuilderData");
    window.location.reload();
  }
}

function exportarDados() {
  const dataStr = localStorage.getItem("cvBuilderData");
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const nome =
    getFormValue("input-nome").replace(/\s+/g, "_") || "dados_curriculo";
  a.download = `${nome}.json`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

function importarDados(event) {
  if (
    !confirm("Isso irá sobrescrever todos os dados atuais. Deseja continuar?")
  ) {
    event.target.value = "";
    return;
  }
  const file = event.target.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        JSON.parse(e.target.result); // Apenas para validar o JSON
        localStorage.setItem("cvBuilderData", e.target.result);
        window.location.reload(); // Recarrega para garantir um estado limpo
      } catch (error) {
        alert(
          "Erro ao ler o arquivo. Certifique-se que é um arquivo JSON válido."
        );
      }
    };
    reader.readAsText(file);
  }
  event.target.value = "";
}

// --- FUNÇÕES DE UTILIDADE E UI ---
function getContrastColor(hexColor) {
  if (!hexColor) return "#FFFFFF";
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#111827" : "#FFFFFF";
}

function getFormValue(id) {
  const element = document.getElementById(id);
  if (!element) return "";
  return element.type === "checkbox" ? element.checked : element.value;
}

const icons = {
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>`,
  telefone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-11 5H5v10h3V8zm-1.5-2.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18 8h-2.5c-2 0-3.5 1.5-3.5 3.5V18h3v-5.5c0-.5.5-1 1-1s1 .5 1 1V18h3v-6.5c0-2-1.5-3.5-3.5-3.5z"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.28.1-2.65 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>`,
  cnh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5S7.33 16 6.5 16zm11 0c-.83 0-1.5-.67-1.5-1.5s.67-1.5 1.5-1.5 1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
};

function toggleSectionVisibility(secaoKey) {
  secoesVisiveis[secaoKey] = !secoesVisiveis[secaoKey];
  updateSectionVisibilityUI();
  updatePreview();
}

function updateSectionVisibilityUI() {
  for (const secaoKey in secoesVisiveis) {
    const button = document.querySelector(
      `.btn-toggle-vis[data-secao="${secaoKey}"]`
    );
    if (button) button.classList.toggle("oculto", !secoesVisiveis[secaoKey]);
  }
}

// --- RENDERIZAÇÃO DO EDITOR E MANIPULAÇÃO DE DADOS ---
function renderEditorPanels() {
  const templates = {
    experiencias: (item, index) =>
      `<div class="item-dinamico" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('experiencias', ${index})">X</button><div><label>Cargo</label><input value="${item.cargo}" oninput="updateItem('experiencias', ${index}, 'cargo', this.value)"></div><div><label>Empresa & Local</label><input value="${item.empresa}" oninput="updateItem('experiencias', ${index}, 'empresa', this.value)"></div><div><label>Período</label><input value="${item.periodo}" oninput="updateItem('experiencias', ${index}, 'periodo', this.value)"></div><div><label>Descrição (use ; para novas linhas)</label><textarea oninput="updateItem('experiencias', ${index}, 'descricao', this.value)">${item.descricao}</textarea></div></div>`,
    formacoes: (item, index) =>
      `<div class="item-dinamico" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('formacoes', ${index})">X</button><div><label>Curso</label><input value="${item.curso}" oninput="updateItem('formacoes', ${index}, 'curso', this.value)"></div><div><label>Instituição</label><input value="${item.instituicao}" oninput="updateItem('formacoes', ${index}, 'instituicao', this.value)"></div><div><label>Período</label><input value="${item.periodo}" oninput="updateItem('formacoes', ${index}, 'periodo', this.value)"></div></div>`,
    certificacoes: (item, index) =>
      `<div class="item-dinamico" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('certificacoes', ${index})">X</button><div><label>Certificado/Curso</label><input value="${item.nome}" oninput="updateItem('certificacoes', ${index}, 'nome', this.value)"></div><div><label>Instituição Emissora</label><input value="${item.instituicao}" oninput="updateItem('certificacoes', ${index}, 'instituicao', this.value)"></div></div>`,
    habilidades: (item, index) =>
      `<div class="item-dinamico habilidade-item" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('habilidades', ${index})">X</button><input placeholder="Habilidade" value="${item.nome}" oninput="updateItem('habilidades', ${index}, 'nome', this.value)"></div>`,
    idiomas: (item, index) =>
      `<div class="item-dinamico idioma-item" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('idiomas', ${index})">X</button><input placeholder="Idioma" value="${item.nome}" oninput="updateItem('idiomas', ${index}, 'nome', this.value)"><input placeholder="Nível (Ex: Fluente)" value="${item.nivel}" oninput="updateItem('idiomas', ${index}, 'nivel', this.value)"></div>`,
    projetos: (item, index) =>
      `<div class="item-dinamico" data-index="${index}"><button class="btn btn-remover" onclick="removerItem('projetos', ${index})">X</button><div><label>Nome do Projeto</label><input value="${item.nome}" oninput="updateItem('projetos', ${index}, 'nome', this.value)"></div><div><label>Link (opcional)</label><input value="${item.link}" oninput="updateItem('projetos', ${index}, 'link', this.value)"></div><div><label>Descrição (use ; para novas linhas)</label><textarea oninput="updateItem('projetos', ${index}, 'descricao', this.value)">${item.descricao}</textarea></div></div>`,
  };
  for (const key in dataStores) {
    const container = document.getElementById(`${key}-container`);
    if (container)
      container.innerHTML = (dataStores[key] || [])
        .map((item, index) => templates[key](item, index))
        .join("");
  }
}

function updateItem(store, index, field, value) {
  if (dataStores[store] && dataStores[store][index] !== undefined) {
    dataStores[store][index][field] = value;
    updatePreview();
  }
}

function adicionarItem(store, item) {
  if (!dataStores[store]) dataStores[store] = [];
  dataStores[store].push(item);
  renderEditorPanels();
  updatePreview();
}

function removerItem(store, index) {
  if (dataStores[store]) {
    dataStores[store].splice(index, 1);
    renderEditorPanels();
    updatePreview();
  }
}

const adicionarExperiencia = () =>
  adicionarItem("experiencias", {
    cargo: "",
    empresa: "",
    periodo: "",
    descricao: "",
  });
const adicionarFormacao = () =>
  adicionarItem("formacoes", { curso: "", instituicao: "", periodo: "" });
const adicionarCertificacao = () =>
  adicionarItem("certificacoes", { nome: "", instituicao: "" });
const adicionarHabilidade = () => adicionarItem("habilidades", { nome: "" });
const adicionarIdioma = () => adicionarItem("idiomas", { nome: "", nivel: "" });
const adicionarProjeto = () =>
  adicionarItem("projetos", { nome: "", link: "", descricao: "" });

// --- LÓGICA PRINCIPAL E PREVIEW ---
document.addEventListener("DOMContentLoaded", () => {
  const savedData = localStorage.getItem("cvBuilderData");
  if (savedData) {
    carregarDados(savedData);
  } else {
    carregarDadosIniciaisExemplo();
  }
  renderEditorPanels();
  updatePreview();
  setupAccordion();
  setupSortableLists();
  setupInputListeners();

  // Lógica do Modal de Corte de Foto
  const fotoInput = document.getElementById("input-foto");
  const modal = document.getElementById("crop-modal");
  const imageToCrop = document.getElementById("image-to-crop");
  const confirmCropBtn = document.getElementById("confirm-crop-btn");
  const cancelCropBtn = document.getElementById("cancel-crop-btn");

  fotoInput.addEventListener("change", (e) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        imageToCrop.src = event.target.result;
        modal.style.display = "flex";
        if (cropper) cropper.destroy();
        cropper = new Cropper(imageToCrop, {
          aspectRatio: 1 / 1,
          viewMode: 1,
          background: false,
          autoCropArea: 0.9,
          responsive: true,
        });
      };
      reader.readAsDataURL(e.target.files[0]);
    }
    e.target.value = "";
  });
  confirmCropBtn.addEventListener("click", () => {
    if (cropper) {
      const canvas = cropper.getCroppedCanvas({
        width: 512,
        height: 512,
        imageSmoothingQuality: "high",
      });
      fotoUrl = canvas.toDataURL("image/jpeg");
      modal.style.display = "none";
      cropper.destroy();
      cropper = null;
      updatePreview();
    }
  });
  cancelCropBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (cropper) {
      cropper.destroy();
      cropper = null;
    }
  });

  document.querySelectorAll(".template-choice").forEach((choice) =>
    choice.addEventListener("click", () => {
      document
        .querySelector(".template-choice.active")
        .classList.remove("active");
      choice.classList.add("active");
      activeTemplate = choice.dataset.template;
      updatePreview();
    })
  );
});

// -- NOVAS FUNÇÕES DE INICIALIZAÇÃO --
function setupAccordion() {
  document.querySelectorAll(".secao-editor h3").forEach((header) => {
    header.addEventListener("click", (event) => {
      if (event.target.classList.contains("btn-toggle-vis")) return;
      const editorSection = header.parentElement;
      editorSection.classList.toggle("collapsed");
    });
  });
}

function setupSortableLists() {
  Object.keys(dataStores).forEach((store) => {
    const container = document.getElementById(`${store}-container`);
    if (container) {
      new Sortable(container, {
        animation: 150,
        onEnd: (evt) => {
          const item = dataStores[store].splice(evt.oldIndex, 1)[0];
          dataStores[store].splice(evt.newIndex, 0, item);
          renderEditorPanels(); // Re-render to update onclick indices
          updatePreview();
        },
      });
    }
  });
}

function setupInputListeners() {
  // Liga o updatePreview a todos os inputs que devem acioná-lo
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    if (input.id !== "import-input" && input.id !== "input-foto") {
      input.addEventListener("input", updatePreview);
      input.addEventListener("change", updatePreview);
    }
  });
}

// --- ATUALIZAÇÃO E RENDERIZAÇÃO DO PREVIEW ---
function updatePreview() {
  const cvPreview = document.getElementById("cv-preview");
  if (!cvPreview) return;
  cvPreview.className = activeTemplate;

  document.getElementById("nome-tamanho-valor").textContent =
    getFormValue("input-nome-tamanho") + "pt";
  document.getElementById("titulo-tamanho-valor").textContent =
    getFormValue("input-titulo-tamanho") + "pt";
  document.getElementById("corpo-tamanho-valor").textContent =
    getFormValue("input-corpo-tamanho") + "pt";

  const cor = getFormValue("input-cor");
  document.documentElement.style.setProperty("--cor-primaria", cor);
  document.documentElement.style.setProperty(
    "--cor-texto-contraste",
    getContrastColor(cor)
  );
  document.documentElement.style.setProperty(
    "--tamanho-titulo",
    getFormValue("input-titulo-tamanho") + "pt"
  );
  document.documentElement.style.setProperty(
    "--tamanho-texto-corpo",
    getFormValue("input-corpo-tamanho") + "pt"
  );

  cvPreview.style.fontFamily = getFormValue("input-font");
  document.getElementById("cor-swatch").style.backgroundColor = cor;

  gerarHtmlPreview();
  salvarDados();
}

function gerarPDF() {
  const preview = document.getElementById("cv-preview");
  const nome = getFormValue("input-nome") || "curriculo";
  const filename = `CV_${nome.replace(/\s+/g, "_")}.pdf`;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    pagebreak: { mode: "css", avoid: [".cv-item", "header"] },
  };

  const btn = document.querySelector(".btn-print");
  const originalText = btn.innerHTML;
  btn.innerHTML = "Gerando PDF...";
  btn.disabled = true;

  html2pdf()
    .from(preview)
    .set(opt)
    .output("bloburl")
    .then(function (pdfUrl) {
      const newWindow = window.open(pdfUrl, "_blank");
      if (newWindow) {
        newWindow.document.write(
          "<html><head><title>Visualização do PDF</title></head><body>" +
            '<iframe width="100%" height="100%" src="' +
            pdfUrl +
            '"></iframe>' +
            "</body></html>"
        );
      } else {
        alert(
          "Seu navegador bloqueou a abertura da janela de visualização. Por favor, permita pop-ups para este site."
        );
      }
      btn.innerHTML = originalText;
      btn.disabled = false;
    });
}

function gerarHtmlPreview() {
  const cvPreview = document.getElementById("cv-preview");
  const dados = {
    nome: getFormValue("input-nome"),
    subtitulo: getFormValue("input-subtitulo"),
    email: getFormValue("input-email"),
    telefone: getFormValue("input-telefone"),
    linkedin: getFormValue("input-linkedin"),
    github: getFormValue("input-github"),
    cnh: getFormValue("input-cnh"),
  };

  let contactContainerStyle = "";
  let contactLinkStyle = "";

  if (
    activeTemplate === "template-moderno" ||
    activeTemplate === "template-executivo"
  ) {
    contactContainerStyle = `style="color: var(--cor-texto-contraste);"`;
    contactLinkStyle = `style="color: inherit; background-color: transparent; text-decoration: underline;"`;
  }

  const nomeHtml = `<h1 style="font-size: ${getFormValue(
    "input-nome-tamanho"
  )}pt;">${dados.nome}</h1>`;
  const contatoHtml = `<div class="contato" ${contactContainerStyle}>${
    dados.email
      ? `<span>${icons.email}<a href="mailto:${dados.email}" ${contactLinkStyle}>${dados.email}</a></span>`
      : ""
  } ${
    dados.telefone ? `<span>${icons.telefone}${dados.telefone}</span>` : ""
  } ${
    dados.linkedin
      ? `<span>${icons.linkedin}<a href="${dados.linkedin}" target="_blank" ${contactLinkStyle}>LinkedIn</a></span>`
      : ""
  } ${
    dados.github
      ? `<span>${icons.github}<a href="${dados.github}" target="_blank" ${contactLinkStyle}>GitHub</a></span>`
      : ""
  } ${dados.cnh ? `<span>${icons.cnh}CNH: ${dados.cnh}</span>` : ""}</div>`;
  const resumoHtml = `<p>${getFormValue("input-resumo").replace(
    /\n/g,
    "<br>"
  )}</p>`;

  const experienciasHtml = dataStores.experiencias
    .map(
      (e) =>
        `<div class="cv-item"><h3>${e.cargo}</h3><p class="detalhes">${
          e.empresa
        } &bull; ${e.periodo}</p><ul>${e.descricao
          .split(";")
          .map((i) => `<li>${i.trim()}</li>`)
          .join("")}</ul></div>`
    )
    .join("");
  const formacaoHtml = dataStores.formacoes
    .map(
      (f) =>
        `<div class="cv-item"><h3>${f.curso}</h3><p class="detalhes">${f.instituicao} &bull; ${f.periodo}</p></div>`
    )
    .join("");
  const certificacoesHtml = dataStores.certificacoes
    .map(
      (c) =>
        `<div class="cv-item"><h3>${c.nome}</h3><p class="detalhes">${c.instituicao}</p></div>`
    )
    .join("");
  const habilidadesHtml = `<div class="skills-container">${dataStores.habilidades
    .map((h) => `<span class="skill-tag">${h.nome}</span>`)
    .join("")}</div>`;
  const habilidadesSuicoHtml = `<div class="habilidades-suico-container">${dataStores.habilidades
    .map((h) => `<p>${h.nome}</p>`)
    .join("")}</div>`;
  const idiomasHtml = dataStores.idiomas
    .map(
      (i) =>
        `<div class="idioma-item-cv"><strong>${i.nome}:</strong><span>${i.nivel}</span></div>`
    )
    .join("");
  const projetosHtml = dataStores.projetos
    .map(
      (p) =>
        `<div class="cv-item"><h3>${p.nome}</h3>${
          p.link
            ? `<p class="detalhes"><a href="${p.link}" target="_blank">${p.link}</a></p>`
            : ""
        }<ul>${p.descricao
          .split(";")
          .map((i) => `<li>${i.trim()}</li>`)
          .join("")}</ul></div>`
    )
    .join("");

  const conteudoPrincipal = [
    gerarHtmlSecao("Resumo", resumoHtml, "resumo"),
    gerarHtmlSecao(
      "Experiência Profissional",
      experienciasHtml,
      "experiencias"
    ),
    gerarHtmlSecao("Formação Acadêmica", formacaoHtml, "formacoes"),
    gerarHtmlSecao("Certificações", certificacoesHtml, "certificacoes"),
    gerarHtmlSecao("Projetos", projetosHtml, "projetos"),
    gerarHtmlSecao("Habilidades", habilidadesHtml, "habilidades"),
    gerarHtmlSecao("Idiomas", idiomasHtml, "idiomas"),
  ].join("");

  const fotoFormato = getFormValue("input-foto-formato");
  const htmlFoto = getFormValue("toggle-foto")
    ? `<img src="${fotoUrl}" alt="Foto" class="${fotoFormato}">`
    : "";

  const templateData = {
    ...dados,
    nomeHtml,
    contatoHtml,
    conteudoPrincipal,
    htmlFoto,
    habilidadesHtml,
    habilidadesSuicoHtml,
    idiomasHtml,
  };

  if (templates[activeTemplate])
    cvPreview.innerHTML = templates[activeTemplate](templateData);
}

function gerarHtmlSecao(titulo, conteudo, secaoKey) {
  if (
    !secoesVisiveis[secaoKey] ||
    !conteudo ||
    conteudo.trim() === "" ||
    conteudo.trim() === `<div class="skills-container"></div>` ||
    conteudo.trim() === `<div class="habilidades-suico-container"></div>`
  ) {
    return "";
  }
  return `<section class="cv-secao"><h2>${titulo}</h2>${conteudo}</section>`;
}

const templates = {
  "template-compacto": (d) =>
    `<header>${d.htmlFoto}${d.nomeHtml}${
      d.subtitulo ? `<p class="subtitulo">${d.subtitulo}</p>` : ""
    }${d.contatoHtml}</header><main>${d.conteudoPrincipal}</main>`,
  "template-moderno": (d) =>
    `<aside class="cv-sidebar">${
      d.htmlFoto
    }<section class="cv-secao"><h2>Contato</h2>${
      d.contatoHtml
    }</section>${gerarHtmlSecao(
      "Habilidades",
      d.habilidadesHtml,
      "habilidades"
    )}${gerarHtmlSecao(
      "Idiomas",
      d.idiomasHtml,
      "idiomas"
    )}</aside><main class="cv-main">${d.nomeHtml}${
      d.subtitulo ? `<p class="subtitulo">${d.subtitulo}</p>` : ""
    }${d.conteudoPrincipal.replace(
      /<section class="cv-secao"><h2>(Habilidades|Idiomas)<\/h2>.*?<\/section>/gs,
      ""
    )}</main>`,
  "template-executivo": (d) =>
    `<header>${d.nomeHtml}${
      d.subtitulo ? `<p class="subtitulo">${d.subtitulo}</p>` : ""
    }${d.contatoHtml}</header><main>${d.conteudoPrincipal}</main>`,
  "template-suico": (d) =>
    `<header>${d.nomeHtml}${
      d.subtitulo ? `<p class="subtitulo">${d.subtitulo}</p>` : ""
    }</header><main><aside class="col-esquerda">${gerarHtmlSecao(
      "Contato",
      d.contatoHtml,
      "contato"
    )}${gerarHtmlSecao(
      "Habilidades",
      d.habilidadesSuicoHtml,
      "habilidades"
    )}${gerarHtmlSecao(
      "Idiomas",
      d.idiomasHtml,
      "idiomas"
    )}</aside><div class="col-direita">${d.conteudoPrincipal.replace(
      /<section class="cv-secao"><h2>(Habilidades|Idiomas|Contato)<\/h2>.*?<\/section>/gs,
      ""
    )}</div></main>`,
};

// --- INICIALIZAÇÃO COM DADOS DE EXEMPLO ---
function carregarDadosIniciaisExemplo() {
  const dadosIniciais = {
    formValues: {
      "input-nome": "Francisco Ruan Gomes Damasceno",
      "input-subtitulo":
        "Estudante de Engenharia de Computação | Desenvolvedor",
      "input-email": "ruangmes159@gmail.com",
      "input-telefone": "88 98188-5499",
      "input-linkedin": "https://www.linkedin.com/in/ruanggd123",
      "input-github": "https://github.com/Ruanggd123",
      "input-cnh": "",
      "input-resumo":
        "Estudante de Engenharia de Computação na Universidade Federal do Ceará (UFC) com foco em desenvolvimento de software. Tenho experiência prática em front-end com React, JavaScript, HTML e CSS, e em back-end com Java, Spring Boot e Python. Busco uma oportunidade para aplicar e expandir minhas habilidades, contribuindo em projetos desafiadores e crescendo profissionalmente na área de tecnologia.",
      "input-font": "'Lato', sans-serif",
      "input-cor": "#2563eb",
      "input-nome-tamanho": "38",
      "input-titulo-tamanho": "13",
      "input-corpo-tamanho": "10.5",
      "input-foto-formato": "foto-circulo",
      "toggle-foto": true,
      activeTemplate: "template-compacto",
    },
    dataStores: {
      experiencias: [
        {
          cargo: "Desenvolvedor Front-End (Estágio)",
          empresa: "FitBank | Sobral, Ceará (Remoto)",
          periodo: "nov 2024 a abr 2025",
          descricao:
            "Participei de um programa de formação focado em desenvolvimento front-end.;Desenvolvi pequenos projetos internos para praticar e aprimorar boas práticas de UI/UX.",
        },
        {
          cargo: "Tutor de Lógica de Programação",
          empresa: "Projeto Entrando no Jogo | Meruoca, Ceará",
          periodo: "Jan 2023 a Jun 2023",
          descricao:
            "Ministrei aulas de lógica de programação para jovens do município.",
        },
      ],
      formacoes: [
        {
          curso: "Engenharia de Computação",
          instituicao: "Universidade Federal do Ceará (UFC)",
          periodo: "Cursando",
        },
      ],
      certificacoes: [],
      habilidades: [
        { nome: "JavaScript" },
        { nome: "Java" },
        { nome: "Python" },
        { nome: "HTML5 & CSS3" },
        { nome: "React" },
        { nome: "Spring Boot" },
        { nome: "API REST" },
        { nome: "Git & GitHub" },
      ],
      idiomas: [
        { nome: "Português", nivel: "Nativo" },
        { nome: "Inglês", nivel: "Intermediário" },
      ],
      projetos: [
        {
          nome: "Sistema de Gerenciamento de Caixa",
          link: "https://github.com/Ruanggd123/Caixa",
          descricao:
            "Sistema de caixa em JS, HTML e CSS para simular registro de vendas.",
        },
        {
          nome: "Plataforma Universitária UniMove",
          link: "https://github.com/Ruanggd123/UniMove",
          descricao:
            "Plataforma web para universitários com formulários e futura integração de rastreamento de ônibus.",
        },
      ],
    },
    fotoUrl: "Perfil.png",
    secoesVisiveis: initialSectionVisibility,
  };
  localStorage.setItem("cvBuilderData", JSON.stringify(dadosIniciais));
  carregarDados(JSON.stringify(dadosIniciais));
}
