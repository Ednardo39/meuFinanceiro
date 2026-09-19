document.addEventListener("DOMContentLoaded", function () {

// ==============================
// ELEMENTOS DA TELA
// ==============================

const cartao = document.querySelector("#cartao");
const mes = document.querySelector("#mes");

const tituloFatura = document.querySelector("#tituloFatura");
const nomeCartao = document.querySelector("#nomeCartao");

const fechamento = document.querySelector("#fechamento");
const vencimento = document.querySelector("#vencimento");

const quantidadeCompras =
    document.querySelector("#quantidadeCompras");

const totalFatura =
    document.querySelector("#totalFatura");

const valorPagamento =
    document.querySelector("#valorPagamento");

const listaCompras =
    document.querySelector("#listaCompras");

const btnPagar =
    document.querySelector("#btnPagar");

// ==============================
// CONFIGURAÇÃO DOS CARTÕES
// ==============================

const cartoes = {

    nubank: {
        nome: "Nubank",
        final: "1234",
        fechamento: 2,
        vencimento: 10
    },

    "mercado-pago": {
        nome: "Mercado Pago",
        final: "5678",
        fechamento: 5,
        vencimento: 12
    },

    caixa: {
        nome: "Caixa",
        final: "9012",
        fechamento: 8,
        vencimento: 15
    }

};

// ==============================
// COMPRAS DE TESTE
// ==============================

/*
 * Por enquanto estamos usando dados
 * simulados.
 *
 * Mais tarde essas informações virão
 * do PHP + MySQL.
 */

const compras = [

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "1/6",
        categoria: "Mercado",
        valor: 200
    },

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "2/6",
        categoria: "Mercado",
        valor: 200
    },

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "3/6",
        categoria: "Mercado",
        valor: 200
    },

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "4/6",
        categoria: "Mercado",
        valor: 200
    },

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "5/6",
        categoria: "Mercado",
        valor: 200
    },

    {
        cartao: "nubank",
        data: "2026-09-19",
        descricao: "Compra de teste",
        parcela: "6/6",
        categoria: "Mercado",
        valor: 200
    }

];

// ==============================
// FORMATAR MOEDA
// ==============================

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}

// ==============================
// FORMATAR DATA
// ==============================

function formatarData(data) {

    const partes = data.split("-");

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}

// ==============================
// NOME DO MÊS
// ==============================

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

// ==============================
// ATUALIZAR FATURA
// ==============================

function atualizarFatura() {

    const dadosCartao = cartoes[cartao.value];

    if (!dadosCartao || !mes.value) {
        return;
    }

    // ------------------------------
    // MÊS DA FATURA
    // ------------------------------

    const partesMes = mes.value.split("-");

    const ano = parseInt(partesMes[0]);
    const numeroMes = parseInt(partesMes[1]);

    const nomeMes = nomesMeses[numeroMes - 1];

    tituloFatura.textContent =
        `${nomeMes}/${ano}`;

    nomeCartao.textContent =
        `${dadosCartao.nome} •••• ${dadosCartao.final}`;

    // ------------------------------
    // DATA DE FECHAMENTO
    // ------------------------------

    const dataFechamento =
        new Date(
            ano,
            numeroMes - 1,
            dadosCartao.fechamento
        );

    fechamento.textContent =
        dataFechamento.toLocaleDateString("pt-BR");

    // ------------------------------
    // DATA DE VENCIMENTO
    // ------------------------------

    const dataVencimento =
        new Date(
            ano,
            numeroMes - 1,
            dadosCartao.vencimento
        );

    vencimento.textContent =
        dataVencimento.toLocaleDateString("pt-BR");

    // ------------------------------
    // FILTRAR COMPRAS
    // ------------------------------

    /*
     * Neste primeiro momento usamos
     * o mês da parcela como referência.
     *
     * A compra de 19/09/2026, com fechamento
     * no dia 02, pertence à fatura de outubro.
     */

    let comprasDaFatura = [];

    compras.forEach(function (compra, indice) {

        if (compra.cartao !== cartao.value) {
            return;
        }

        /*
         * Nossa compra de teste foi feita
         * em setembro e possui 6 parcelas.
         *
         * A primeira parcela entra em outubro.
         */

        const primeiraFatura =
            calcularPrimeiraFatura(
                compra.data,
                dadosCartao.fechamento
            );

        const parcelaAtual =
            parseInt(compra.parcela.split("/")[0]);

        let mesParcela =
            primeiraFatura.mes + parcelaAtual - 1;

        let anoParcela =
            primeiraFatura.ano;

        while (mesParcela > 11) {

            mesParcela -= 12;
            anoParcela++;

        }

        if (
            anoParcela === ano &&
            mesParcela === numeroMes - 1
        ) {

            comprasDaFatura.push(compra);

        }

    });

    // ------------------------------
    // MONTAR LISTA
    // ------------------------------

    listaCompras.innerHTML = "";

    let total = 0;

    comprasDaFatura.forEach(function (compra) {

        total += compra.valor;

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td>
                ${formatarData(compra.data)}
            </td>

            <td>
                ${compra.descricao}
            </td>

            <td>
                ${compra.parcela}
            </td>

            <td>
                ${compra.categoria}
            </td>

            <td class="valor">
                ${formatarMoeda(compra.valor)}
            </td>
        `;

        listaCompras.appendChild(linha);

    });

    // ------------------------------
    // CASO NÃO TENHA COMPRAS
    // ------------------------------

    if (comprasDaFatura.length === 0) {

        const linha =
            document.createElement("tr");

        linha.innerHTML = `
            <td colspan="5" style="text-align:center;">
                Nenhuma compra nesta fatura.
            </td>
        `;

        listaCompras.appendChild(linha);

    }

    // ------------------------------
    // TOTAL
    // ------------------------------

    totalFatura.textContent =
        formatarMoeda(total);

    valorPagamento.textContent =
        formatarMoeda(total);

    quantidadeCompras.textContent =
        comprasDaFatura.length;

}

// ==============================
// CALCULAR PRIMEIRA FATURA
// ==============================

function calcularPrimeiraFatura(
    dataTexto,
    diaFechamento
) {

    const partes =
        dataTexto.split("-");

    let ano =
        parseInt(partes[0]);

    let mes =
        parseInt(partes[1]) - 1;

    const dia =
        parseInt(partes[2]);

    if (dia > diaFechamento) {

        mes++;

        if (mes > 11) {

            mes = 0;
            ano++;

        }

    }

    return {
        ano: ano,
        mes: mes
    };

}

// ==============================
// EVENTOS
// ==============================

cartao.addEventListener(
    "change",
    atualizarFatura
);

mes.addEventListener(
    "change",
    atualizarFatura
);

// ==============================
// BOTÃO PAGAR
// ==============================

btnPagar.addEventListener(
    "click",
    function () {

        const conta =
            document.querySelector(
                "#contaPagamento"
            );

        if (!conta.value) {

            alert(
                "Selecione a conta que será utilizada para pagar a fatura."
            );

            conta.focus();

            return;
        }

        alert(
            "O pagamento da fatura será implementado na próxima etapa."
        );

    }
);

// ==============================
// CARREGAR A FATURA INICIAL
// ==============================

atualizarFatura();

});