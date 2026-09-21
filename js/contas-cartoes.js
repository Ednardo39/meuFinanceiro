// ============================================================
// MEU FINANCEIRO
// CONTAS E CARTÕES
// ============================================================


// ============================================================
// CONFIGURAÇÃO
// ============================================================

const CHAVE_CONTAS = "contasFinanceiras";


// ============================================================
// AO CARREGAR A PÁGINA
// ============================================================

    document.addEventListener("DOMContentLoaded", function () {

    carregarContas();

    carregarCartoes();

    configurarBotoes();

    });


// ============================================================
// CONFIGURAR BOTÕES
// ============================================================

function configurarBotoes() {

    const botoesPrincipal =
        document.querySelectorAll(".btn-principal");


    botoesPrincipal.forEach(function (botao) {

        const texto =
            botao.textContent.trim();


        // BOTÃO NOVA CONTA
        if (texto.includes("Nova conta")) {

            botao.addEventListener(
                "click",
                function () {

                    abrirModalConta();

                }
            );

        }


        // BOTÃO NOVO CARTÃO
        if (texto.includes("Novo cartão")) {

            botao.addEventListener(
                "click",
                function () {

                    abrirModalCartao();

                }
            );

        }

    });

}


// ============================================================
// FORMATAR VALOR EM REAIS
// ============================================================

function formatarMoeda(valor) {

    return Number(valor).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// ============================================================
// CONVERTER VALOR BRASILEIRO PARA NÚMERO
// ============================================================

function converterParaNumero(valorTexto) {

    if (!valorTexto) {
        return 0;
    }


    let texto = valorTexto
        .replace("R$", "")
        .trim();


    // Remove pontos dos milhares
    texto = texto.replace(/\./g, "");


    // Troca vírgula decimal por ponto
    texto = texto.replace(",", ".");


    const numero = Number(texto);


    if (isNaN(numero)) {
        return 0;
    }


    return numero;

}


// ============================================================
// GERAR ID
// ============================================================

function gerarId() {

    return Date.now().toString();

}


// ============================================================
// OBTER CONTAS SALVAS
// ============================================================

function obterContas() {

    const contasSalvas =
        localStorage.getItem(CHAVE_CONTAS);


    if (!contasSalvas) {
        return [];
    }


    try {

        const contas =
            JSON.parse(contasSalvas);


        if (!Array.isArray(contas)) {
            return [];
        }


        return contas;

    } catch (erro) {

        console.error(
            "Erro ao carregar contas:",
            erro
        );


        return [];

    }

}


// ============================================================
// SALVAR CONTAS
// ============================================================

function salvarContas(contas) {

    localStorage.setItem(
        CHAVE_CONTAS,
        JSON.stringify(contas)
    );

}


// ============================================================
// CARREGAR CONTAS
// ============================================================

function carregarContas() {

    const contas =
        obterContas();


    // Se ainda não existem contas salvas,
    // mantemos as contas que estão no HTML.

    if (contas.length === 0) {
        return;
    }


    const gradeContas =
        document.querySelector(".contas-grid");


    if (!gradeContas) {
        return;
    }


    // Remove as contas estáticas do HTML
    gradeContas.innerHTML = "";


    // Recria as contas salvas
    contas.forEach(function (conta) {

        adicionarContaNaTela(conta);

    });

}

// ============================================================
// CARREGAR CARTÕES
// ============================================================

function carregarCartoes() {

    const cartoesSalvos =
        localStorage.getItem("cartoesFinanceiros");


    if (!cartoesSalvos) {
        return;
    }


    let cartoes = [];


    try {

        cartoes =
            JSON.parse(cartoesSalvos);


        if (!Array.isArray(cartoes)) {
            return;
        }

    } catch (erro) {

        console.error(
            "Erro ao carregar cartões:",
            erro
        );

        return;

    }


    const gradeCartoes =
        document.querySelector(".cartoes-grid");


    if (!gradeCartoes) {
        return;
    }


    // Limpa os cartões estáticos do HTML
    gradeCartoes.innerHTML = "";


    // Recria os cartões salvos
    cartoes.forEach(function (cartao) {

        adicionarCartaoNaTela(
            cartao.nome,
            cartao.instituicao,
            cartao.conta,
            cartao.final,
            cartao.limite,
            cartao.fechamento,
            cartao.vencimento,
            cartao.status
        );

    });

}


// ============================================================
// MODAL - NOVA CONTA
// ============================================================

function abrirModalConta() {

    const modal =
        document.createElement("div");


    modal.className = "modal-fundo";


    modal.innerHTML = `

        <div class="modal">

            <div class="modal-cabecalho">

                <h2>Nova conta</h2>

                <button
                    class="modal-fechar"
                    type="button"
                >
                    &times;
                </button>

            </div>


            <form id="formNovaConta">

                <div class="form-group">

                    <label>
                        Nome da conta
                    </label>

                    <input
                        type="text"
                        id="nomeConta"
                        placeholder="Ex.: Conta principal"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Instituição
                    </label>

                    <input
                        type="text"
                        id="instituicaoConta"
                        placeholder="Ex.: Nubank"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Tipo de conta
                    </label>

                    <select id="tipoConta">

                        <option value="">
                            Selecione
                        </option>

                        <option value="Conta corrente">
                            Conta corrente
                        </option>

                        <option value="Conta poupança">
                            Conta poupança
                        </option>

                        <option value="Conta de pagamento">
                            Conta de pagamento
                        </option>

                        <option value="Carteira">
                            Carteira
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Saldo inicial
                    </label>

                    <input
                        type="text"
                        id="saldoInicial"
                        class="campo-dinheiro"
                        placeholder="R$ 0,00"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Status
                    </label>

                    <select id="statusConta">

                        <option value="Ativa">
                            Ativa
                        </option>

                        <option value="Inativa">
                            Inativa
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Observação
                    </label>

                    <textarea
                        id="observacaoConta"
                        rows="3"
                        placeholder="Observação opcional"
                    ></textarea>

                </div>


                <div class="modal-acoes">

                    <button
                        type="button"
                        class="btn-modal-cancelar"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="btn-modal-salvar"
                    >
                        Salvar conta
                    </button>

                </div>


            </form>

        </div>

    `;


    document.body.appendChild(modal);


    // ========================================================
    // FECHAR PELO X
    // ========================================================

    modal
        .querySelector(".modal-fechar")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ========================================================
    // CANCELAR
    // ========================================================

    modal
        .querySelector(".btn-modal-cancelar")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ========================================================
    // CAMPO SALDO INICIAL
    // ========================================================

    const campoSaldo =
        modal.querySelector("#saldoInicial");


    campoSaldo.addEventListener(
        "blur",
        function () {

            const numero =
                converterParaNumero(
                    campoSaldo.value
                );


            if (
                campoSaldo.value.trim() !== ""
                &&
                !isNaN(numero)
            ) {

                campoSaldo.value =
                    numero.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

            }

        }
    );


    // ========================================================
    // SALVAR CONTA
    // ========================================================

    modal
        .querySelector("#formNovaConta")
        .addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                const nome =
                    modal
                        .querySelector("#nomeConta")
                        .value
                        .trim();


                const instituicao =
                    modal
                        .querySelector("#instituicaoConta")
                        .value
                        .trim();


                const tipo =
                    modal
                        .querySelector("#tipoConta")
                        .value;


                const saldoTexto =
                    modal
                        .querySelector("#saldoInicial")
                        .value
                        .trim();


                const status =
                    modal
                        .querySelector("#statusConta")
                        .value;


                const observacao =
                    modal
                        .querySelector("#observacaoConta")
                        .value
                        .trim();


                // =================================================
                // VALIDAÇÕES
                // =================================================

                if (nome === "") {

                    alert(
                        "Informe o nome da conta."
                    );

                    return;

                }


                if (instituicao === "") {

                    alert(
                        "Informe a instituição."
                    );

                    return;

                }


                if (tipo === "") {

                    alert(
                        "Selecione o tipo de conta."
                    );

                    return;

                }


                // =================================================
                // CONVERTER SALDO
                // =================================================

                const saldo =
                    converterParaNumero(
                        saldoTexto
                    );


                // =================================================
                // CRIAR CONTA
                // =================================================

                const novaConta = {

                    id: gerarId(),

                    nome: nome,

                    instituicao: instituicao,

                    tipo: tipo,

                    saldoInicial: saldo,

                    saldoAtual: saldo,

                    status: status,

                    observacao: observacao

                };


                // =================================================
                // OBTER CONTAS EXISTENTES
                // =================================================

                const contas =
                    obterContas();


                // =================================================
                // ADICIONAR NOVA CONTA
                // =================================================

                contas.push(
                    novaConta
                );


                // =================================================
                // SALVAR NO LOCALSTORAGE
                // =================================================

                salvarContas(
                    contas
                );


                // =================================================
                // MOSTRAR NA TELA
                // =================================================

                adicionarContaNaTela(
                    novaConta
                );


                // =================================================
                // FECHAR MODAL
                // =================================================

                modal.remove();


                // =================================================
                // MENSAGEM
                // =================================================

                alert(
                    "Conta cadastrada com sucesso!"
                );

            }
        );

}


// ============================================================
// ADICIONAR CONTA NA TELA
// ============================================================

function adicionarContaNaTela(conta) {

    const gradeContas =
        document.querySelector(".contas-grid");


    if (!gradeContas) {
        return;
    }


    const elemento =
        document.createElement("article");


    elemento.className =
        "conta-card";


    const primeiraLetra =
        conta.nome
            .charAt(0)
            .toUpperCase();


    elemento.innerHTML = `

        <div class="conta-topo">

            <div class="conta-icone">

                ${primeiraLetra}

            </div>


            <span class="status ativo">

                ${conta.status}

            </span>

        </div>


        <div class="conta-info">

            <h3>
                ${conta.nome}
            </h3>

            <p>
                ${conta.tipo}
            </p>

        </div>


        <div class="conta-saldo">

            <span>
                Saldo disponível
            </span>

            <strong>
                ${formatarMoeda(conta.saldoAtual)}
            </strong>

        </div>


        <button
            class="btn-secundario"
            type="button"
        >
            Ver conta
        </button>

    `;


    gradeContas.appendChild(
        elemento
    );

}

// ============================================================
// CARREGAR CONTAS NO SELECT DO CARTÃO
// ============================================================

function carregarContasNoSelect(modal) {

    const select =
        modal.querySelector("#contaVinculada");


    if (!select) {
        return;
    }


    const contas =
        obterContas();


    // Se não houver contas cadastradas
    if (contas.length === 0) {

        const opcao =
            document.createElement("option");

        opcao.value = "";

        opcao.textContent =
            "Nenhuma conta cadastrada";

        select.appendChild(opcao);

        return;
    }


    // Adiciona as contas cadastradas
    contas.forEach(function (conta) {

        const opcao =
            document.createElement("option");


        // Usamos o ID da conta como valor
        opcao.value =
            conta.id;


        // O usuário verá nome + instituição
        opcao.textContent =
            conta.nome +
            " - " +
            conta.instituicao;


        select.appendChild(opcao);

    });

}

// ============================================================
// MODAL - NOVO CARTÃO
// ============================================================

function abrirModalCartao() {

    const modal =
        document.createElement("div");


    modal.className = "modal-fundo";


    modal.innerHTML = `

        <div class="modal">

            <div class="modal-cabecalho">

                <h2>Novo cartão</h2>

                <button
                    class="modal-fechar"
                    type="button"
                >
                    &times;
                </button>

            </div>


            <form id="formNovoCartao">

                <div class="form-group">

                    <label>
                        Nome do cartão
                    </label>

                    <input
                        type="text"
                        id="nomeCartao"
                        placeholder="Ex.: Cartão Nubank"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Instituição
                    </label>

                    <input
                        type="text"
                        id="instituicaoCartao"
                        placeholder="Ex.: Nubank"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Conta vinculada
                    </label>

                    <select id="contaVinculada">
                        <option value="">
                            Selecione
                        </option>
                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Final do cartão
                    </label>

                    <input
                        type="text"
                        id="finalCartao"
                        maxlength="4"
                        inputmode="numeric"
                        placeholder="Ex.: 1234"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Limite do cartão
                    </label>

                    <input
                        type="text"
                        id="limiteCartao"
                        class="campo-dinheiro"
                        placeholder="R$ 0,00"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Dia de fechamento
                    </label>

                    <input
                        type="number"
                        id="fechamentoCartao"
                        min="1"
                        max="31"
                        placeholder="Ex.: 02"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Dia de vencimento
                    </label>

                    <input
                        type="number"
                        id="vencimentoCartao"
                        min="1"
                        max="31"
                        placeholder="Ex.: 10"
                    >

                </div>


                <div class="form-group">

                    <label>
                        Status
                    </label>

                    <select id="statusCartao">

                        <option value="Ativo">
                            Ativo
                        </option>

                        <option value="Inativo">
                            Inativo
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>
                        Observação
                    </label>

                    <textarea
                        id="observacaoCartao"
                        rows="3"
                        placeholder="Observação opcional"
                    ></textarea>

                </div>


                <div class="modal-acoes">

                    <button
                        type="button"
                        class="btn-modal-cancelar"
                    >
                        Cancelar
                    </button>


                    <button
                        type="submit"
                        class="btn-modal-salvar"
                    >
                        Salvar cartão
                    </button>

                </div>


            </form>

        </div>

    `;
   

    document.body.appendChild(modal);

    carregarContasNoSelect(modal);


    // ========================================================
    // FECHAR
    // ========================================================

    modal
        .querySelector(".modal-fechar")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ========================================================
    // CANCELAR
    // ========================================================

    modal
        .querySelector(".btn-modal-cancelar")
        .addEventListener(
            "click",
            function () {

                modal.remove();

            }
        );


    // ========================================================
    // FINAL DO CARTÃO
    // ========================================================

    const campoFinal =
        modal.querySelector("#finalCartao");


    campoFinal.addEventListener(
        "input",
        function () {

            campoFinal.value =
                campoFinal.value
                    .replace(/\D/g, "")
                    .slice(0, 4);

        }
    );


    // ========================================================
    // LIMITE DO CARTÃO
    // ========================================================

    const campoLimite =
        modal.querySelector("#limiteCartao");


    campoLimite.addEventListener(
        "blur",
        function () {

            const numero =
                converterParaNumero(
                    campoLimite.value
                );


            if (
                campoLimite.value.trim() !== ""
                &&
                !isNaN(numero)
            ) {

                campoLimite.value =
                    numero.toLocaleString(
                        "pt-BR",
                        {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 2
                        }
                    );

            }

        }
    );


    // ========================================================
    // SALVAR CARTÃO
    // ========================================================

    modal
        .querySelector("#formNovoCartao")
        .addEventListener(
            "submit",
            function (evento) {

                evento.preventDefault();


                const nome =
                    modal
                        .querySelector("#nomeCartao")
                        .value
                        .trim();


                const instituicao =
                    modal
                        .querySelector("#instituicaoCartao")
                        .value
                        .trim();


                const conta =
                    modal
                        .querySelector("#contaVinculada")
                        .value;


                const final =
                    modal
                        .querySelector("#finalCartao")
                        .value
                        .trim();


                const limiteTexto =
                    modal
                        .querySelector("#limiteCartao")
                        .value
                        .trim();


                const fechamento =
                    modal
                        .querySelector("#fechamentoCartao")
                        .value;


                const vencimento =
                    modal
                        .querySelector("#vencimentoCartao")
                        .value;


                const status =
                    modal
                        .querySelector("#statusCartao")
                        .value;


                // =================================================
                // VALIDAÇÕES
                // =================================================

                if (nome === "") {

                    alert(
                        "Informe o nome do cartão."
                    );

                    return;

                }


                if (instituicao === "") {

                    alert(
                        "Informe a instituição."
                    );

                    return;

                }


                if (conta === "") {

                    alert(
                        "Selecione a conta vinculada."
                    );

                    return;

                }


                if (final.length !== 4) {

                    alert(
                        "Informe os 4 últimos dígitos do cartão."
                    );

                    return;

                }


                if (fechamento === "") {

                    alert(
                        "Informe o dia de fechamento."
                    );

                    return;

                }


                if (vencimento === "") {

                    alert(
                        "Informe o dia de vencimento."
                    );

                    return;

                }


                // =================================================
                // CONVERTER LIMITE
                // =================================================

                let limite = 0;


                if (limiteTexto !== "") {

                    limite =
                        converterParaNumero(
                            limiteTexto
                        );


                    if (isNaN(limite)) {

                        alert(
                            "Informe um limite válido."
                        );

                        return;

                    }

                }


            // =================================================
            // CRIAR CARTÃO
            // =================================================

                const novoCartao = {

                    id: gerarId(),

                    nome: nome,

                    instituicao: instituicao,

                    conta: conta,

                    final: final,

                    limite: limite,

                    fechamento: fechamento,

                    vencimento: vencimento,

                    status: status

                };


            // =================================================
            // OBTER CARTÕES EXISTENTES
            // =================================================

            const cartoesSalvos =
                localStorage.getItem("cartoesFinanceiros");


            let cartoes = [];


            if (cartoesSalvos) {

                try {

                    cartoes =
                        JSON.parse(cartoesSalvos);

                    if (!Array.isArray(cartoes)) {
                        cartoes = [];
                    }

                } catch (erro) {

                    console.error(
                        "Erro ao carregar cartões:",
                        erro
                    );

                    cartoes = [];

                }

            }


            // ADICIONAR NOVO CARTÃO
            // =================================================

            cartoes.push(
                novoCartao
            );


            // =================================================
            // SALVAR CARTÕES
            // =================================================

            localStorage.setItem(
                "cartoesFinanceiros",
                JSON.stringify(cartoes)
            );


            // =================================================
            // MOSTRAR CARTÃO NA TELA
            // =================================================

            adicionarCartaoNaTela(
                nome,
                instituicao,
                conta,
                final,
                limite,
                fechamento,
                vencimento,
                status
            );


            // =================================================
            // FECHAR MODAL
            // =================================================

            modal.remove();

            }
        );

}


// ============================================================
// ADICIONAR CARTÃO NA TELA
// ============================================================

function adicionarCartaoNaTela(
    nome,
    instituicao,
    conta,
    final,
    limite,
    fechamento,
    vencimento,
    status
) {

    const gradeCartoes =
        document.querySelector(".cartoes-grid");


    if (!gradeCartoes) {
        return;
    }


    const cartao =
        document.createElement("div");


    cartao.className =
        "cartao-card";


    cartao.innerHTML = `

        <div class="cartao-topo">

            <div>

                <span class="cartao-tipo">
                    CRÉDITO
                </span>

                <h3>
                    ${nome}
                </h3>

            </div>


            <span class="cartao-chip">
                ▣
            </span>

        </div>


        <div class="cartao-numero">

            •••• •••• •••• ${final}

        </div>


        <div class="cartao-dados">

            <div>

                <span>
                    Limite
                </span>

                <strong>
                    ${formatarMoeda(limite)}
                </strong>

            </div>


            <div>

                <span>
                    Disponível
                </span>

                <strong>
                    ${formatarMoeda(limite)}
                </strong>

            </div>

        </div>


        <div class="cartao-rodape">

            <span>
                Fecha dia ${fechamento}
            </span>

            <span>
                Vence dia ${vencimento}
            </span>

        </div>

    `;


    gradeCartoes.appendChild(
        cartao
    );

}