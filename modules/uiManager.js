// modules/uiManager.js

import { updatePreview } from "./templateRenderer.js";

export function setupAccordion() {
  document.querySelectorAll(".secao-editor h3").forEach((header) => {
    header.addEventListener("click", (event) => {
      if (event.target.classList.contains("btn-toggle-vis")) return;
      const editorSection = header.parentElement;
      editorSection.classList.toggle("collapsed");
    });
  });
}

export function setupSortableLists() {
  Object.keys(window.dataStores).forEach((store) => {
    const container = document.getElementById(`${store}-container`);
    if (container) {
      new Sortable(container, {
        animation: 150,
        onEnd: (evt) => {
          const item = window.dataStores[store].splice(evt.oldIndex, 1)[0];
          window.dataStores[store].splice(evt.newIndex, 0, item);
          window.renderEditorPanels();
          updatePreview();
        },
      });
    }
  });
}

export function setupInputListeners() {
  const inputs = document.querySelectorAll("input, select, textarea");
  inputs.forEach((input) => {
    if (input.id !== "import-input" && input.id !== "input-foto") {
      input.addEventListener("input", updatePreview);
      input.addEventListener("change", updatePreview);
    }
  });
}

export function updateSectionVisibilityUI() {
  for (const secaoKey in window.secoesVisiveis) {
    const button = document.querySelector(
      `.btn-toggle-vis[data-secao="${secaoKey}"]`
    );
    if (button)
      button.classList.toggle("oculto", !window.secoesVisiveis[secaoKey]);
  }
}
