document.addEventListener("DOMContentLoaded", function () {

// ============================================================
// MEU FINANCEIRO
// DASHBOARD
// ============================================================

const saldoMes = document.getElementById("saldoMes");
const totalEntradas = document.getElementById("totalEntradas");
const totalGastos = document.getElementById("totalGastos");
const totalDividendos = document.getElementById("totalDividendos");

const nomeMes = document.getElementById("nomeMes");
const mesAnterior = document.getElementById("mesAnterior");
const mesProximo = document.getElementById("mesProximo");

const barraEntradas = document.getElementById("barraEntradas");
const barraGastos = document.getElementById("barraGastos");

const listaUltimasMovimentacoes =
    document.getElementById("listaUltimasMovimentacoes");

const listaGastosCategoria =
    document.getElementById("listaGastosCategoria");

const listaComprasCartao =
    document.getElementById("listaComprasCartao");


// ============================================================
// MÊS INICIAL DO DASHBOARD
// ============================================================

let dataDashboard = new Date(2026, 8, 1);


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
        return "";
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
        return data;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;

}


// ============================================================
// NOME DO MÊS
// ============================================================

function atualizarNomeMes() {

    const meses = [
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

    nomeMes.textContent =
        `${meses[dataDashboard.getMonth()]} ${dataDashboard.getFullYear()}`;

}


// ============================================================
// CARREGAR MOVIMENTAÇÕES
// ============================================================

function carregarMovimentacoes() {

    try {

        return JSON.parse(
            localStorage.getItem("movimentacoesContas")
        ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar movimentações:",
            erro
        );

        return [];

    }

}


// ============================================================
// ATUALIZAR BARRAS
// ============================================================

function atualizarBarras(entradas, gastos) {

    const maior = Math.max(entradas, gastos, 1);

    barraEntradas.style.width =
        `${(entradas / maior) * 100}%`;

    barraGastos.style.width =
        `${(gastos / maior) * 100}%`;

}


// ============================================================
// ÚLTIMAS MOVIMENTAÇÕES
// ============================================================

function atualizarUltimasMovimentacoes(movimentacoes) {

    listaUltimasMovimentacoes.innerHTML = "";

    const ultimas = [...movimentacoes]
        .sort((a, b) => {

            return new Date(
                b.data
            ) - new Date(
                a.data
            );

        })
        .slice(0, 5);


    if (ultimas.length === 0) {

        listaUltimasMovimentacoes.innerHTML =
            "<p>Nenhuma movimentação neste mês.</p>";

        return;

    }


    ultimas.forEach(function (movimento) {

        const div = document.createElement("div");

        div.className = "movimentacao-item";


        const valor = Number(
            movimento.valor || 0
        );


        const ehEntrada =
            movimento.tipo === "entrada";


        const sinal =
            ehEntrada ? "+" : "-";


        div.innerHTML = `

            <div>

                <strong>
                    ${movimento.descricao || "Sem descrição"}
                </strong>

                <small>
                    ${formatarData(movimento.data)}
                </small>

            </div>

            <span class="${ehEntrada ? "entrada" : "saida"}">

                ${sinal}${formatarMoeda(valor)}

            </span>

        `;


        listaUltimasMovimentacoes.appendChild(div);

    });

}


// ============================================================
// CALCULAR PARCELAS
// ============================================================

function calcularParcelas(valor, quantidade) {

    valor = Math.round(
        Number(valor || 0) * 100
    );

    quantidade = Number(quantidade || 1);

    if (quantidade < 1) {
        quantidade = 1;
    }


    const base =
        Math.floor(valor / quantidade);

    const resto =
        valor - (base * quantidade);


    const parcelas = [];


    for (let i = 0; i < quantidade; i++) {

        let valorParcela = base;

        if (i >= quantidade - resto) {
            valorParcela++;
        }

        parcelas.push(
            valorParcela / 100
        );

    }


    return parcelas;

}


// ============================================================
// PRIMEIRA FATURA
// ============================================================

function calcularPrimeiraFatura(dataCompra, fechamento) {

    const data = new Date(
        dataCompra + "T00:00:00"
    );

    const dia = data.getDate();


    if (dia > fechamento) {

        data.setMonth(
            data.getMonth() + 1
        );

    }


    return {
        mes: data.getMonth(),
        ano: data.getFullYear()
    };

}


// ============================================================
// DADOS DO CARTÃO
// ============================================================

function obterDadosCartao(compra) {

    const cartao =
        compra.cartao || "";


    if (
        cartao === "nubank" ||
        cartao === "nubank-1234"
    ) {

        return {
            nome: "Nubank",
            final: "1234",
            fechamento: 2
        };

    }


    if (
        cartao === "mercado-pago" ||
        cartao === "mercado-pago-5678"
    ) {

        return {
            nome: "Mercado Pago",
            final: "5678",
            fechamento: 5
        };

    }


    if (
        cartao === "caixa" ||
        cartao === "caixa-9012"
    ) {

        return {
            nome: "Caixa",
            final: "9012",
            fechamento: 8
        };

    }


    return {
        nome: compra.nomeCartao || "Cartão",
        final: "",
        fechamento: 2
    };

}


// ============================================================
// VERIFICAR SE PARCELA PERTENCE AO MÊS
// ============================================================

function parcelaPertenceAoMes(
    compra,
    numeroParcela,
    mesSelecionado,
    anoSelecionado
) {

    const cartao =
        obterDadosCartao(compra);


    const primeira =
        calcularPrimeiraFatura(
            compra.data,
            cartao.fechamento
        );


    const dataFatura =
        new Date(
            primeira.ano,
            primeira.mes,
            1
        );


    dataFatura.setMonth(
        dataFatura.getMonth() +
        (numeroParcela - 1)
    );


    return (
        dataFatura.getMonth() === mesSelecionado &&
        dataFatura.getFullYear() === anoSelecionado
    );

}


// ============================================================
// GASTOS POR CATEGORIA
// ============================================================

function atualizarGastosPorCategoria() {

    const movimentacoes =
        carregarMovimentacoes();


    let compras = [];


    try {

        compras =
            JSON.parse(
                localStorage.getItem("compras")
            ) || [];

    } catch (erro) {

        compras = [];

    }


    const mesSelecionado =
        dataDashboard.getMonth();


    const anoSelecionado =
        dataDashboard.getFullYear();


    const categorias = {};


    // --------------------------------------------------------
    // GASTOS DIRETOS
    // --------------------------------------------------------

    movimentacoes.forEach(function (movimento) {

        const tipo =
            movimento.tipo;


        if (
            tipo !== "saida" &&
            tipo !== "saída"
        ) {
            return;
        }


        // Não contar pagamento de fatura
        // novamente como categoria de gasto.

        if (
            movimento.origem === "fatura"
        ) {
            return;
        }


        const data =
            new Date(
                movimento.data + "T00:00:00"
            );


        if (
            data.getMonth() !== mesSelecionado ||
            data.getFullYear() !== anoSelecionado
        ) {
            return;
        }


        const categoria =
            movimento.categoria ||
            "Sem categoria";


        const valor =
            Number(movimento.valor || 0);


        categorias[categoria] =
            (categorias[categoria] || 0) +
            valor;

    });


    // --------------------------------------------------------
    // COMPRAS NO CRÉDITO
    // --------------------------------------------------------

    compras.forEach(function (compra) {

        if (
            compra.modo !== "credito"
        ) {
            return;
        }


        const quantidade =
            Number(compra.parcelas || 1);


        const valores =
            calcularParcelas(
                compra.valor,
                quantidade
            );


        valores.forEach(function (
            valorParcela,
            indice
        ) {

            const numeroParcela =
                indice + 1;


            if (
                !parcelaPertenceAoMes(
                    compra,
                    numeroParcela,
                    mesSelecionado,
                    anoSelecionado
                )
            ) {
                return;
            }


            const categoria =
                compra.categoria ||
                "Sem categoria";


            categorias[categoria] =
                (categorias[categoria] || 0) +
                valorParcela;

        });

    });


    listaGastosCategoria.innerHTML = "";


    const lista =
        Object.entries(categorias)
            .sort((a, b) => b[1] - a[1]);


    if (lista.length === 0) {

        listaGastosCategoria.innerHTML =
            "<p>Nenhum gasto neste mês.</p>";

        return;

    }


    const maior =
        lista[0][1];


    lista.forEach(function ([categoria, valor]) {

        const div =
            document.createElement("div");


        div.className =
            "categoria-gasto";


        const percentual =
            (valor / maior) * 100;


        div.innerHTML = `

            <div class="categoria-gasto-topo">

                <span>
                    ${categoria}
                </span>

                <strong>
                    ${formatarMoeda(valor)}
                </strong>

            </div>

            <div class="barra-categoria">

                <div
                    class="barra-categoria-preenchida"
                    style="width: ${percentual}%"
                ></div>

            </div>

        `;


        listaGastosCategoria.appendChild(div);

    });

}


// ============================================================
// COMPRAS NO CARTÃO
// COM DETALHAMENTO POR CATEGORIA
// ============================================================

function atualizarComprasCartao() {

    let compras = [];


    try {

        compras =
            JSON.parse(
                localStorage.getItem("compras")
            ) || [];

    } catch (erro) {

        compras = [];

    }


    const mesSelecionado =
        dataDashboard.getMonth();


    const anoSelecionado =
        dataDashboard.getFullYear();


    // --------------------------------------------------------
    // Estrutura:
    //
    // cartoes = {
    //   "Nubank • final 1234": {
    //       total: 400,
    //       categorias: {
    //           Mercado: 300,
    //           Transporte: 100
    //       }
    //   }
    // }
    // --------------------------------------------------------

    const cartoes = {};


    compras.forEach(function (compra) {

        if (
            compra.modo !== "credito"
        ) {
            return;
        }


        const dadosCartao =
            obterDadosCartao(compra);


        const nomeCartao =
            `${dadosCartao.nome} • final ${dadosCartao.final}`;


        const quantidade =
            Number(compra.parcelas || 1);


        const valores =
            calcularParcelas(
                compra.valor,
                quantidade
            );


        valores.forEach(function (
            valorParcela,
            indice
        ) {

            const numeroParcela =
                indice + 1;


            if (
                !parcelaPertenceAoMes(
                    compra,
                    numeroParcela,
                    mesSelecionado,
                    anoSelecionado
                )
            ) {
                return;
            }


            if (!cartoes[nomeCartao]) {

                cartoes[nomeCartao] = {

                    total: 0,

                    categorias: {}

                };

            }


            cartoes[nomeCartao].total +=
                valorParcela;


            const categoria =
                compra.categoria ||
                "Sem categoria";


            cartoes[nomeCartao]
                .categorias[categoria] =
                (
                    cartoes[nomeCartao]
                        .categorias[categoria] || 0
                ) + valorParcela;

        });

    });


    listaComprasCartao.innerHTML = "";


    const lista =
        Object.entries(cartoes);


    if (lista.length === 0) {

        listaComprasCartao.innerHTML =
            "<p>Nenhuma compra no cartão neste mês.</p>";

        return;

    }


    // --------------------------------------------------------
    // MAIOR TOTAL ENTRE OS CARTÕES
    // --------------------------------------------------------

    const maiorTotal =
        Math.max(
            ...lista.map(
                ([, dados]) => dados.total
            ),
            1
        );


    // --------------------------------------------------------
    // MOSTRAR CADA CARTÃO
    // --------------------------------------------------------

    lista.forEach(function (
        [nomeCartao, dados]
    ) {

        const bloco =
            document.createElement("div");


        bloco.className =
            "cartao-dashboard";


        const percentual =
            (dados.total / maiorTotal) * 100;


        bloco.innerHTML = `

            <div class="categoria-gasto-topo">

                <span>
                    ${nomeCartao}
                </span>

                <strong>
                    ${formatarMoeda(dados.total)}
                </strong>

            </div>

            <div class="barra-categoria">

                <div
                    class="barra-categoria-preenchida"
                    style="width: ${percentual}%"
                ></div>

            </div>

        `;


        // ----------------------------------------------------
        // CATEGORIAS DO CARTÃO
        // ----------------------------------------------------

        const categorias =
            document.createElement("div");


        categorias.className =
            "categorias-cartao";


        const listaCategorias =
            Object.entries(
                dados.categorias
            )
            .sort((a, b) => b[1] - a[1]);


        listaCategorias.forEach(function (
            [categoria, valor]
        ) {

            const linha =
                document.createElement("div");


            linha.className =
                "categoria-cartao-item";


            linha.innerHTML = `

                <span>
                    ${categoria}
                </span>

                <strong>
                    ${formatarMoeda(valor)}
                </strong>

            `;


            categorias.appendChild(linha);

        });


        bloco.appendChild(categorias);


        listaComprasCartao.appendChild(bloco);

    });

}


// ============================================================
// ATUALIZAR DASHBOARD
// ============================================================

function atualizarDashboard() {

    atualizarNomeMes();


    const movimentacoes =
        carregarMovimentacoes();


    const mesSelecionado =
        dataDashboard.getMonth();


    const anoSelecionado =
        dataDashboard.getFullYear();


    const movimentacoesMes =
        movimentacoes.filter(function (movimento) {

            if (!movimento.data) {
                return false;
            }


            const data =
                new Date(
                    movimento.data + "T00:00:00"
                );


            return (
                data.getMonth() === mesSelecionado &&
                data.getFullYear() === anoSelecionado
            );

        });


    // --------------------------------------------------------
    // ENTRADAS
    // --------------------------------------------------------

    const entradas =
        movimentacoesMes
            .filter(function (movimento) {

                return movimento.tipo === "entrada";

            })
            .reduce(function (total, movimento) {

                return total +
                    Number(movimento.valor || 0);

            }, 0);


    // --------------------------------------------------------
    // GASTOS
    // --------------------------------------------------------

    const gastos =
        movimentacoesMes
            .filter(function (movimento) {

                return (
                    movimento.tipo === "saida" ||
                    movimento.tipo === "saída"
                );

            })
            .reduce(function (total, movimento) {

                return total +
                    Number(movimento.valor || 0);

            }, 0);


    // --------------------------------------------------------
    // DIVIDENDOS
    // --------------------------------------------------------

    let dividendos = [];


    try {

        dividendos =
            JSON.parse(
                localStorage.getItem("dividendos")
            ) || [];

    } catch (erro) {

        dividendos = [];

    }


    const totalDividendoMes =
        dividendos
            .filter(function (dividendo) {

                const data =
                    new Date(
                        dividendo.data + "T00:00:00"
                    );


                return (
                    data.getMonth() === mesSelecionado &&
                    data.getFullYear() === anoSelecionado
                );

            })
            .reduce(function (total, dividendo) {

                return total +
                    Number(dividendo.valor || 0);

            }, 0);


    // --------------------------------------------------------
    // SALDO
    // --------------------------------------------------------

    const saldo =
        entradas - gastos;


    // --------------------------------------------------------
    // ATUALIZAR CARDS
    // --------------------------------------------------------

    saldoMes.textContent =
        formatarMoeda(saldo);


    totalEntradas.textContent =
        formatarMoeda(entradas);


    totalGastos.textContent =
        formatarMoeda(gastos);


    totalDividendos.textContent =
        formatarMoeda(totalDividendoMes);


    // --------------------------------------------------------
    // BARRAS
    // --------------------------------------------------------

    atualizarBarras(
        entradas,
        gastos
    );


    // --------------------------------------------------------
    // ÚLTIMAS MOVIMENTAÇÕES
    // --------------------------------------------------------

    atualizarUltimasMovimentacoes(
        movimentacoesMes
    );


    // --------------------------------------------------------
    // GASTOS POR CATEGORIA
    // --------------------------------------------------------

    atualizarGastosPorCategoria();


    // --------------------------------------------------------
    // COMPRAS NO CARTÃO
    // --------------------------------------------------------

    atualizarComprasCartao();

}


// ============================================================
// BOTÃO MÊS ANTERIOR
// ============================================================

mesAnterior.addEventListener(
    "click",
    function () {

        dataDashboard.setMonth(
            dataDashboard.getMonth() - 1
        );

        atualizarDashboard();

    }
);


// ============================================================
// BOTÃO PRÓXIMO MÊS
// ============================================================

mesProximo.addEventListener(
    "click",
    function () {

        dataDashboard.setMonth(
            dataDashboard.getMonth() + 1
        );

        atualizarDashboard();

    }
);


// ============================================================
// CORRIGIR LINK DA NOVA ENTRADA
// ============================================================

document.querySelectorAll(
    '[href="nova-entrada.html"]'
).forEach(function (link) {

    link.addEventListener(
        "click",
        function (evento) {

            evento.preventDefault();

            window.location.href =
                "novaEntrada.html";

        }
    );

});


// ============================================================
// INICIAR DASHBOARD
// ============================================================

atualizarDashboard();

});