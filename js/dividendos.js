// ============================================================
// MEU FINANCEIRO
// TELA DE DIVIDENDOS
// ============================================================

document.addEventListener("DOMContentLoaded", function () {

const formulario = document.getElementById("formulario");
const descricao = document.getElementById("descricao");
const valor = document.getElementById("valor");
const data = document.getElementById("data");
const conta = document.getElementById("conta");
const observacao = document.getElementById("observacao");

const totalDividendos = document.getElementById("totalDividendos");
const listaDividendos = document.getElementById("listaDividendos");


// ========================================================
// DATA ATUAL
// ========================================================

const hoje = new Date();

const ano = hoje.getFullYear();
const mes = String(hoje.getMonth() + 1).padStart(2, "0");
const dia = String(hoje.getDate()).padStart(2, "0");

data.value = `${ano}-${mes}-${dia}`;


// ========================================================
// FORMATAR MOEDA
// ========================================================

valor.addEventListener("input", function () {

    let numero = valor.value.replace(/\D/g, "");

    if (numero === "") {
        valor.value = "";
        return;
    }

    numero = parseInt(numero, 10) / 100;

    valor.value = numero.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

});


// ========================================================
// CONVERTER VALOR
// ========================================================

function converterValor(valorFormatado) {

    return Number(
        valorFormatado
            .replace("R$", "")
            .replace(/\./g, "")
            .replace(",", ".")
            .trim()
    );

}


// ========================================================
// FORMATAR MOEDA PARA EXIBIÇÃO
// ========================================================

function formatarMoeda(numero) {

    return Number(numero).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ========================================================
// FORMATAR DATA
// ========================================================

function formatarData(dataTexto) {

    if (!dataTexto) {
        return "";
    }

    const partes = dataTexto.split("-");

    if (partes.length !== 3) {
        return dataTexto;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ========================================================
// CARREGAR DIVIDENDOS
// ========================================================

function carregarDividendos() {

    try {

        return JSON.parse(
            localStorage.getItem("dividendos")
        ) || [];

    } catch (erro) {

        return [];

    }

}


// ========================================================
// SALVAR DIVIDENDO
// ========================================================

formulario.addEventListener("submit", function (event) {

    event.preventDefault();

    const descricaoValor = descricao.value.trim();
    const valorNumerico = converterValor(valor.value);
    const dataValor = data.value;
    const contaValor = conta.value;
    const observacaoValor = observacao.value.trim();


    if (!descricaoValor) {
        alert("Informe a descrição do dividendo.");
        descricao.focus();
        return;
    }


    if (!valorNumerico || valorNumerico <= 0) {
        alert("Informe um valor válido.");
        valor.focus();
        return;
    }


    if (!dataValor) {
        alert("Informe a data.");
        data.focus();
        return;
    }


    if (!contaValor) {
        alert("Selecione a conta de destino.");
        conta.focus();
        return;
    }


    const dividendos = carregarDividendos();


    const novoDividendo = {

        id: Date.now(),

        descricao: descricaoValor,

        valor: valorNumerico,

        data: dataValor,

        conta: contaValor,

        observacao: observacaoValor

    };


    dividendos.push(novoDividendo);


    localStorage.setItem(
        "dividendos",
        JSON.stringify(dividendos)
    );


    // ====================================================
    // REGISTRAR ENTRADA NA CONTA
    // ====================================================

    const movimentacoes = JSON.parse(
        localStorage.getItem("movimentacoesContas")
    ) || [];


    movimentacoes.push({

        id: Date.now() + 1,

        descricao: descricaoValor,

        categoria: "Dividendos",

        valor: valorNumerico,

        data: dataValor,

        forma: "Dividendo",

        conta: contaValor,

        tipo: "entrada",

        origem: "dividendo",

        observacao: observacaoValor

    });


    localStorage.setItem(
        "movimentacoesContas",
        JSON.stringify(movimentacoes)
    );


    alert("Dividendo registrado com sucesso!");


    formulario.reset();


    // Colocar novamente a data atual
    data.value = `${ano}-${mes}-${dia}`;


    carregarLista();

});


// ========================================================
// CARREGAR LISTA
// ========================================================

function carregarLista() {

    const dividendos = carregarDividendos();


    if (dividendos.length === 0) {

        listaDividendos.innerHTML = `
            <p class="sem-registros">
                Nenhum dividendo registrado.
            </p>
        `;

        totalDividendos.textContent = "R$ 0,00";

        return;

    }


    // ====================================================
    // TOTAL
    // ====================================================

    const total = dividendos.reduce(
        function (soma, dividendo) {

            return soma + Number(dividendo.valor || 0);

        },
        0
    );


    totalDividendos.textContent = formatarMoeda(total);


    // ====================================================
    // ORDENAR DO MAIS RECENTE PARA O MAIS ANTIGO
    // ====================================================

    dividendos.sort(function (a, b) {

        return new Date(b.data) - new Date(a.data);

    });


    // ====================================================
    // LISTA
    // ====================================================

    listaDividendos.innerHTML = "";


    dividendos.forEach(function (dividendo) {

        const item = document.createElement("div");

        item.className = "item-dividendo";


        item.innerHTML = `

            <div>
                <strong>${dividendo.descricao}</strong>

                <small>
                    ${formatarData(dividendo.data)}
                </small>

                <small>
                    Conta: ${dividendo.conta}
                </small>
            </div>

            <strong>
                ${formatarMoeda(dividendo.valor)}
            </strong>

        `;


        listaDividendos.appendChild(item);

    });

}


// ========================================================
// INICIAR
// ========================================================

carregarLista();

});