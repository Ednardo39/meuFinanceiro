document.addEventListener("DOMContentLoaded", function () {

const listaMovimentacoes = document.getElementById("listaMovimentacoes");
const filtroMes = document.getElementById("filtroMes");
const filtroConta = document.getElementById("filtroConta");


// ============================================================
// LER MOVIMENTAÇÕES SALVAS
// ============================================================

let movimentacoes = [];

try {

    movimentacoes = JSON.parse(
        localStorage.getItem("movimentacoesContas")
    ) || [];

} catch (erro) {

    console.error("Erro ao ler movimentações:", erro);

    movimentacoes = [];
}


// ============================================================
// FORMATAR VALOR
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

    if (!data || !data.includes("-")) {
        return data || "-";
    }

    const partes = data.split("-");

    return (
        partes[2] + "/" +
        partes[1] + "/" +
        partes[0]
    );

}


// ============================================================
// NOME DO MÊS
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
// CRIAR LISTA DE MESES EXISTENTES
// ============================================================

function carregarMeses() {

    const meses = [];

    movimentacoes.forEach(function (movimentacao) {

        if (!movimentacao.data) {
            return;
        }

        const partes = movimentacao.data.split("-");

        if (partes.length !== 3) {
            return;
        }

        const ano = partes[0];
        const mes = partes[1];

        const valorMes = ano + "-" + mes;

        if (!meses.includes(valorMes)) {

            meses.push(valorMes);

        }

    });


    // Ordenar do mais recente para o mais antigo

    meses.sort(function (a, b) {

        return b.localeCompare(a);

    });


    // Limpar opções atuais

    filtroMes.innerHTML = `
        <option value="todos">Todos os períodos</option>
    `;


    // Criar opções

    meses.forEach(function (mes) {

        const partes = mes.split("-");

        const ano = Number(partes[0]);
        const numeroMes = Number(partes[1]) - 1;

        const option = document.createElement("option");

        option.value = mes;

        option.textContent =
            nomesMeses[numeroMes] + " " + ano;

        filtroMes.appendChild(option);

    });

}


// ============================================================
// CONVERTER NOME DA CONTA
// ============================================================

function nomeDaConta(conta) {

    if (conta === "nubank") {
        return "Nubank";
    }

    if (conta === "mercado-pago") {
        return "Mercado Pago";
    }

    if (conta === "caixa") {
        return "Caixa";
    }

    if (conta === "dinheiro") {
        return "Dinheiro em espécie";
    }

    return conta || "-";

}


// ============================================================
// MOSTRAR MOVIMENTAÇÕES
// ============================================================

function mostrarMovimentacoes() {

    const mesSelecionado = filtroMes.value;
    const contaSelecionada = filtroConta.value;


    // --------------------------------------------------------
    // FILTRAR
    // --------------------------------------------------------

    const movimentacoesFiltradas = movimentacoes.filter(
        function (movimentacao) {

            // Filtro de mês

            let passouMes = true;

            if (mesSelecionado !== "todos") {

                passouMes =
                    movimentacao.data &&
                    movimentacao.data.startsWith(mesSelecionado);

            }


            // Filtro de conta

            let passouConta = true;

            if (contaSelecionada !== "todas") {

                passouConta =
                    movimentacao.conta === contaSelecionada;

            }


            return passouMes && passouConta;

        }
    );


    // --------------------------------------------------------
    // ORDENAR
    // --------------------------------------------------------

    movimentacoesFiltradas.sort(function (a, b) {

        return new Date(b.data) - new Date(a.data);

    });


    // --------------------------------------------------------
    // NENHUM RESULTADO
    // --------------------------------------------------------

    if (movimentacoesFiltradas.length === 0) {

        listaMovimentacoes.innerHTML = `
            <tr>
                <td colspan="5">
                    Nenhuma movimentação encontrada.
                </td>
            </tr>
        `;

        return;

    }


    // --------------------------------------------------------
    // LIMPAR TABELA
    // --------------------------------------------------------

    listaMovimentacoes.innerHTML = "";


    // --------------------------------------------------------
    // MOSTRAR RESULTADOS
    // --------------------------------------------------------

    movimentacoesFiltradas.forEach(function (movimentacao) {

        const linha = document.createElement("tr");


        // ----------------------------------------------------
        // DATA
        // ----------------------------------------------------

        const dataFormatada =
            formatarData(movimentacao.data);


        // ----------------------------------------------------
        // TIPO
        // ----------------------------------------------------

        const tipo =
            movimentacao.tipo === "entrada"
                ? "Entrada"
                : "Saída";


        const classeTipo =
            movimentacao.tipo === "entrada"
                ? "tipo-entrada"
                : "tipo-saida";


        // ----------------------------------------------------
        // VALOR
        // ----------------------------------------------------

        const valor =
            Number(movimentacao.valor) || 0;


        const valorFormatado =
            formatarMoeda(valor);


        const classeValor =
            movimentacao.tipo === "entrada"
                ? "valor-entrada"
                : "valor-saida";


        // ----------------------------------------------------
        // CONTA
        // ----------------------------------------------------

        const conta =
            nomeDaConta(movimentacao.conta);


        // ----------------------------------------------------
        // MONTAR LINHA
        // ----------------------------------------------------

        linha.innerHTML = `

            <td>
                ${dataFormatada}
            </td>

            <td>
                ${movimentacao.descricao || "-"}
            </td>

            <td>
                ${conta}
            </td>

            <td class="${classeTipo}">
                ${tipo}
            </td>

            <td class="${classeValor}">
                ${valorFormatado}
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