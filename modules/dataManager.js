// modules/dataManager.js

import { updateSectionVisibilityUI } from "./uiManager.js";
import { updatePreview } from "./templateRenderer.js";

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
  values.activeTemplate = window.activeTemplate;
  return values;
}

export function salvarDados() {
  const data = {
    formValues: getAllFormValues(),
    dataStores: window.dataStores,
    fotoUrl: window.fotoUrl,
    secoesVisiveis: window.secoesVisiveis,
  };
  localStorage.setItem("cvBuilderData", JSON.stringify(data));
}

export function carregarDados(dataString) {
  const data = JSON.parse(dataString);
  if (!data) return;

  for (const [id, value] of Object.entries(data.formValues)) {
    const element = document.getElementById(id);
    if (element) {
      if (element.type === "checkbox") element.checked = value;
      else element.value = value;
    }
  }
  window.activeTemplate = data.formValues.activeTemplate || "template-compacto";
  document.querySelectorAll(".template-choice").forEach((choice) => {
    choice.classList.toggle(
      "active",
      choice.dataset.template === window.activeTemplate
    );
  });
  window.dataStores = { ...window.dataStores, ...data.dataStores };
  window.fotoUrl = data.fotoUrl;
  window.secoesVisiveis = { ...window.secoesVisiveis, ...data.secoesVisiveis };

  updateSectionVisibilityUI();
  window.renderEditorPanels();
}

export function limparDados() {
  if (
    confirm(
      "Você tem certeza que quer apagar todo o seu progresso? Esta ação não pode ser desfeita."
    )
  ) {
    localStorage.removeItem("cvBuilderData");
    window.location.reload();
  }
}

export function exportarDados() {
  const dataStr = localStorage.getItem("cvBuilderData");
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  const nome =
    window.getFormValue("input-nome").replace(/\s+/g, "_") || "dados_curriculo";
  a.download = `${nome}.json`;
  a.click();
  URL.revokeObjectURL(url);
  a.remove();
}

export function importarDados(event) {
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
        JSON.parse(e.target.result);
        localStorage.setItem("cvBuilderData", e.target.result);
        window.location.reload();
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
