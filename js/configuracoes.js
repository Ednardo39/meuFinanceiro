/* ============================================================
MEU FINANCEIRO
CONFIGURAÇÕES
============================================================ */

/* ============================================================
AGUARDA O HTML CARREGAR
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

const moeda = document.getElementById("moeda");
const tema = document.getElementById("tema");
const formatoData = document.getElementById("formatoData");
const confirmarExclusao = document.getElementById("confirmarExclusao");
const btnSalvar = document.getElementById("btnSalvar");


/* ========================================================
   CARREGAR CONFIGURAÇÕES SALVAS
   ======================================================== */

const configuracoesSalvas =
    JSON.parse(localStorage.getItem("configuracoes")) || {};


if (configuracoesSalvas.moeda) {
    moeda.value = configuracoesSalvas.moeda;
}


if (configuracoesSalvas.tema) {
    tema.value = configuracoesSalvas.tema;
}


if (configuracoesSalvas.formatoData) {
    formatoData.value = configuracoesSalvas.formatoData;
}


if (configuracoesSalvas.confirmarExclusao !== undefined) {
    confirmarExclusao.checked =
        configuracoesSalvas.confirmarExclusao;
}


/* ========================================================
   SALVAR CONFIGURAÇÕES
   ======================================================== */

btnSalvar.addEventListener("click", function () {

    const configuracoes = {

        moeda: moeda.value,

        tema: tema.value,

        formatoData: formatoData.value,

        confirmarExclusao: confirmarExclusao.checked

    };


    localStorage.setItem(
        "configuracoes",
        JSON.stringify(configuracoes)
    );


    alert("Configurações salvas com sucesso!");

});

});