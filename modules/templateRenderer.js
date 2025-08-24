// modules/templateRenderer.js

import { salvarDados } from "./dataManager.js";

export function gerarPDF() {
  const preview = document.getElementById("cv-preview");
  const nome = window.getFormValue("input-nome") || "curriculo";
  const filename = `CV_${nome.replace(/\s+/g, "_")}.pdf`;

  const opt = {
    margin: 0,
    filename: filename,
    image: { type: "jpeg", quality: 0.98 },
    html2canvas: { scale: 2, useCORS: true },
    jsPDF: { unit: "cm", format: "a4", orientation: "portrait" },
    pagebreak: {
      mode: "css",
      avoid: [".cv-item", "header", "h2", ".cv-secao"],
    },
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

export function updatePreview() {
  const cvPreview = document.getElementById("cv-preview");
  if (!cvPreview) return;
  cvPreview.className = window.activeTemplate;

  document.getElementById("nome-tamanho-valor").textContent =
    window.getFormValue("input-nome-tamanho") + "pt";
  document.getElementById("titulo-tamanho-valor").textContent =
    window.getFormValue("input-titulo-tamanho") + "pt";
  document.getElementById("corpo-tamanho-valor").textContent =
    window.getFormValue("input-corpo-tamanho") + "pt";

  const cor = window.getFormValue("input-cor");
  document.documentElement.style.setProperty("--cor-primaria", cor);
  document.documentElement.style.setProperty(
    "--cor-texto-contraste",
    window.getContrastColor(cor)
  );
  document.documentElement.style.setProperty(
    "--tamanho-titulo",
    window.getFormValue("input-titulo-tamanho") + "pt"
  );
  document.documentElement.style.setProperty(
    "--tamanho-texto-corpo",
    window.getFormValue("input-corpo-tamanho") + "pt"
  );

  cvPreview.style.fontFamily = window.getFormValue("input-font");
  document.getElementById("cor-swatch").style.backgroundColor = cor;

  gerarHtmlPreview();
  salvarDados();
}

function gerarHtmlPreview() {
  const cvPreview = document.getElementById("cv-preview");
  const dados = {
    nome: window.getFormValue("input-nome"),
    subtitulo: window.getFormValue("input-subtitulo"),
    email: window.getFormValue("input-email"),
    telefone: window.getFormValue("input-telefone"),
    linkedin: window.getFormValue("input-linkedin"),
    github: window.getFormValue("input-github"),
    cnh: window.getFormValue("input-cnh"),
  };

  let contactContainerStyle = "";
  let contactLinkStyle = "";

  if (
    window.activeTemplate === "template-moderno" ||
    window.activeTemplate === "template-executivo"
  ) {
    contactContainerStyle = `style="color: var(--cor-texto-contraste);"`;
    contactLinkStyle = `style="color: inherit; background-color: transparent; text-decoration: underline;"`;
  }

  const nomeHtml = `<h1 style="font-size: ${window.getFormValue(
    "input-nome-tamanho"
  )}pt;">${dados.nome}</h1>`;
  const contatoHtml = `<div class="contato" ${contactContainerStyle}>${
    dados.email
      ? `<span>${window.icons.email}<a href="mailto:${dados.email}" ${contactLinkStyle}>${dados.email}</a></span>`
      : ""
  } ${
    dados.telefone
      ? `<span>${window.icons.telefone}${dados.telefone}</span>`
      : ""
  } ${
    dados.linkedin
      ? `<span>${window.icons.linkedin}<a href="${dados.linkedin}" target="_blank" ${contactLinkStyle}>LinkedIn</a></span>`
      : ""
  } ${
    dados.github
      ? `<span>${window.icons.github}<a href="${dados.github}" target="_blank" ${contactLinkStyle}>GitHub</a></span>`
      : ""
  } ${
    dados.cnh ? `<span>${window.icons.cnh}CNH: ${dados.cnh}</span>` : ""
  }</div>`;
  const resumoHtml = `<p>${window
    .getFormValue("input-resumo")
    .replace(/\n/g, "<br>")}</p>`;

  const experienciasHtml = window.dataStores.experiencias
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
  const formacaoHtml = window.dataStores.formacoes
    .map(
      (f) =>
        `<div class="cv-item"><h3>${f.curso}</h3><p class="detalhes">${f.instituicao} &bull; ${f.periodo}</p></div>`
    )
    .join("");
  const certificacoesHtml = window.dataStores.certificacoes
    .map(
      (c) =>
        `<div class="cv-item"><h3>${c.nome}</h3><p class="detalhes">${c.instituicao}</p></div>`
    )
    .join("");
  const habilidadesHtml = `<div class="skills-container">${window.dataStores.habilidades
    .map((h) => `<span class="skill-tag">${h.nome}</span>`)
    .join("")}</div>`;
  const habilidadesSuicoHtml = `<div class="habilidades-suico-container">${window.dataStores.habilidades
    .map((h) => `<p>${h.nome}</p>`)
    .join("")}</div>`;
  const idiomasHtml = window.dataStores.idiomas
    .map(
      (i) =>
        `<div class="idioma-item-cv"><strong>${i.nome}:</strong><span>${i.nivel}</span></div>`
    )
    .join("");
  const projetosHtml = window.dataStores.projetos
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

  const fotoFormato = window.getFormValue("input-foto-formato");
  const htmlFoto = window.getFormValue("toggle-foto")
    ? `<img src="${window.fotoUrl}" alt="Foto" class="${fotoFormato}">`
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

  if (templates[window.activeTemplate])
    cvPreview.innerHTML = templates[window.activeTemplate](templateData);
}

export function gerarHtmlSecao(titulo, conteudo, secaoKey) {
  if (
    !window.secoesVisiveis[secaoKey] ||
    !conteudo ||
    conteudo.trim() === "" ||
    conteudo.trim() === `<div class="skills-container"></div>` ||
    conteudo.trim() === `<div class="habilidades-suico-container"></div>`
  ) {
    return "";
  }
  return `<section class="cv-secao"><h2>${titulo}</h2>${conteudo}</section>`;
}

export const templates = {
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
