document.addEventListener("DOMContentLoaded", function () {

// =========================================================
// ELEMENTOS DO FORMULÁRIO
// =========================================================

const formulario = document.querySelector("#formulario");

const descricao = document.querySelector("#descricao");
const categoria = document.querySelector("#categoria");
const valor = document.querySelector("#valor");
const data = document.querySelector("#data");
const modo = document.querySelector("#modo");
const origem = document.querySelector("#origem");

const grupoCartao = document.querySelector("#grupoCartao");
const cartao = document.querySelector("#cartao");

const grupoParcelas = document.querySelector("#grupoParcelas");
const parcelas = document.querySelector("#parcelas");
const valorParcela = document.querySelector("#valorParcela");

const grupoFatura = document.querySelector("#grupoFatura");
const resumoFatura = document.querySelector("#resumoFatura");


// =========================================================
// CARREGAR CATEGORIAS
// =========================================================

function carregarCategorias() {

    if (!categoria) {
        return;
    }

    let categoriasSalvas = [];

    try {

        categoriasSalvas =
            JSON.parse(
                localStorage.getItem("categorias")
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar categorias:",
            erro
        );

        categoriasSalvas = [];
    }


    categoria.innerHTML = "";


    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent =
        "Selecione uma categoria";

    categoria.appendChild(
        opcaoInicial
    );


    const categoriasSaida =
        categoriasSalvas.filter(function (item) {

            return (
                item.tipo === "saida" ||
                item.tipo === "ambos"
            );

        });


    if (categoriasSaida.length === 0) {

        const opcaoVazia =
            document.createElement("option");

        opcaoVazia.value = "";
        opcaoVazia.textContent =
            "Nenhuma categoria de saída cadastrada";

        opcaoVazia.disabled = true;

        categoria.appendChild(
            opcaoVazia
        );

        return;
    }


    categoriasSaida.forEach(function (item) {

        const opcao =
            document.createElement("option");

        opcao.value = item.nome;
        opcao.textContent = item.nome;

        categoria.appendChild(
            opcao
        );

    });

}


// =========================================================
// CARREGAR CONTAS CADASTRADAS
// =========================================================

function carregarContas() {

    if (!origem) {
        return;
    }

    let contas = [];

    try {

        contas =
            JSON.parse(
                localStorage.getItem(
                    "contasFinanceiras"
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar contas:",
            erro
        );

        contas = [];
    }


    // Limpar opções existentes
    origem.innerHTML = "";


    // Opção inicial
    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent =
        "Selecione a conta de origem";

    origem.appendChild(
        opcaoInicial
    );


    // Somente contas ativas
    const contasAtivas =
        contas.filter(function (item) {

            return (
                !item.status ||
                item.status === "Ativa"
            );

        });


    // Nenhuma conta cadastrada
    if (contasAtivas.length === 0) {

        const opcaoVazia =
            document.createElement("option");

        opcaoVazia.value = "";
        opcaoVazia.textContent =
            "Nenhuma conta cadastrada";

        opcaoVazia.disabled = true;

        origem.appendChild(
            opcaoVazia
        );

        return;
    }


    // Adicionar contas ao SELECT
    contasAtivas.forEach(function (item) {

        const opcao =
            document.createElement("option");

        /*
         * IMPORTANTE:
         *
         * O value será o ID da conta.
         * Assim a movimentação fica ligada
         * diretamente à conta cadastrada.
         */

        opcao.value =
            String(item.id);

        opcao.textContent =
            item.nome +
            " - " +
            item.instituicao;

        origem.appendChild(
            opcao
        );

    });

}


// =========================================================
// CARREGAR DADOS INICIAIS
// =========================================================

carregarCategorias();

carregarContas();


// =========================================================
// DATA ATUAL
// =========================================================

const hoje = new Date();

const anoAtual =
    hoje.getFullYear();

const mesAtual =
    String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

const diaAtual =
    String(
        hoje.getDate()
    ).padStart(2, "0");


if (data) {

    data.value =
        anoAtual +
        "-" +
        mesAtual +
        "-" +
        diaAtual;

}


// =========================================================
// MOSTRAR / ESCONDER CARTÃO
// =========================================================

modo.addEventListener(
    "change",
    function () {

        if (modo.value === "credito") {

            grupoCartao.style.display =
                "block";

            grupoParcelas.style.display =
                "block";

        } else {

            grupoCartao.style.display =
                "none";

            grupoParcelas.style.display =
                "none";


            if (grupoFatura) {

                grupoFatura.style.display =
                    "none";

            }


            cartao.value = "";

            parcelas.value = "1";

            valorParcela.value = "";

            resumoFatura.innerHTML = "";

        }

    }
);


// =========================================================
// CONVERTER VALOR BRASILEIRO
// =========================================================

function converterValor(valorTexto) {

    if (!valorTexto) {
        return 0;
    }

    let valorLimpo =
        valorTexto
            .replace("R$", "")
            .replace(/\s/g, "")
            .replace(/\./g, "")
            .replace(",", ".");

    return parseFloat(valorLimpo) || 0;

}


// =========================================================
// FORMATAR VALOR
// =========================================================

function formatarMoeda(valorNumerico) {

    return valorNumerico.toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =========================================================
// FORMATAR CAMPO VALOR
// =========================================================

valor.addEventListener(
    "input",
    function () {

        let numero =
            valor.value.replace(/\D/g, "");


        if (numero === "") {

            valor.value = "";

            calcularParcela();

            return;

        }


        numero =
            parseInt(numero, 10) / 100;


        valor.value =
            numero.toLocaleString(
                "pt-BR",
                {
                    style: "currency",
                    currency: "BRL"
                }
            );


        calcularParcela();

    }
);


valor.addEventListener(
    "focus",
    function () {

        if (valor.value === "R$ 0,00") {

            valor.value = "";

        }

    }
);


// =========================================================
// CALCULAR PARCELA
// =========================================================

function calcularParcela() {

    if (
        modo.value !== "credito" ||
        !valor.value ||
        !parcelas.value
    ) {

        valorParcela.value = "";

        return;

    }


    const valorTotal =
        converterValor(valor.value);

    const quantidade =
        parseInt(parcelas.value);


    if (
        valorTotal <= 0 ||
        quantidade <= 0
    ) {

        valorParcela.value = "";

        return;

    }


    const valorDaParcela =
        valorTotal / quantidade;


    valorParcela.value =
        "Valor aproximado de cada parcela: " +
        formatarMoeda(
            valorDaParcela
        );


    calcularFatura();

}


parcelas.addEventListener(
    "change",
    function () {

        calcularParcela();

    }
);


// =========================================================
// NOMES DOS MESES
// =========================================================

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


// =========================================================
// CALCULAR PRIMEIRA FATURA
// =========================================================

function calcularPrimeiraFatura(
    dataCompra,
    diaFechamento
) {

    let ano =
        dataCompra.getFullYear();

    let mes =
        dataCompra.getMonth();

    const diaCompra =
        dataCompra.getDate();


    /*
     * Se a compra acontecer depois do fechamento,
     * ela vai para a próxima fatura.
     */

    if (diaCompra > diaFechamento) {

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


// =========================================================
// CALCULAR FATURA
// =========================================================

function calcularFatura() {

    if (
        modo.value !== "credito" ||
        !cartao.value ||
        !data.value ||
        !valor.value ||
        !parcelas.value
    ) {

        if (grupoFatura) {

            grupoFatura.style.display =
                "none";

        }

        return;

    }


    const opcaoCartao =
        cartao.options[
            cartao.selectedIndex
        ];


    const diaFechamento =
        parseInt(
            opcaoCartao.dataset.fechamento
        );


    const diaVencimento =
        parseInt(
            opcaoCartao.dataset.vencimento
        );


    if (
        !diaFechamento ||
        !diaVencimento
    ) {

        return;

    }


    // =====================================================
    // CRIAR DATA DA COMPRA
    // =====================================================

    const partesData =
        data.value.split("-");


    const anoCompra =
        parseInt(
            partesData[0]
        );


    const mesCompra =
        parseInt(
            partesData[1]
        ) - 1;


    const diaCompra =
        parseInt(
            partesData[2]
        );


    const dataCompra =
        new Date(
            anoCompra,
            mesCompra,
            diaCompra
        );


    const primeiraFatura =
        calcularPrimeiraFatura(
            dataCompra,
            diaFechamento
        );


    const quantidadeParcelas =
        parseInt(
            parcelas.value
        );


    const valorTotal =
        converterValor(
            valor.value
        );


    const valorDaParcela =
        valorTotal /
        quantidadeParcelas;


    // =====================================================
    // MONTAR RESUMO
    // =====================================================

    let html = "";


    html +=
        "<strong>Resumo da fatura</strong>";


    html += `
        <div class="resumo-fatura-info">

            <p>
                Fechamento:
                <strong>dia ${diaFechamento}</strong>
            </p>

            <p>
                Vencimento:
                <strong>dia ${diaVencimento}</strong>
            </p>

        </div>
    `;


    html +=
        "<div class='lista-parcelas'>";


    for (
        let i = 0;
        i < quantidadeParcelas;
        i++
    ) {

        let mes =
            primeiraFatura.mes + i;


        let ano =
            primeiraFatura.ano;


        while (mes > 11) {

            mes -= 12;
            ano++;

        }


        const numeroParcela =
            i + 1;


        html += `
            <div class="linha-parcela">

                <span>
                    ${numeroParcela}/${quantidadeParcelas}
                </span>

                <span>
                    ${nomesMeses[mes]}/${ano}
                </span>

                <strong>
                    ${formatarMoeda(
                        valorDaParcela
                    )}
                </strong>

            </div>
        `;

    }


    html +=
        "</div>";


    resumoFatura.innerHTML =
        html;

    grupoFatura.style.display =
        "block";

}


// =========================================================
// QUANDO TROCAR O CARTÃO
// =========================================================

cartao.addEventListener(
    "change",
    function () {

        calcularFatura();

    }
);


// =========================================================
// QUANDO ALTERAR A DATA
// =========================================================

data.addEventListener(
    "change",
    function () {

        calcularFatura();

    }
);


// =========================================================
// SALVAR COMPRA
// =========================================================

function salvarCompra() {

    const valorNumerico =
        converterValor(
            valor.value
        );


    const opcaoCartao =
        cartao.options[
            cartao.selectedIndex
        ];


    const compra = {

        id:
            Date.now(),

        descricao:
            descricao.value.trim(),

        categoria:
            categoria.value,

        valor:
            valorNumerico,

        data:
            data.value,

        modo:
            modo.value,

        origem:
            origem.value,

        cartao:
            modo.value === "credito"
                ? cartao.value
                : "",

        nomeCartao:
            modo.value === "credito"
                ? opcaoCartao.textContent
                : "",

        parcelas:
            modo.value === "credito"
                ? parseInt(
                    parcelas.value
                )
                : 1

    };


    // =====================================================
    // RECUPERAR COMPRAS EXISTENTES
    // =====================================================

    let comprasSalvas = [];


    try {

        comprasSalvas =
            JSON.parse(
                localStorage.getItem(
                    "compras"
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar compras:",
            erro
        );

        comprasSalvas = [];

    }


    // =====================================================
    // ADICIONAR COMPRA
    // =====================================================

    comprasSalvas.push(
        compra
    );


    // =====================================================
    // SALVAR COMPRAS
    // =====================================================

    localStorage.setItem(
        "compras",
        JSON.stringify(
            comprasSalvas
        )
    );

}


// =========================================================
// SALVAR MOVIMENTAÇÃO DA CONTA
// =========================================================

function salvarMovimentacaoConta(
    valorNumerico
) {

    /*
     * Crédito não sai da conta neste momento.
     *
     * A saída será registrada somente quando
     * a fatura for paga.
     */

    if (modo.value === "credito") {

        return;

    }


    let movimentacoes = [];


    try {

        movimentacoes =
            JSON.parse(
                localStorage.getItem(
                    "movimentacoesContas"
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar movimentações:",
            erro
        );

        movimentacoes = [];

    }


    const movimentacao = {

        id:
            Date.now(),

        tipo:
            "saida",

        descricao:
            descricao.value.trim(),

        categoria:
            categoria.value,

        valor:
            valorNumerico,

        data:
            data.value,

        modo:
            modo.value,

        /*
         * IMPORTANTE:
         *
         * Aqui agora fica o ID da conta
         * cadastrada em Contas e Cartões.
         */

        conta:
            String(origem.value),

        origem:
            "saida"

    };


    movimentacoes.push(
        movimentacao
    );


    localStorage.setItem(
        "movimentacoesContas",
        JSON.stringify(
            movimentacoes
        )
    );

}


// =========================================================
// VALIDAÇÃO DO FORMULÁRIO
// =========================================================

formulario.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const valorNumerico =
            converterValor(
                valor.value
            );


        // -------------------------------------------------
        // DESCRIÇÃO
        // -------------------------------------------------

        if (!descricao.value.trim()) {

            alert(
                "Informe a descrição do gasto."
            );

            descricao.focus();

            return;

        }


        // -------------------------------------------------
        // CATEGORIA
        // -------------------------------------------------

        if (!categoria.value) {

            alert(
                "Selecione uma categoria."
            );

            categoria.focus();

            return;

        }


        // -------------------------------------------------
        // VALOR
        // -------------------------------------------------

        if (valorNumerico <= 0) {

            alert(
                "Informe um valor válido."
            );

            valor.focus();

            return;

        }


        // -------------------------------------------------
        // DATA
        // -------------------------------------------------

        if (!data.value) {

            alert(
                "Informe a data."
            );

            data.focus();

            return;

        }


        // -------------------------------------------------
        // MODO
        // -------------------------------------------------

        if (!modo.value) {

            alert(
                "Selecione o modo da operação."
            );

            modo.focus();

            return;

        }


        // -------------------------------------------------
        // ORIGEM
        // -------------------------------------------------

        if (!origem.value) {

            alert(
                "Selecione a conta de origem."
            );

            origem.focus();

            return;

        }


        // -------------------------------------------------
        // CARTÃO DE CRÉDITO
        // -------------------------------------------------

        if (modo.value === "credito") {

            if (!cartao.value) {

                alert(
                    "Selecione o cartão."
                );

                cartao.focus();

                return;

            }


            if (!parcelas.value) {

                alert(
                    "Selecione a quantidade de parcelas."
                );

                parcelas.focus();

                return;

            }

        }


        // =================================================
        // SALVAR A COMPRA
        // =================================================

        salvarCompra();


        // =================================================
        // SALVAR MOVIMENTAÇÃO DA CONTA
        // =================================================

        salvarMovimentacaoConta(
            valorNumerico
        );


        // =================================================
        // MENSAGEM
        // =================================================

        alert(
            "Saída registrada com sucesso!"
        );


        // =================================================
        // LIMPAR FORMULÁRIO
        // =================================================

        formulario.reset();


        grupoCartao.style.display =
            "none";

        grupoParcelas.style.display =
            "none";


        if (grupoFatura) {

            grupoFatura.style.display =
                "none";

        }


        valorParcela.value = "";

        resumoFatura.innerHTML = "";


        data.value =
            anoAtual +
            "-" +
            mesAtual +
            "-" +
            diaAtual;


        // Recarregar categorias
        carregarCategorias();

        // Recarregar contas
        carregarContas();

    }

);

});