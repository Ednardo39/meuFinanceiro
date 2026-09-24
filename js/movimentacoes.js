document.addEventListener("DOMContentLoaded", function () {

const listaMovimentacoes = document.getElementById("listaMovimentacoes");

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
// VERIFICAR SE EXISTEM MOVIMENTAÇÕES
// ============================================================

if (movimentacoes.length === 0) {

    listaMovimentacoes.innerHTML = `
        <tr>
            <td colspan="5">
                Nenhuma movimentação encontrada.
            </td>
        </tr>
    `;

    return;
}


// ============================================================
// ORDENAR DA MAIS RECENTE PARA A MAIS ANTIGA
// ============================================================

movimentacoes.sort(function (a, b) {

    return new Date(b.data) - new Date(a.data);

});


// ============================================================
// MOSTRAR MOVIMENTAÇÕES
// ============================================================

listaMovimentacoes.innerHTML = "";


movimentacoes.forEach(function (movimentacao) {

    const linha = document.createElement("tr");


    // --------------------------------------------------------
    // DATA
    // --------------------------------------------------------

    let dataFormatada = movimentacao.data || "";

    if (dataFormatada.includes("-")) {

        const partes = dataFormatada.split("-");

        dataFormatada =
            partes[2] + "/" +
            partes[1] + "/" +
            partes[0];
    }


    // --------------------------------------------------------
    // TIPO
    // --------------------------------------------------------

    const tipo =
        movimentacao.tipo === "entrada"
            ? "Entrada"
            : "Saída";


    const classeTipo =
        movimentacao.tipo === "entrada"
            ? "tipo-entrada"
            : "tipo-saida";


    // --------------------------------------------------------
    // VALOR
    // --------------------------------------------------------

    const valor = Number(movimentacao.valor) || 0;

    const valorFormatado =
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });


    const classeValor =
        movimentacao.tipo === "entrada"
            ? "valor-entrada"
            : "valor-saida";


    // --------------------------------------------------------
    // CONTA
    // --------------------------------------------------------

    let conta = movimentacao.conta || "-";

    if (conta === "nubank") {
        conta = "Nubank";
    }

    if (conta === "mercado-pago") {
        conta = "Mercado Pago";
    }

    if (conta === "caixa") {
        conta = "Caixa";
    }

    if (conta === "dinheiro") {
        conta = "Dinheiro em espécie";
    }


    // --------------------------------------------------------
    // MONTAR LINHA
    // --------------------------------------------------------

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

});