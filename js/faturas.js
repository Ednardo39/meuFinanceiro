document.addEventListener("DOMContentLoaded", function () {

// ==============================
// ELEMENTOS DA TELA
// ==============================

const cartao = document.querySelector("#cartao");

const mes = document.querySelector("#mes");

const tituloFatura =
    document.querySelector("#tituloFatura");

const nomeCartao =
    document.querySelector("#nomeCartao");

const fechamento =
    document.querySelector("#fechamento");

const vencimento =
    document.querySelector("#vencimento");

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

const statusFatura =
    document.querySelector("#statusFatura");


// ==============================
// DADOS DO PAGAMENTO
// ==============================

const dadosPagamento =
    document.querySelector("#dadosPagamento");

const contaPagamentoInfo =
    document.querySelector("#contaPagamentoInfo");

const dataPagamentoInfo =
    document.querySelector("#dataPagamentoInfo");

const valorPagamentoInfo =
    document.querySelector("#valorPagamentoInfo");


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
// LER COMPRAS DO LOCALSTORAGE
// ==============================

function obterCompras() {

    const comprasSalvas =
        localStorage.getItem("compras");


    if (!comprasSalvas) {

        return [];
    }


    try {

        const compras =
            JSON.parse(comprasSalvas);


        if (Array.isArray(compras)) {

            return compras;
        }


        return [];

    } catch (erro) {

        console.error(
            "Erro ao ler as compras:",
            erro
        );

        return [];
    }
}


// ==============================
// LER PAGAMENTOS DAS FATURAS
// ==============================

function obterPagamentosFaturas() {

    const pagamentosSalvos =
        localStorage.getItem(
            "pagamentosFaturas"
        );


    if (!pagamentosSalvos) {

        return [];
    }


    try {

        const pagamentos =
            JSON.parse(
                pagamentosSalvos
            );


        if (Array.isArray(pagamentos)) {

            return pagamentos;
        }


        return [];

    } catch (erro) {

        console.error(
            "Erro ao ler os pagamentos das faturas:",
            erro
        );

        return [];
    }
}


// ==============================
// VERIFICAR SE A FATURA FOI PAGA
// ==============================

function faturaFoiPaga() {

    const pagamentos =
        obterPagamentosFaturas();


    return pagamentos.some(
        function (pagamento) {

            return (

                pagamento.cartao ===
                cartao.value

                &&

                pagamento.mes ===
                mes.value
            );
        }
    );
}


// ==============================
// VERIFICAR DUPLICIDADE DA SAÍDA
// ==============================

function movimentacaoFaturaJaExiste() {

    const movimentacoesSalvas =
        localStorage.getItem(
            "movimentacoesContas"
        );


    if (!movimentacoesSalvas) {

        return false;
    }


    try {

        const movimentacoes =
            JSON.parse(
                movimentacoesSalvas
            );


        if (!Array.isArray(movimentacoes)) {

            return false;
        }


        return movimentacoes.some(
            function (movimentacao) {

                return (

                    movimentacao.origem ===
                    "fatura"

                    &&

                    movimentacao.cartao ===
                    cartao.value

                    &&

                    movimentacao.mesFatura ===
                    mes.value
                );
            }
        );

    } catch (erro) {

        console.error(
            "Erro ao verificar movimentações:",
            erro
        );

        return false;
    }
}


// ==============================
// MOSTRAR DADOS DO PAGAMENTO
// ==============================

function atualizarDadosPagamento() {

    const pagamentos =
        obterPagamentosFaturas();


    const pagamento =
        pagamentos.find(
            function (pagamento) {

                return (

                    pagamento.cartao ===
                    cartao.value

                    &&

                    pagamento.mes ===
                    mes.value
                );
            }
        );


    // Se não encontrou pagamento

    if (!pagamento) {

        dadosPagamento.style.display =
            "none";

        return;
    }


    // Mostrar bloco

    dadosPagamento.style.display =
        "block";


    // ==============================
    // CONTA UTILIZADA
    // ==============================

    const nomesContas = {

        nubank:
            "Nubank",

        "mercado-pago":
            "Mercado Pago",

        caixa:
            "Caixa",

        dinheiro:
            "Dinheiro em espécie"
    };


    contaPagamentoInfo.textContent =

        nomesContas[
            pagamento.contaPagamento
        ]

        ||

        pagamento.contaPagamento;


    // ==============================
    // DATA DO PAGAMENTO
    // ==============================

    if (
        pagamento.dataPagamento
    ) {

        dataPagamentoInfo.textContent =

            formatarData(
                pagamento.dataPagamento
            );
    }


    // ==============================
    // VALOR PAGO
    // ==============================

    valorPagamentoInfo.textContent =

        formatarMoeda(
            Number(pagamento.valor) || 0
        );
}


// ==============================
// ATUALIZAR STATUS DA FATURA
// ==============================

function atualizarStatusFatura() {

    if (faturaFoiPaga()) {

        statusFatura.textContent =
            "Paga";


        statusFatura.classList.remove(
            "aberta"
        );


        statusFatura.classList.add(
            "paga"
        );


        btnPagar.textContent =
            "Fatura paga";


        btnPagar.disabled =
            true;

    } else {

        statusFatura.textContent =
            "Aberta";


        statusFatura.classList.remove(
            "paga"
        );


        statusFatura.classList.add(
            "aberta"
        );


        btnPagar.textContent =
            "Pagar fatura";


        btnPagar.disabled =
            false;
    }


    // Atualiza informações do pagamento

    atualizarDadosPagamento();
}


// ==============================
// FORMATAR MOEDA
// ==============================

function formatarMoeda(valor) {

    return valor.toLocaleString(

        "pt-BR",

        {

            style: "currency",

            currency: "BRL"
        }
    );
}


// ==============================
// FORMATAR DATA
// ==============================

function formatarData(data) {

    const partes =
        data.split("-");


    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}


// ==============================
// NOMES DOS MESES
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


    /*
     * Se a compra ocorreu depois
     * do fechamento, vai para a
     * fatura do mês seguinte.
     */

    if (
        dia > diaFechamento
    ) {

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
// CALCULAR VALOR DAS PARCELAS
// ==============================

function calcularParcelas(

    valorTotal,

    quantidade

) {

    /*
     * Trabalhamos em centavos para
     * evitar problemas de arredondamento.
     */

    const valorTotalCentavos =

        Math.round(
            valorTotal * 100
        );


    const valorBaseCentavos =

        Math.floor(

            valorTotalCentavos /
            quantidade
        );


    const restoCentavos =

        valorTotalCentavos %
        quantidade;


    const parcelas = [];


    for (

        let i = 0;

        i < quantidade;

        i++

    ) {

        let valorParcelaCentavos =

            valorBaseCentavos;


        if (

            i >=
            quantidade - restoCentavos

        ) {

            valorParcelaCentavos++;
        }


        parcelas.push(

            valorParcelaCentavos / 100
        );
    }


    return parcelas;
}


// ==============================
// ATUALIZAR FATURA
// ==============================

function atualizarFatura() {

    const dadosCartao =
        cartoes[cartao.value];


    if (

        !dadosCartao ||

        !mes.value

    ) {

        return;
    }


    // ==============================
    // MÊS SELECIONADO
    // ==============================

    const partesMes =
        mes.value.split("-");


    const ano =
        parseInt(partesMes[0]);


    const numeroMes =
        parseInt(partesMes[1]);


    const mesFatura =
        numeroMes - 1;


    const nomeMes =
        nomesMeses[mesFatura];


    // ==============================
    // CABEÇALHO
    // ==============================

    tituloFatura.textContent =
        `${nomeMes}/${ano}`;


    nomeCartao.textContent =
        `${dadosCartao.nome} •••• ${dadosCartao.final}`;


    // ==============================
    // FECHAMENTO
    // ==============================

    const dataFechamento =

        new Date(

            ano,

            mesFatura,

            dadosCartao.fechamento
        );


    fechamento.textContent =

        dataFechamento.toLocaleDateString(
            "pt-BR"
        );


    // ==============================
    // VENCIMENTO
    // ==============================

    const dataVencimento =

        new Date(

            ano,

            mesFatura,

            dadosCartao.vencimento
        );


    vencimento.textContent =

        dataVencimento.toLocaleDateString(
            "pt-BR"
        );


    // ==============================
    // LER COMPRAS SALVAS
    // ==============================

    const compras =
        obterCompras();


    // ==============================
    // ENCONTRAR COMPRAS DA FATURA
    // ==============================

    const comprasDaFatura = [];


    compras.forEach(
        function (compra) {

            let cartaoCompra =
                compra.cartao;


            // Compatibilidade com compras antigas

            if (

                cartaoCompra ===
                "nubank-1234"

            ) {

                cartaoCompra =
                    "nubank";
            }


            if (

                cartaoCompra ===
                "mercado-pago-5678"

            ) {

                cartaoCompra =
                    "mercado-pago";
            }


            if (

                cartaoCompra ===
                "caixa-9012"

            ) {

                cartaoCompra =
                    "caixa";
            }


            if (

                cartaoCompra !==
                cartao.value

            ) {

                return;
            }


            if (

                compra.modo !==
                "credito"

            ) {

                return;
            }


            // Dados da compra

            const valorTotal =
                Number(compra.valor) || 0;


            const quantidadeParcelas =
                Number(compra.parcelas) || 1;


            // Descobre a primeira fatura

            const primeiraFatura =

                calcularPrimeiraFatura(

                    compra.data,

                    dadosCartao.fechamento
                );


            // Calcula as parcelas

            const valoresParcelas =

                calcularParcelas(

                    valorTotal,

                    quantidadeParcelas
                );


            // Verifica cada parcela

            for (

                let numeroParcela = 1;

                numeroParcela <=
                quantidadeParcelas;

                numeroParcela++

            ) {

                let mesParcela =

                    primeiraFatura.mes +

                    numeroParcela -

                    1;


                let anoParcela =

                    primeiraFatura.ano;


                // Passou de dezembro?

                while (

                    mesParcela > 11

                ) {

                    mesParcela -= 12;

                    anoParcela++;
                }


                // Parcela pertence à fatura?

                if (

                    anoParcela === ano &&

                    mesParcela === mesFatura

                ) {

                    comprasDaFatura.push({

                        data:
                            compra.data,

                        descricao:
                            compra.descricao,

                        categoria:
                            compra.categoria,

                        parcela:
                            `${numeroParcela}/${quantidadeParcelas}`,

                        valor:
                            valoresParcelas[
                                numeroParcela - 1
                            ]
                    });
                }
            }
        }
    );


    // ==============================
    // LIMPAR TABELA
    // ==============================

    listaCompras.innerHTML =
        "";


    // ==============================
    // TOTAL DA FATURA
    // ==============================

    let totalCentavos = 0;


    // ==============================
    // ADICIONAR COMPRAS
    // ==============================

    comprasDaFatura.forEach(

        function (compra) {

            totalCentavos +=

                Math.round(
                    compra.valor * 100
                );


            const linha =
                document.createElement("tr");


            linha.innerHTML = `

                <td>
                    ${formatarData(
                        compra.data
                    )}
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
                    ${formatarMoeda(
                        compra.valor
                    )}
                </td>

            `;


            listaCompras.appendChild(
                linha
            );
        }
    );


    // ==============================
    // NENHUMA COMPRA
    // ==============================

    if (

        comprasDaFatura.length === 0

    ) {

        const linha =
            document.createElement("tr");


        linha.innerHTML = `

            <td
                colspan="5"
                style="text-align:center;"
            >
                Nenhuma compra nesta fatura.
            </td>

        `;


        listaCompras.appendChild(
            linha
        );
    }


    // ==============================
    // TOTAL DA FATURA
    // ==============================

    const total =
        totalCentavos / 100;


    totalFatura.textContent =
        formatarMoeda(total);


    valorPagamento.textContent =
        formatarMoeda(total);


    quantidadeCompras.textContent =
        comprasDaFatura.length;


    // ==============================
    // ATUALIZAR STATUS
    // ==============================

    atualizarStatusFatura();
}


// ==============================
// EVENTO CARTÃO
// ==============================

cartao.addEventListener(
    "change",
    atualizarFatura
);


// ==============================
// EVENTO MÊS
// ==============================

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


        // ==============================
        // VERIFICAR SE A FATURA JÁ FOI PAGA
        // ==============================

        if (faturaFoiPaga()) {

            alert(
                "Esta fatura já foi paga."
            );

            return;
        }


        // ==============================
        // VERIFICAR DUPLICIDADE DA SAÍDA
        // ==============================

        if (
            movimentacaoFaturaJaExiste()
        ) {

            alert(
                "A saída referente a esta fatura já foi registrada."
            );

            return;
        }


        // ==============================
        // VERIFICAR CONTA
        // ==============================

        if (!conta.value) {

            alert(
                "Selecione a conta que será utilizada para pagar a fatura."
            );

            conta.focus();

            return;
        }


        // ==============================
        // DADOS DO CARTÃO
        // ==============================

        const dadosCartao =
            cartoes[cartao.value];


        // ==============================
        // VALOR ATUAL DA FATURA
        // ==============================

        const valorTexto =
            totalFatura.textContent;


        const valorNumerico =

            Number(

                valorTexto

                    .replace("R$", "")

                    .replace(/\./g, "")

                    .replace(",", ".")

                    .trim()

            );


        // ==============================
        // CRIAR REGISTRO DO PAGAMENTO
        // ==============================

        const pagamento = {

            id:
                Date.now(),

            cartao:
                cartao.value,

            nomeCartao:
                `${dadosCartao.nome} •••• ${dadosCartao.final}`,

            mes:
                mes.value,

            valor:
                valorNumerico,

            contaPagamento:
                conta.value,

            dataPagamento:

                new Date()
                    .toISOString()
                    .split("T")[0]
        };


        // ==============================
        // RECUPERAR PAGAMENTOS
        // ==============================

        let pagamentos =
            obterPagamentosFaturas();


        // ==============================
        // ADICIONAR PAGAMENTO
        // ==============================

        pagamentos.push(
            pagamento
        );


        // ==============================
        // SALVAR PAGAMENTO
        // ==============================

        localStorage.setItem(

            "pagamentosFaturas",

            JSON.stringify(
                pagamentos
            )
        );


        // ==============================
        // REGISTRAR SAÍDA DA CONTA
        // ==============================

        let movimentacoes =

            JSON.parse(

                localStorage.getItem(
                    "movimentacoesContas"
                )

            ) || [];


        movimentacoes.push({

            id:
                Date.now(),

            tipo:
                "saida",

            descricao:
                `Pagamento de fatura - ${dadosCartao.nome}`,

            valor:
                valorNumerico,

            conta:
                conta.value,

            data:
                pagamento.dataPagamento,

            origem:
                "fatura",

            cartao:
                cartao.value,

            mesFatura:
                mes.value
        });


        // ==============================
        // SALVAR MOVIMENTAÇÃO
        // ==============================

        localStorage.setItem(

            "movimentacoesContas",

            JSON.stringify(
                movimentacoes
            )
        );


        // ==============================
        // ATUALIZAR A TELA
        // ==============================

        atualizarStatusFatura();


        // ==============================
        // MENSAGEM DE SUCESSO
        // ==============================

        alert(
            "Pagamento da fatura registrado com sucesso!"
        );

    }
);


// ==============================
// CARREGAR FATURA INICIAL
// ==============================

atualizarFatura();

});