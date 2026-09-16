const data = document.querySelector("#data");
const valor = document.querySelector("#valor");


// =========================================================
// PREENCHER DATA ATUAL
// =========================================================

const hoje = new Date();

const ano = hoje.getFullYear();

const mes = String(hoje.getMonth() + 1).padStart(2, "0");

const dia = String(hoje.getDate()).padStart(2, "0");

const dataAtual = ano + "-" + mes + "-" + dia;

data.value = dataAtual;


// =========================================================
// FORMATAÇÃO DO VALOR
// =========================================================

valor.addEventListener("focus", function () {

    valor.value = valor.value
        .replace("R$", "")
        .trim();

});


valor.addEventListener("blur", function () {

    let texto = valor.value.trim();

    if (texto === "") {
        valor.value = "";
        return;
    }

    texto = texto.replace("R$", "").trim();

    texto = texto.replace(/\./g, "");

    texto = texto.replace(",", ".");

    const numero = Number(texto);

    if (isNaN(numero)) {
        valor.value = "";
        return;
    }

    const numeroFormatado = numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    valor.value = "R$ " + numeroFormatado;

});


// =========================================================
// ELEMENTOS DO FORMULÁRIO
// =========================================================

const formulario = document.querySelector("#formulario");

const descricao = document.querySelector("#descricao");

const categoria = document.querySelector("#categoria");


// =========================================================
// VALIDAÇÃO DO FORMULÁRIO
// =========================================================

formulario.addEventListener("submit", function (evento) {

    evento.preventDefault();


    // -----------------------------------------------------
    // VALIDAÇÃO DA DESCRIÇÃO
    // -----------------------------------------------------

    const textoDescricao = descricao.value.trim();

    if (textoDescricao === "") {

        descricao.classList.add("campo-erro");

        alert("Informe a descrição da entrada.");

        descricao.focus();

        return;
    }

    descricao.classList.remove("campo-erro");


    // -----------------------------------------------------
    // VALIDAÇÃO DA CATEGORIA
    // -----------------------------------------------------

    if (categoria.value === "") {

        categoria.classList.add("campo-erro");

        alert("Selecione uma categoria.");

        categoria.focus();

        return;
    }

    categoria.classList.remove("campo-erro");


    // -----------------------------------------------------
    // VALIDAÇÃO DO VALOR
    // -----------------------------------------------------

    let valorTexto = valor.value.trim();

    if (valorTexto === "") {

        valor.classList.add("campo-erro");

        alert("Informe o valor da entrada.");

        valor.focus();

        return;
    }


    valorTexto = valorTexto
        .replace("R$", "")
        .trim();

    valorTexto = valorTexto.replace(/\./g, "");

    valorTexto = valorTexto.replace(",", ".");


    const valorNumerico = Number(valorTexto);


    if (isNaN(valorNumerico) || valorNumerico <= 0) {

        valor.classList.add("campo-erro");

        alert("Informe um valor maior que zero.");

        valor.focus();

        return;
    }

    valor.classList.remove("campo-erro");


    // -----------------------------------------------------
    // VALIDAÇÃO DA DATA
    // -----------------------------------------------------

    if (data.value === "") {

        data.classList.add("campo-erro");

        alert("Informe a data da entrada.");

        data.focus();

        return;
    }

    data.classList.remove("campo-erro");


    // -----------------------------------------------------
    // TUDO CORRETO
    // -----------------------------------------------------

    alert("Todos os campos obrigatórios foram preenchidos corretamente!");

});