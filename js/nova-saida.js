const modo = document.querySelector("#modo");

const grupoCartao = document.querySelector("#grupoCartao");
const cartao = document.querySelector("#cartao");

const grupoParcelas = document.querySelector("#grupoParcelas");
const parcelas = document.querySelector("#parcelas");
const valorParcela = document.querySelector("#valorParcela");

const data = document.querySelector("#data");
const valor = document.querySelector("#valor");

const formulario = document.querySelector("#formulario");

const descricao = document.querySelector("#descricao");
const categoria = document.querySelector("#categoria");
const origem = document.querySelector("#origem");

// ============================================================
// DATA ATUAL
// ============================================================

const hoje = new Date();

const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

data.value = ano + "-" + mes + "-" + dia;

// ============================================================
// MODO DA OPERAÇÃO
// ============================================================

modo.addEventListener("change", function () {


if (modo.value === "credito") {

    grupoCartao.style.display = "block";
    grupoParcelas.style.display = "block";

} else {

    grupoCartao.style.display = "none";
    grupoParcelas.style.display = "none";

    cartao.value = "";
    parcelas.value = "";

    valorParcela.style.display = "none";
    valorParcela.textContent = "";

}


});

// ============================================================
// CALCULAR PARCELA
// ============================================================

function calcularParcela() {


if (modo.value !== "credito") {

    valorParcela.style.display = "none";
    return;

}


if (parcelas.value === "") {

    valorParcela.style.display = "none";
    valorParcela.textContent = "";

    return;

}


let textoValor = valor.value.trim();


if (textoValor === "") {

    valorParcela.style.display = "none";
    valorParcela.textContent = "";

    return;

}


textoValor = textoValor.replace("R$", "").trim();

textoValor = textoValor.replace(/\./g, "");

textoValor = textoValor.replace(",", ".");


const numeroValor = Number(textoValor);

const quantidadeParcelas = Number(parcelas.value);


if (
    isNaN(numeroValor) ||
    numeroValor <= 0 ||
    isNaN(quantidadeParcelas) ||
    quantidadeParcelas <= 0
) {

    valorParcela.style.display = "none";
    valorParcela.textContent = "";

    return;

}


const valorCalculado = numeroValor / quantidadeParcelas;


const valorFormatado = valorCalculado.toLocaleString("pt-BR", {

    minimumFractionDigits: 2,
    maximumFractionDigits: 2

});


valorParcela.textContent =
    "Valor aproximado de cada parcela: R$ " + valorFormatado;

valorParcela.style.display = "block";


}

// ============================================================
// ALTERAÇÃO DA QUANTIDADE DE PARCELAS
// ============================================================

parcelas.addEventListener("change", function () {


calcularParcela();


});

// ============================================================
// ALTERAÇÃO DO VALOR
// ============================================================

valor.addEventListener("input", function () {


calcularParcela();


});

// ============================================================
// FORMATAÇÃO DO VALOR
// ============================================================

valor.addEventListener("focus", function () {


valor.value = valor.value
    .replace("R$", "")
    .trim();


});

valor.addEventListener("blur", function () {


let texto = valor.value.trim();


if (texto === "") {

    valor.value = "";

    calcularParcela();

    return;

}


texto = texto.replace("R$", "").trim();

texto = texto.replace(/\./g, "");

texto = texto.replace(",", ".");


const numero = Number(texto);


if (isNaN(numero)) {

    valor.value = "";

    calcularParcela();

    return;

}


const numeroFormatado = numero.toLocaleString("pt-BR", {

    minimumFractionDigits: 2,
    maximumFractionDigits: 2

});


valor.value = "R$ " + numeroFormatado;


calcularParcela();


});

// ============================================================
// VALIDAÇÃO DO FORMULÁRIO
// ============================================================

formulario.addEventListener("submit", function (event) {


event.preventDefault();


// --------------------------------------------------------
// DESCRIÇÃO
// --------------------------------------------------------

if (descricao.value.trim() === "") {

    alert("Informe a descrição do gasto.");

    descricao.classList.add("campo-erro");

    descricao.focus();

    return;

}

descricao.classList.remove("campo-erro");


// --------------------------------------------------------
// CATEGORIA
// --------------------------------------------------------

if (categoria.value === "") {

    alert("Selecione uma categoria.");

    categoria.classList.add("campo-erro");

    categoria.focus();

    return;

}

categoria.classList.remove("campo-erro");


// --------------------------------------------------------
// VALOR
// --------------------------------------------------------

let textoValor = valor.value.trim();


if (textoValor === "") {

    alert("Informe o valor do gasto.");

    valor.classList.add("campo-erro");

    valor.focus();

    return;

}


textoValor = textoValor.replace("R$", "").trim();

textoValor = textoValor.replace(/\./g, "");

textoValor = textoValor.replace(",", ".");


const numeroValor = Number(textoValor);


if (isNaN(numeroValor) || numeroValor <= 0) {

    alert("Informe um valor válido maior que zero.");

    valor.classList.add("campo-erro");

    valor.focus();

    return;

}

valor.classList.remove("campo-erro");


// --------------------------------------------------------
// DATA
// --------------------------------------------------------

if (data.value === "") {

    alert("Informe a data do gasto.");

    data.classList.add("campo-erro");

    data.focus();

    return;

}

data.classList.remove("campo-erro");


// --------------------------------------------------------
// MODO
// --------------------------------------------------------

if (modo.value === "") {

    alert("Selecione o modo da operação.");

    modo.classList.add("campo-erro");

    modo.focus();

    return;

}

modo.classList.remove("campo-erro");


// --------------------------------------------------------
// ORIGEM
// --------------------------------------------------------

if (origem.value === "") {

    alert("Selecione a origem do dinheiro.");

    origem.classList.add("campo-erro");

    origem.focus();

    return;

}

origem.classList.remove("campo-erro");


// --------------------------------------------------------
// CARTÃO
// --------------------------------------------------------

if (modo.value === "credito" && cartao.value === "") {

    alert("Selecione o cartão utilizado.");

    cartao.classList.add("campo-erro");

    cartao.focus();

    return;

}

cartao.classList.remove("campo-erro");


// --------------------------------------------------------
// PARCELAS
// --------------------------------------------------------

if (modo.value === "credito" && parcelas.value === "") {

    alert("Selecione a quantidade de parcelas.");

    parcelas.classList.add("campo-erro");

    parcelas.focus();

    return;

}

parcelas.classList.remove("campo-erro");


// --------------------------------------------------------
// SUCESSO
// --------------------------------------------------------

alert("Todos os campos obrigatórios foram preenchidos corretamente!");


});
