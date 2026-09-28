document.addEventListener("DOMContentLoaded", function () {

const listaMovimentacoes = document.getElementById("listaMovimentacoes");

const filtroMes = document.getElementById("filtroMes");

const filtroConta = document.getElementById("filtroConta");

const totalEntradas = document.getElementById("totalEntradas");

const totalSaidas = document.getElementById("totalSaidas");

const saldoMovimentacoes = document.getElementById("saldoMovimentacoes");


// ============================================================
// CARREGAR MOVIMENTAÇÕES
// ============================================================

let movimentacoes = [];

try {

    movimentacoes = JSON.parse(
        localStorage.getItem("movimentacoesContas")
    ) || [];

} catch (erro) {

    console.error("Erro ao carregar movimentações:", erro);

    movimentacoes = [];

}


// ============================================================
// FORMATAR MOEDA
// ============================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ============================================================
// FORMATAR DATA
// ============================================================

function formatarData(data) {

    if (!data) {
        return "-";
    }

    const partes = data.split("-");

    if (partes.length === 3) {

        return partes[2] + "/" + partes[1] + "/" + partes[0];

    }

    return data;

}


// ============================================================
// NOMES DOS MESES
// ============================================================

const nomesMeses = [
    "Janeiro",
    "Fevereiro",
    "Março",
    "Abril",
    "Maio",
    "Junho",
    "Julho",
    "Agosto",
    "Setembro",
    "Outubro",
    "Novembro",
    "Dezembro"
];


// ============================================================
// NOME DA CONTA
// ============================================================

function nomeDaConta(conta) {

    const nomes = {

        "nubank": "Nubank",

        "mercado-pago": "Mercado Pago",

        "caixa": "Caixa",

        "dinheiro": "Dinheiro em espécie"

    };

    return nomes[conta] || conta || "-";

}


// ============================================================
// CARREGAR PERÍODOS
// ============================================================

function carregarMeses() {

    const meses = [];

    movimentacoes.forEach(function (movimentacao) {

        if (!movimentacao.data) {
            return;
        }

        const mes = movimentacao.data.substring(0, 7);

        if (!meses.includes(mes)) {

            meses.push(mes);

        }

    });


    meses.sort(function (a, b) {

        return b.localeCompare(a);

    });


    filtroMes.innerHTML = "";


    const opcaoTodos = document.createElement("option");

    opcaoTodos.value = "todos";

    opcaoTodos.textContent = "Todos os períodos";

    filtroMes.appendChild(opcaoTodos);


    meses.forEach(function (mes) {

        const partes = mes.split("-");

        const ano = partes[0];

        const numeroMes = Number(partes[1]);

        const opcao = document.createElement("option");

        opcao.value = mes;

        opcao.textContent = nomesMeses[numeroMes - 1] + " de " + ano;

        filtroMes.appendChild(opcao);

    });

}


// ============================================================
// ATUALIZAR RESUMO
// ============================================================

function atualizarResumo(movimentacoesFiltradas) {

    let entradas = 0;

    let saidas = 0;


    movimentacoesFiltradas.forEach(function (movimentacao) {

        const valor = Number(movimentacao.valor) || 0;

        const tipo = String(movimentacao.tipo || "").toLowerCase();


        if (tipo === "entrada") {

            entradas += valor;

        }


        if (tipo === "saida" || tipo === "saída") {

            saidas += valor;

        }

    });


    const saldo = entradas - saidas;


    totalEntradas.textContent = formatarMoeda(entradas);

    totalSaidas.textContent = formatarMoeda(saidas);

    saldoMovimentacoes.textContent = formatarMoeda(saldo);

}


// ============================================================
// MOSTRAR MOVIMENTAÇÕES
// ============================================================

function mostrarMovimentacoes() {

    const periodoSelecionado = filtroMes.value;

    const contaSelecionada = filtroConta.value;


    let movimentacoesFiltradas = movimentacoes.filter(function (movimentacao) {


        // FILTRO DE PERÍODO

        if (
            periodoSelecionado !== "todos" &&
            !movimentacao.data.startsWith(periodoSelecionado)
        ) {

            return false;

        }


        // FILTRO DE CONTA

        if (
            contaSelecionada !== "todas" &&
            movimentacao.conta !== contaSelecionada
        ) {

            return false;

        }


        return true;

    });


    // ========================================================
    // ORDENAR DA MAIS RECENTE PARA A MAIS ANTIGA
    // ========================================================

    movimentacoesFiltradas.sort(function (a, b) {

        return String(b.data).localeCompare(String(a.data));

    });


    // ========================================================
    // ATUALIZAR RESUMO
    // ========================================================

    atualizarResumo(movimentacoesFiltradas);


    // ========================================================
    // LIMPAR TABELA
    // ========================================================

    listaMovimentacoes.innerHTML = "";


    // ========================================================
    // NENHUMA MOVIMENTAÇÃO
    // ========================================================

    if (movimentacoesFiltradas.length === 0) {

        const linha = document.createElement("tr");

        linha.innerHTML = `
            <td colspan="5">
                Nenhuma movimentação encontrada.
            </td>
        `;

        listaMovimentacoes.appendChild(linha);

        return;

    }


    // ========================================================
    // MOSTRAR MOVIMENTAÇÕES
    // ========================================================

    movimentacoesFiltradas.forEach(function (movimentacao) {

        const linha = document.createElement("tr");


        const tipo = String(
            movimentacao.tipo || ""
        ).toLowerCase();


        let textoTipo = "Saída";


        if (tipo === "entrada") {

            textoTipo = "Entrada";

        }


        const classeTipo =
            tipo === "entrada"
                ? "tipo-entrada"
                : "tipo-saida";


        const classeValor =
            tipo === "entrada"
                ? "valor-entrada"
                : "valor-saida";


        const sinal =
            tipo === "entrada"
                ? "+"
                : "-";


        linha.innerHTML = `

            <td>
                ${formatarData(movimentacao.data)}
            </td>

            <td>
                ${movimentacao.descricao || "-"}
            </td>

            <td>
                ${nomeDaConta(movimentacao.conta)}
            </td>

            <td class="${classeTipo}">
                ${textoTipo}
            </td>

            <td class="${classeValor}">
                ${sinal} ${formatarMoeda(movimentacao.valor)}
            </td>

        `;


        listaMovimentacoes.appendChild(linha);

    });

}


// ============================================================
// EVENTOS DOS FILTROS
// ============================================================

filtroMes.addEventListener("change", function () {

    mostrarMovimentacoes();

});


filtroConta.addEventListener("change", function () {

    mostrarMovimentacoes();

});


// ============================================================
// INICIALIZAÇÃO
// ============================================================

carregarMeses();

mostrarMovimentacoes();

});