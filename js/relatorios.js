document.addEventListener("DOMContentLoaded", () => {

// ============================================================
// ELEMENTOS DA TELA
// ============================================================

const nomeMes = document.getElementById("nomeMes");
const mesAnterior = document.getElementById("mesAnterior");
const mesProximo = document.getElementById("mesProximo");

const totalEntradas = document.getElementById("totalEntradas");
const totalGastos = document.getElementById("totalGastos");
const saldoMes = document.getElementById("saldoMes");
const totalDividendos = document.getElementById("totalDividendos");

const listaGastosCategoria =
    document.getElementById("listaGastosCategoria");

const listaComprasCartao =
    document.getElementById("listaComprasCartao");

const canvasGrafico =
    document.getElementById("graficoGastosCategoria");


// ============================================================
// MÊS INICIAL
// ============================================================

let dataRelatorio = new Date(2026, 8, 1);


// ============================================================
// GRÁFICO
// ============================================================

let graficoGastosCategoria = null;


// ============================================================
// FORMATAÇÃO DE MOEDA
// ============================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ============================================================
// ATUALIZA NOME DO MÊS
// ============================================================

function atualizarNomeMes() {

    const nome = dataRelatorio.toLocaleDateString("pt-BR", {
        month: "long",
        year: "numeric"
    });

    nomeMes.textContent =
        nome.charAt(0).toUpperCase() + nome.slice(1);

}


// ============================================================
// CALCULA PARCELAS
// ============================================================

function calcularParcelas(valor, quantidade) {

    const valorCentavos =
        Math.round(Number(valor || 0) * 100);

    const qtd =
        Math.max(1, Number(quantidade || 1));

    const base =
        Math.floor(valorCentavos / qtd);

    const resto =
        valorCentavos % qtd;

    const parcelas = [];

    for (let i = 0; i < qtd; i++) {

        const centavos =
            base + (i >= qtd - resto ? 1 : 0);

        parcelas.push(centavos / 100);

    }

    return parcelas;

}


// ============================================================
// DADOS DO CARTÃO
// ============================================================

function obterDadosCartao(compra) {

    const cartao = compra.cartao || "";


    if (
        cartao === "nubank" ||
        cartao === "nubank-1234"
    ) {

        return {
            nome: "Nubank • final 1234",
            fechamento: 2
        };

    }


    if (
        cartao === "mercado-pago" ||
        cartao === "mercado-pago-5678"
    ) {

        return {
            nome: "Mercado Pago • final 5678",
            fechamento: 5
        };

    }


    if (
        cartao === "caixa" ||
        cartao === "caixa-9012"
    ) {

        return {
            nome: "Caixa • final 9012",
            fechamento: 8
        };

    }


    return {
        nome: compra.nomeCartao || "Cartão",
        fechamento: 0
    };

}


// ============================================================
// PRIMEIRA FATURA
// ============================================================

function calcularPrimeiraFatura(dataCompra, fechamento) {

    const partes = dataCompra.split("-");


    if (partes.length !== 3) {
        return null;
    }


    let ano = Number(partes[0]);
    let mes = Number(partes[1]) - 1;

    const dia = Number(partes[2]);


    if (dia > fechamento) {

        mes++;

        if (mes > 11) {

            mes = 0;
            ano++;

        }

    }


    return {
        ano,
        mes
    };

}


// ============================================================
// VERIFICA SE A PARCELA PERTENCE AO MÊS
// ============================================================

function parcelaPertenceAoMes(
    compra,
    numeroParcela,
    mesSelecionado,
    anoSelecionado
) {

    if (!compra.data) {
        return false;
    }


    const dadosCartao =
        obterDadosCartao(compra);


    const primeiraFatura =
        calcularPrimeiraFatura(
            compra.data,
            dadosCartao.fechamento
        );


    if (!primeiraFatura) {
        return false;
    }


    const dataFatura =
        new Date(
            primeiraFatura.ano,
            primeiraFatura.mes + (numeroParcela - 1),
            1
        );


    return (
        dataFatura.getFullYear() === anoSelecionado &&
        dataFatura.getMonth() === mesSelecionado
    );

}


// ============================================================
// GASTOS POR CATEGORIA
// ============================================================

function obterGastosPorCategoria() {

    const movimentacoes =
        JSON.parse(
            localStorage.getItem("movimentacoesContas")
        ) || [];


    const compras =
        JSON.parse(
            localStorage.getItem("compras")
        ) || [];


    const mesSelecionado =
        dataRelatorio.getMonth();


    const anoSelecionado =
        dataRelatorio.getFullYear();


    const categorias = {};


    // --------------------------------------------------------
    // GASTOS DIRETOS
    // --------------------------------------------------------

    movimentacoes.forEach(movimentacao => {

        const tipo =
            String(movimentacao.tipo || "")
                .toLowerCase();


        if (
            tipo !== "saida" &&
            tipo !== "saída"
        ) {
            return;
        }


        // Pagamento da fatura não entra novamente
        // no relatório por categoria.

        if (movimentacao.origem === "fatura") {
            return;
        }


        if (!movimentacao.data) {
            return;
        }


        const partes =
            movimentacao.data.split("-");


        if (partes.length !== 3) {
            return;
        }


        const ano =
            Number(partes[0]);


        const mes =
            Number(partes[1]) - 1;


        if (
            ano !== anoSelecionado ||
            mes !== mesSelecionado
        ) {
            return;
        }


        const categoria =
            movimentacao.categoria ||
            "Sem categoria";


        categorias[categoria] =
            (categorias[categoria] || 0) +
            Number(movimentacao.valor || 0);

    });


    // --------------------------------------------------------
    // COMPRAS NO CRÉDITO
    // --------------------------------------------------------

    compras.forEach(compra => {

        if (compra.modo !== "credito") {
            return;
        }


        const quantidade =
            Math.max(
                1,
                Number(compra.parcelas || 1)
            );


        const valoresParcelas =
            calcularParcelas(
                compra.valor,
                quantidade
            );


        valoresParcelas.forEach(
            (valorParcela, indice) => {

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

            }
        );

    });


    return categorias;

}


// ============================================================
// DESENHA O GRÁFICO
// ============================================================

function atualizarGraficoGastosCategoria(categorias) {

    if (!canvasGrafico) {
        return;
    }


    // Se já existe um gráfico, destrói antes
    // de criar o novo.

    if (graficoGastosCategoria) {

        graficoGastosCategoria.destroy();

        graficoGastosCategoria = null;

    }


    const nomes =
        Object.keys(categorias);


    // Nenhum dado

    if (nomes.length === 0) {

        canvasGrafico.style.display = "none";

        return;

    }


    canvasGrafico.style.display = "block";


    const valores =
        nomes.map(
            categoria =>
                Number(categorias[categoria].toFixed(2))
        );


    graficoGastosCategoria =
        new Chart(
            canvasGrafico,
            {
                type: "bar",

                data: {

                    labels: nomes,

                    datasets: [
                        {
                            label: "Gastos",

                            data: valores,

                            borderWidth: 1
                        }
                    ]

                },

                options: {

                    responsive: true,

                    maintainAspectRatio: false,

                    plugins: {

                        legend: {
                            display: false
                        },

                        tooltip: {

                            callbacks: {

                                label: function(context) {

                                    return (
                                        " " +
                                        formatarMoeda(
                                            context.raw
                                        )
                                    );

                                }

                            }

                        }

                    },

                    scales: {

                        y: {

                            beginAtZero: true,

                            ticks: {

                                callback: function(value) {

                                    return formatarMoeda(
                                        value
                                    );

                                }

                            }

                        }

                    }

                }

            }
        );

}


// ============================================================
// EXIBE GASTOS POR CATEGORIA
// ============================================================

function atualizarGastosPorCategoria() {

    const categorias =
        obterGastosPorCategoria();


    // Atualiza o gráfico

    atualizarGraficoGastosCategoria(
        categorias
    );


    // Limpa a lista

    listaGastosCategoria.innerHTML = "";


    const nomesCategorias =
        Object.keys(categorias);


    if (nomesCategorias.length === 0) {

        listaGastosCategoria.innerHTML = `

            <div class="relatorio-vazio">

                Nenhum gasto registrado neste mês.

            </div>

        `;

        return;

    }


    const total =
        Object.values(categorias)
            .reduce(
                (soma, valor) =>
                    soma + valor,
                0
            );


    nomesCategorias
        .sort(
            (a, b) =>
                categorias[b] -
                categorias[a]
        )
        .forEach(categoria => {

            const valor =
                categorias[categoria];


            const percentual =
                total > 0
                    ? (valor / total) * 100
                    : 0;


            const item =
                document.createElement("div");


            item.className =
                "categoria-gasto";


            item.innerHTML = `

                <div class="categoria-gasto-header">

                    <span class="categoria-gasto-nome">

                        ${categoria}

                    </span>


                    <span class="categoria-gasto-valor">

                        ${formatarMoeda(valor)}

                    </span>

                </div>


                <div class="categoria-gasto-barra">

                    <div
                        class="categoria-gasto-progresso"
                        style="width: ${percentual}%;">
                    </div>

                </div>

            `;


            listaGastosCategoria.appendChild(item);

        });

}


// ============================================================
// COMPRAS NO CARTÃO
// ============================================================

function atualizarComprasCartao() {

    const compras =
        JSON.parse(
            localStorage.getItem("compras")
        ) || [];


    const mesSelecionado =
        dataRelatorio.getMonth();


    const anoSelecionado =
        dataRelatorio.getFullYear();


    const cartoes = {};


    compras.forEach(compra => {

        if (compra.modo !== "credito") {
            return;
        }


        const dadosCartao =
            obterDadosCartao(compra);


        const quantidade =
            Math.max(
                1,
                Number(compra.parcelas || 1)
            );


        const valoresParcelas =
            calcularParcelas(
                compra.valor,
                quantidade
            );


        valoresParcelas.forEach(
            (valorParcela, indice) => {

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


                const nomeCartao =
                    dadosCartao.nome;


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

            }
        );

    });


    listaComprasCartao.innerHTML = "";


    const nomesCartoes =
        Object.keys(cartoes);


    if (nomesCartoes.length === 0) {

        listaComprasCartao.innerHTML = `

            <div class="relatorio-vazio">

                Nenhuma compra no cartão neste mês.

            </div>

        `;

        return;

    }


    nomesCartoes.forEach(nomeCartao => {

        const dados =
            cartoes[nomeCartao];


        const cartao =
            document.createElement("div");


        cartao.className =
            "cartao-dashboard";


        let categoriasHTML = "";


        Object.keys(dados.categorias)
            .sort(
                (a, b) =>
                    dados.categorias[b] -
                    dados.categorias[a]
            )
            .forEach(categoria => {

                categoriasHTML += `

                    <div class="categoria-cartao-item">

                        <span>
                            ${categoria}
                        </span>

                        <span>
                            ${formatarMoeda(
                                dados.categorias[categoria]
                            )}
                        </span>

                    </div>

                `;

            });


        cartao.innerHTML = `

            <div class="cartao-dashboard-header">

                <span class="cartao-dashboard-nome">

                    ${nomeCartao}

                </span>


                <span class="cartao-dashboard-total">

                    ${formatarMoeda(dados.total)}

                </span>

            </div>


            <div class="categorias-cartao">

                ${categoriasHTML}

            </div>

        `;


        listaComprasCartao.appendChild(
            cartao
        );

    });

}


// ============================================================
// RESUMO DO MÊS
// ============================================================

function atualizarResumo() {

    const movimentacoes =
        JSON.parse(
            localStorage.getItem("movimentacoesContas")
        ) || [];


    const dividendos =
        JSON.parse(
            localStorage.getItem("dividendos")
        ) || [];


    const mesSelecionado =
        dataRelatorio.getMonth();


    const anoSelecionado =
        dataRelatorio.getFullYear();


    let entradas = 0;
    let gastos = 0;
    let valorDividendos = 0;


    // --------------------------------------------------------
    // MOVIMENTAÇÕES
    // --------------------------------------------------------

    movimentacoes.forEach(movimentacao => {

        if (!movimentacao.data) {
            return;
        }


        const partes =
            movimentacao.data.split("-");


        if (partes.length !== 3) {
            return;
        }


        const ano =
            Number(partes[0]);


        const mes =
            Number(partes[1]) - 1;


        if (
            ano !== anoSelecionado ||
            mes !== mesSelecionado
        ) {
            return;
        }


        const tipo =
            String(movimentacao.tipo || "")
                .toLowerCase();


        const valor =
            Number(movimentacao.valor || 0);


        if (tipo === "entrada") {

            entradas += valor;

        }


        if (
            tipo === "saida" ||
            tipo === "saída"
        ) {

            gastos += valor;

        }

    });


    // --------------------------------------------------------
    // DIVIDENDOS
    // --------------------------------------------------------

    dividendos.forEach(dividendo => {

        if (!dividendo.data) {
            return;
        }


        const partes =
            dividendo.data.split("-");


        if (partes.length !== 3) {
            return;
        }


        const ano =
            Number(partes[0]);


        const mes =
            Number(partes[1]) - 1;


        if (
            ano === anoSelecionado &&
            mes === mesSelecionado
        ) {

            valorDividendos +=
                Number(dividendo.valor || 0);

        }

    });


    const saldo =
        entradas - gastos;


    totalEntradas.textContent =
        formatarMoeda(entradas);


    totalGastos.textContent =
        formatarMoeda(gastos);


    saldoMes.textContent =
        formatarMoeda(saldo);


    totalDividendos.textContent =
        formatarMoeda(valorDividendos);

}


// ============================================================
// ATUALIZA TUDO
// ============================================================

function atualizarRelatorio() {

    atualizarNomeMes();

    atualizarResumo();

    atualizarGastosPorCategoria();

    atualizarComprasCartao();

}


// ============================================================
// MÊS ANTERIOR
// ============================================================

mesAnterior.addEventListener("click", () => {

    dataRelatorio.setMonth(
        dataRelatorio.getMonth() - 1
    );

    atualizarRelatorio();

});


// ============================================================
// PRÓXIMO MÊS
// ============================================================

mesProximo.addEventListener("click", () => {

    dataRelatorio.setMonth(
        dataRelatorio.getMonth() + 1
    );

    atualizarRelatorio();

});


// ============================================================
// INICIALIZAÇÃO
// ============================================================

atualizarRelatorio();

});