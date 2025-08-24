// script.js

import {
  carregarDados,
  limparDados,
  exportarDados,
  importarDados,
} from "./modules/dataManager.js";
import {
  setupInputListeners,
  setupAccordion,
  setupSortableLists,
  updateSectionVisibilityUI,
} from "./modules/uiManager.js";
import {
  updatePreview,
  gerarPDF,
  templates,
  gerarHtmlSecao,
} from "./modules/templateRenderer.js";

// --- ESTADO GLOBAL (compartilhado entre módulos) ---
window.dataStores = {
  experiencias: [],
  formacoes: [],
  certificacoes: [],
  habilidades: [],
  idiomas: [],
  projetos: [],
};
window.secoesVisiveis = {
  resumo: true,
  experiencias: true,
  formacoes: true,
  certificacoes: true,
  habilidades: true,
  idiomas: true,
  projetos: true,
};
window.fotoUrl = "Perfil.png";
window.activeTemplate = "template-compacto";
window.cropper = null;

// --- FUNÇÕES DE UTILIDADE GLOBAIS ---
window.getFormValue = function (id) {
  const element = document.getElementById(id);
  if (!element) return "";
  return element.type === "checkbox" ? element.checked : element.value;
};
window.getContrastColor = function (hexColor) {
  if (!hexColor) return "#FFFFFF";
  const r = parseInt(hexColor.substr(1, 2), 16);
  const g = parseInt(hexColor.substr(3, 2), 16);
  const b = parseInt(hexColor.substr(5, 2), 16);
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;
  return yiq >= 128 ? "#111827" : "#FFFFFF";
};
window.icons = {
  email: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: -0.15em; margin-right: 0.4em;"><path d="M22 6c0-1.1-.9-2-2-2H4c-1.1 0-2 .9-2 2v12c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6zm-2 0-8 5-8-5h16zm0 12H4V8l8 5 8-5v10z"/></svg>`,
  telefone: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: -0.15em; margin-right: 0.4em;"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
  linkedin: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: -0.15em; margin-right: 0.4em;"><path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14zm-11 5H5v10h3V8zm-1.5-2.5a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zM18 8h-2.5c-2 0-3.5 1.5-3.5 3.5V18h3v-5.5c0-.5.5-1 1-1s1 .5 1 1V18h3v-6.5c0-2-1.5-3.5-3.5-3.5z"/></svg>`,
  github: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: -0.15em; margin-right: 0.4em;"><path d="M12 2A10 10 0 0 0 2 12c0 4.42 2.87 8.17 6.84 9.5.5.09.68-.22.68-.48v-1.7c-2.78.6-3.37-1.34-3.37-1.34-.45-1.16-1.11-1.47-1.11-1.47-.9-.62.07-.6.07-.6 1 .07 1.53 1.03 1.53 1.03.9 1.52 2.34 1.08 2.91.83.09-.65.35-1.08.63-1.34-2.22-.25-4.55-1.11-4.55-4.94 0-1.1.39-1.99 1.03-2.69-.1-.25-.45-1.28.1-2.65 0 0 .84-.27 2.75 1.02A9.58 9.58 0 0 1 12 6.8c.85 0 1.7.11 2.5.33 1.91-1.29 2.75-1.02 2.75-1.02.55 1.37.2 2.4.1 2.65.64.7 1.03 1.6 1.03 2.69 0 3.84-2.34 4.68-4.57 4.93.36.31.68.92.68 1.85v2.73c0 .27.18.58.69.48A10 10 0 0 0 22 12c0-5.52-4.48-10-10-10z"/></svg>`,
  cnh: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="1em" height="1em" fill="currentColor" style="vertical-align: -0.15em; margin-right: 0.4em;"><path d="M18.92 6.01C18.72 5.42 18.16 5 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-1h12v1c0 .55.45 1 1 1h1c.55 0 1-.45 1-1v-8l-2.08-5.99zM6.5 16c-.83 0-1.5-.67-1.5-1.5S5.67 13 6.5 13s1.5.67 1.5 1.5-.67 1.5-1.5 1.5zM11 11l1.5-4.5h11L19 11H5z"/></svg>`,
};

// --- FUNÇÕES EXPOSTAS PARA O HTML ---
window.toggleSectionVisibility = function (secaoKey) {
  window.secoesVisiveis[secaoKey] = !window.secoesVisiveis[secaoKey];
  updateSectionVisibilityUI();
  updatePreview();
};
window.adicionarItem = function (store, item) {
  if (!window.dataStores[store]) window.dataStores[store] = [];
  window.dataStores[store].push(item);
  window.renderEditorPanels();
  updatePreview();
};
window.removerItem = function (store, index) {
  if (window.dataStores[store]) {
    window.dataStores[store].splice(index, 1);
    window.renderEditorPanels();
    updatePreview();
  }
};
window.updateItem = function (store, index, field, value) {
  if (
    window.dataStores[store] &&
    window.dataStores[store][index] !== undefined
  ) {
    window.dataStores[store][index][field] = value;
    updatePreview();
  }
};
window.limparDados = limparDados;
window.exportarDados = exportarDados;
window.importarDados = importarDados;
window.gerarPDF = gerarPDF;

// As funções abaixo continuam aqui pois são acionadas por eventos no HTML
window.adicionarExperiencia = () =>
  window.adicionarItem("experiencias", {
    cargo: "",
    empresa: "",
    periodo: "",
    descricao: "",
  });
window.adicionarFormacao = () =>
  window.adicionarItem("formacoes", {
    curso: "",
    instituicao: "",
    periodo: "",
  });
window.adicionarCertificacao = () =>
  window.adicionarItem("certificacoes", { nome: "", instituicao: "" });
window.adicionarHabilidade = () =>
  window.adicionarItem("habilidades", { nome: "" });
window.adicionarIdioma = () =>
  window.adicionarItem("idiomas", { nome: "", nivel: "" });
window.adicionarProjeto = () =>
  window.adicionarItem("projetos", { nome: "", link: "", descricao: "" });

// --- FUNÇÕES DE RENDERIZAÇÃO E INICIALIZAÇÃO DO EDITOR ---
window.renderEditorPanels = function () {
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
  for (const key in window.dataStores) {
    const container = document.getElementById(`${key}-container`);
    if (container)
      container.innerHTML = (window.dataStores[key] || [])
        .map((item, index) => templates[key](item, index))
        .join("");
  }
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
    secoesVisiveis: {
      resumo: true,
      experiencias: true,
      formacoes: true,
      certificacoes: true,
      habilidades: true,
      idiomas: true,
      projetos: true,
    },
  };
  localStorage.setItem("cvBuilderData", JSON.stringify(dadosIniciais));
  carregarDados(JSON.stringify(dadosIniciais));
}

// --- EVENTO DE INICIALIZAÇÃO PRINCIPAL ---
document.addEventListener("DOMContentLoaded", () => {
  const savedData = localStorage.getItem("cvBuilderData");
  if (savedData) {
    carregarDados(savedData);
  } else {
    carregarDadosIniciaisExemplo();
  }
  window.renderEditorPanels();
  updatePreview();
  setupAccordion();
  setupSortableLists();
  setupInputListeners();
  updateSectionVisibilityUI();

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
        if (window.cropper) window.cropper.destroy();
        window.cropper = new Cropper(imageToCrop, {
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
    if (window.cropper) {
      const canvas = window.cropper.getCroppedCanvas({
        width: 512,
        height: 512,
        imageSmoothingQuality: "high",
      });
      window.fotoUrl = canvas.toDataURL("image/jpeg");
      modal.style.display = "none";
      window.cropper.destroy();
      window.cropper = null;
      updatePreview();
    }
  });
  cancelCropBtn.addEventListener("click", () => {
    modal.style.display = "none";
    if (window.cropper) {
      window.cropper.destroy();
      window.cropper = null;
    }
  });

  document.querySelectorAll(".template-choice").forEach((choice) =>
    choice.addEventListener("click", () => {
      document
        .querySelector(".template-choice.active")
        .classList.remove("active");
      choice.classList.add("active");
      window.activeTemplate = choice.dataset.template;
      updatePreview();
    })
  );
});
