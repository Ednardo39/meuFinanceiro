// ============================================================
// NOVA SAÍDA
// JavaScript exclusivo desta tela
// ============================================================


// ============================================================
// 1. ELEMENTOS DA TELA
// ============================================================

const modo = document.querySelector("#modo");
const grupoCartao = document.querySelector("#grupoCartao");
const cartao = document.querySelector("#cartao");

const data = document.querySelector("#data");
const valor = document.querySelector("#valor");

const formulario = document.querySelector("#formulario");
const descricao = document.querySelector("#descricao");
const categoria = document.querySelector("#categoria");
const origem = document.querySelector("#origem");


// ============================================================
// 2. PREENCHER A DATA ATUAL
// ============================================================

const hoje = new Date();

const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

const dataAtual = ano + "-" + mes + "-" + dia;

data.value = dataAtual;


// ============================================================
// 3. MOSTRAR / ESCONDER CARTÃO
// ============================================================

modo.addEventListener("change", function () {

    if (modo.value === "credito") {

        grupoCartao.style.display = "block";

    } else {

        grupoCartao.style.display = "none";
        cartao.value = "";

    }

});


// ============================================================
// 4. FORMATAR VALOR EM REAIS
// ============================================================

// Quando clicar no campo, retiramos o "R$"
valor.addEventListener("focus", function () {

    valor.value = valor.value
        .replace("R$", "")
        .trim();

});


// Quando sair do campo, formatamos novamente
valor.addEventListener("blur", function () {

    let texto = valor.value.trim();

    // Se estiver vazio, não fazemos nada
    if (texto === "") {
        valor.value = "";
        return;
    }

    // Remove R$
    texto = texto.replace("R$", "").trim();

    // Remove pontos de milhar
    texto = texto.replace(/\./g, "");

    // Troca vírgula decimal por ponto
    texto = texto.replace(",", ".");

    const numero = Number(texto);

    // Se não for número válido
    if (isNaN(numero)) {
        valor.value = "";
        return;
    }

    // Formata para o padrão brasileiro
    const numeroFormatado = numero.toLocaleString("pt-BR", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    valor.value = "R$ " + numeroFormatado;

});


// ============================================================
// 5. VALIDAÇÃO DO FORMULÁRIO
// ============================================================

formulario.addEventListener("submit", function (event) {

    // Impede o formulário de recarregar a página
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
    // MODO DE PAGAMENTO
    // --------------------------------------------------------

    if (modo.value === "") {

        alert("Selecione o modo de pagamento.");

        modo.classList.add("campo-erro");

        modo.focus();

        return;

    }

    modo.classList.remove("campo-erro");


    // --------------------------------------------------------
    // ORIGEM DO DINHEIRO
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
    // TUDO CERTO
    // --------------------------------------------------------

    alert("Todos os campos obrigatórios foram preenchidos corretamente!");

});