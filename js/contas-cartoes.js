document.addEventListener("DOMContentLoaded", function () {

// =========================================================
// CHAVES DO LOCALSTORAGE
// =========================================================

const CHAVE_CONTAS = "contasFinanceiras";
const CHAVE_CARTOES = "cartoesFinanceiros";
const CHAVE_MOVIMENTACOES = "movimentacoesContas";


// =========================================================
// INICIALIZAÇÃO
// =========================================================

carregarContas();
carregarCartoes();
configurarBotoes();


// =========================================================
// FORMATAR MOEDA
// =========================================================

function formatarMoeda(valor) {

    return Number(valor || 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );

}


// =========================================================
// CARREGAR CONTAS
// =========================================================

function carregarContas() {

    const contasGrid =
        document.querySelector(".contas-grid");

    if (!contasGrid) {
        return;
    }


    let contas = [];

    try {

        contas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CONTAS
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar contas:",
            erro
        );

        contas = [];

    }


    // Limpar contas que estejam na tela
    contasGrid.innerHTML = "";


    // Criar cada conta
    contas.forEach(function (conta) {

        adicionarContaNaTela(
            conta
        );

    });

}


// =========================================================
// CALCULAR SALDO DA CONTA
// =========================================================

function calcularSaldoConta(conta) {

    const saldoInicial =
        Number(
            conta.saldoInicial
        ) || 0;


    let movimentacoes = [];

    try {

        movimentacoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_MOVIMENTACOES
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar movimentações:",
            erro
        );

        movimentacoes = [];

    }


    let saldo =
        saldoInicial;


    /*
     * IMPORTANTE:
     *
     * A conta da movimentação é comparada
     * com o ID da conta cadastrada.
     *
     * Isso evita confundir, por exemplo,
     * uma movimentação antiga do Nubank
     * com o Bradesco.
     */

    const idConta =
        String(conta.id);


    movimentacoes.forEach(
        function (movimentacao) {

            if (!movimentacao) {
                return;
            }


            if (
                String(
                    movimentacao.conta
                ) !== idConta
            ) {

                return;

            }


            const valor =
                Number(
                    movimentacao.valor
                ) || 0;


            if (
                movimentacao.tipo ===
                "entrada"
            ) {

                saldo += valor;

            }


            if (
                movimentacao.tipo ===
                "saida"
            ) {

                saldo -= valor;

            }

        }
    );


    return saldo;

}


// =========================================================
// ADICIONAR CONTA NA TELA
// =========================================================

function adicionarContaNaTela(conta) {

    const contasGrid =
        document.querySelector(".contas-grid");

    if (!contasGrid) {
        return;
    }


    const saldoAtual =
        calcularSaldoConta(
            conta
        );


    // Atualizar o saldo salvo
    // para manter a informação sincronizada.
    conta.saldoAtual =
        saldoAtual;


    const card =
        document.createElement("div");

    card.className =
        "conta-card";


    // =====================================================
    // ÍCONE
    // =====================================================

    const icone =
        document.createElement("div");

    icone.className =
        "conta-icone";


    const primeiraLetra =
        conta.nome
            ? conta.nome
                .charAt(0)
                .toUpperCase()
            : "?";


    icone.textContent =
        primeiraLetra;


    // =====================================================
    // CONTEÚDO
    // =====================================================

    const conteudo =
        document.createElement("div");

    conteudo.className =
        "conta-conteudo";


    const status =
        document.createElement("span");

    status.className =
        "conta-status";

    status.textContent =
        conta.status ||
        "Ativa";


    const nome =
        document.createElement("h3");

    nome.textContent =
        conta.nome ||
        "Conta sem nome";


    const tipo =
        document.createElement("p");

    tipo.textContent =
        conta.tipo ||
        "Tipo não informado";


    const saldo =
        document.createElement("strong");

    saldo.className =
        "conta-saldo";

    saldo.textContent =
        formatarMoeda(
            saldoAtual
        );


    // =====================================================
    // BOTÕES
    // =====================================================

    const botoes =
        document.createElement("div");

    botoes.className =
        "conta-botoes";


    const btnVer =
        document.createElement("button");

    btnVer.type =
        "button";

    btnVer.className =
        "btn-ver-conta";

    btnVer.textContent =
        "Ver conta";


    btnVer.addEventListener(
        "click",
        function () {

            abrirDetalhesConta(
                conta.id
            );

        }
    );


    const btnExcluir =
        document.createElement("button");

    btnExcluir.type =
        "button";

    btnExcluir.className =
        "btn-excluir-conta";

    btnExcluir.textContent =
        "Excluir conta";


    btnExcluir.addEventListener(
        "click",
        function () {

            excluirConta(
                conta.id
            );

        }
    );


    botoes.appendChild(
        btnVer
    );

    botoes.appendChild(
        btnExcluir
    );


    // =====================================================
    // MONTAR CARD
    // =====================================================

    conteudo.appendChild(
        status
    );

    conteudo.appendChild(
        nome
    );

    conteudo.appendChild(
        tipo
    );

    conteudo.appendChild(
        saldo
    );

    conteudo.appendChild(
        botoes
    );


    card.appendChild(
        icone
    );

    card.appendChild(
        conteudo
    );


    contasGrid.appendChild(
        card
    );

}


// =========================================================
// ABRIR DETALHES DA CONTA
// =========================================================

function abrirDetalhesConta(id) {

    let contas = [];

    try {

        contas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CONTAS
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar conta:",
            erro
        );

        return;

    }


    const conta =
        contas.find(
            function (item) {

                return String(item.id) ===
                    String(id);

            }
        );


    if (!conta) {

        alert(
            "Conta não encontrada."
        );

        return;

    }


    const saldoAtual =
        calcularSaldoConta(
            conta
        );


    const modal =
        document.createElement("div");

    modal.className =
        "modal-overlay";


    modal.innerHTML = `

        <div class="modal-conteudo">

            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

            <h2>
                ${conta.nome || "Conta"}
            </h2>

            <div class="detalhes-conta">

                <p>
                    <strong>Instituição:</strong>
                    ${conta.instituicao || "-"}
                </p>

                <p>
                    <strong>Tipo:</strong>
                    ${conta.tipo || "-"}
                </p>

                <p>
                    <strong>Saldo inicial:</strong>
                    ${formatarMoeda(
                        conta.saldoInicial
                    )}
                </p>

                <p>
                    <strong>Saldo atual:</strong>
                    ${formatarMoeda(
                        saldoAtual
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${conta.status || "-"}
                </p>

                <p>
                    <strong>Observação:</strong>
                    ${conta.observacao || "-"}
                </p>

            </div>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const btnFechar =
        modal.querySelector(
            ".modal-fechar"
        );


    btnFechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    modal.addEventListener(
        "click",
        function (evento) {

            if (
                evento.target === modal
            ) {

                modal.remove();

            }

        }
    );

}


// =========================================================
// ABRIR MODAL NOVA CONTA
// =========================================================

function abrirModalConta() {

    const modal =
        document.createElement("div");

    modal.className =
        "modal-overlay";


    modal.innerHTML = `

        <div class="modal-conteudo">

            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

            <h2>
                Nova conta
            </h2>

            <form id="formNovaConta">

                <label>
                    Nome da conta
                </label>

                <input
                    type="text"
                    id="nomeConta"
                    required
                >

                <label>
                    Instituição
                </label>

                <input
                    type="text"
                    id="instituicaoConta"
                    required
                >

                <label>
                    Tipo de conta
                </label>

                <select
                    id="tipoConta"
                    required
                >

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

                <label>
                    Saldo inicial
                </label>

                <input
                    type="number"
                    id="saldoInicial"
                    step="0.01"
                    value="0"
                    required
                >

                <label>
                    Status
                </label>

                <select
                    id="statusConta"
                >

                    <option value="Ativa">
                        Ativa
                    </option>

                    <option value="Inativa">
                        Inativa
                    </option>

                </select>

                <label>
                    Observação
                </label>

                <textarea
                    id="observacaoConta"
                ></textarea>

                <button
                    type="submit"
                >
                    Salvar conta
                </button>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    const btnFechar =
        modal.querySelector(
            ".modal-fechar"
        );


    btnFechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    const formulario =
        modal.querySelector(
            "#formNovaConta"
        );


    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const novaConta = {

                id:
                    Date.now(),

                nome:
                    document.querySelector(
                        "#nomeConta"
                    ).value.trim(),

                instituicao:
                    document.querySelector(
                        "#instituicaoConta"
                    ).value.trim(),

                tipo:
                    document.querySelector(
                        "#tipoConta"
                    ).value,

                saldoInicial:
                    Number(
                        document.querySelector(
                            "#saldoInicial"
                        ).value
                    ) || 0,

                saldoAtual:
                    Number(
                        document.querySelector(
                            "#saldoInicial"
                        ).value
                    ) || 0,

                status:
                    document.querySelector(
                        "#statusConta"
                    ).value,

                observacao:
                    document.querySelector(
                        "#observacaoConta"
                    ).value.trim()

            };


            let contas = [];

            try {

                contas =
                    JSON.parse(
                        localStorage.getItem(
                            CHAVE_CONTAS
                        )
                    ) || [];

            } catch (erro) {

                contas = [];

            }


            contas.push(
                novaConta
            );


            localStorage.setItem(
                CHAVE_CONTAS,
                JSON.stringify(
                    contas
                )
            );


            modal.remove();

            carregarContas();

        }
    );

}


// =========================================================
// ABRIR MODAL NOVO CARTÃO
// =========================================================

function abrirModalCartao() {

    const modal =
        document.createElement("div");

    modal.className =
        "modal-overlay";


    modal.innerHTML = `

        <div class="modal-conteudo">

            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

            <h2>
                Novo cartão
            </h2>

            <form id="formNovoCartao">

                <label>
                    Nome do cartão
                </label>

                <input
                    type="text"
                    id="nomeCartao"
                    required
                >

                <label>
                    Instituição
                </label>

                <input
                    type="text"
                    id="instituicaoCartao"
                    required
                >

                <label>
                    Conta vinculada
                </label>

                <select
                    id="contaVinculada"
                    required
                >
                </select>

                <label>
                    Final do cartão
                </label>

                <input
                    type="text"
                    id="finalCartao"
                    maxlength="4"
                    required
                >

                <label>
                    Limite
                </label>

                <input
                    type="number"
                    id="limiteCartao"
                    step="0.01"
                    required
                >

                <label>
                    Dia de fechamento
                </label>

                <input
                    type="number"
                    id="fechamentoCartao"
                    min="1"
                    max="31"
                    required
                >

                <label>
                    Dia de vencimento
                </label>

                <input
                    type="number"
                    id="vencimentoCartao"
                    min="1"
                    max="31"
                    required
                >

                <label>
                    Status
                </label>

                <select
                    id="statusCartao"
                >

                    <option value="Ativo">
                        Ativo
                    </option>

                    <option value="Inativo">
                        Inativo
                    </option>

                </select>

                <label>
                    Observação
                </label>

                <textarea
                    id="observacaoCartao"
                ></textarea>

                <button
                    type="submit"
                >
                    Salvar cartão
                </button>

            </form>

        </div>

    `;


    document.body.appendChild(
        modal
    );


    carregarContasNoSelect(
        modal
    );


    const btnFechar =
        modal.querySelector(
            ".modal-fechar"
        );


    btnFechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


    const formulario =
        modal.querySelector(
            "#formNovoCartao"
        );


    formulario.addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const novoCartao = {

                id:
                    Date.now(),

                nome:
                    modal.querySelector(
                        "#nomeCartao"
                    ).value.trim(),

                instituicao:
                    modal.querySelector(
                        "#instituicaoCartao"
                    ).value.trim(),

                contaVinculada:
                    modal.querySelector(
                        "#contaVinculada"
                    ).value,

                final:
                    modal.querySelector(
                        "#finalCartao"
                    ).value.trim(),

                limite:
                    Number(
                        modal.querySelector(
                            "#limiteCartao"
                        ).value
                    ) || 0,

                fechamento:
                    Number(
                        modal.querySelector(
                            "#fechamentoCartao"
                        ).value
                    ) || 0,

                vencimento:
                    Number(
                        modal.querySelector(
                            "#vencimentoCartao"
                        ).value
                    ) || 0,

                status:
                    modal.querySelector(
                        "#statusCartao"
                    ).value,

                observacao:
                    modal.querySelector(
                        "#observacaoCartao"
                    ).value.trim()

            };


            let cartoes = [];

            try {

                cartoes =
                    JSON.parse(
                        localStorage.getItem(
                            CHAVE_CARTOES
                        )
                    ) || [];

            } catch (erro) {

                cartoes = [];

            }


            cartoes.push(
                novoCartao
            );


            localStorage.setItem(
                CHAVE_CARTOES,
                JSON.stringify(
                    cartoes
                )
            );


            modal.remove();

            carregarCartoes();

        }
    );

}


// =========================================================
// CARREGAR CONTAS NO SELECT DO CARTÃO
// =========================================================

function carregarContasNoSelect(modal) {

    const select =
        modal.querySelector(
            "#contaVinculada"
        );

    if (!select) {
        return;
    }


    let contas = [];

    try {

        contas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CONTAS
                )
            ) || [];

    } catch (erro) {

        contas = [];

    }


    select.innerHTML = "";


    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";
    opcaoInicial.textContent =
        "Selecione a conta";

    select.appendChild(
        opcaoInicial
    );


    contas.forEach(
        function (conta) {

            const opcao =
                document.createElement(
                    "option"
                );

            opcao.value =
                String(conta.id);

            opcao.textContent =
                conta.nome +
                " - " +
                conta.instituicao;

            select.appendChild(
                opcao
            );

        }
    );

}


// =========================================================
// CARREGAR CARTÕES
// =========================================================

function carregarCartoes() {

    const cartoesGrid =
        document.querySelector(
            ".cartoes-grid"
        );

    if (!cartoesGrid) {
        return;
    }


    let cartoes = [];

    try {

        cartoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CARTOES
                )
            ) || [];

    } catch (erro) {

        console.error(
            "Erro ao carregar cartões:",
            erro
        );

        cartoes = [];

    }


    cartoesGrid.innerHTML = "";


    cartoes.forEach(
        function (cartao) {

            adicionarCartaoNaTela(
                cartao
            );

        }
    );

}


// =========================================================
// ADICIONAR CARTÃO NA TELA
// =========================================================

function adicionarCartaoNaTela(cartao) {

    const cartoesGrid =
        document.querySelector(
            ".cartoes-grid"
        );

    if (!cartoesGrid) {
        return;
    }


    const card =
        document.createElement("div");

    card.className =
        "cartao-card";


    const conteudo =
        document.createElement("div");

    conteudo.className =
        "cartao-conteudo";


    const status =
        document.createElement("span");

    status.className =
        "cartao-status";

    status.textContent =
        cartao.status ||
        "Ativo";


    const nome =
        document.createElement("h3");

    nome.textContent =
        cartao.nome ||
        "Cartão";


    const instituicao =
        document.createElement("p");

    instituicao.textContent =
        cartao.instituicao ||
        "-";


    const final =
        document.createElement("p");

    final.textContent =
        "Final " +
        (
            cartao.final ||
            "----"
        );


    const limite =
        document.createElement("p");

    limite.textContent =
        "Limite: " +
        formatarMoeda(
            cartao.limite
        );


    const botoes =
        document.createElement("div");

    botoes.className =
        "cartao-botoes";


    const btnExcluir =
        document.createElement("button");

    btnExcluir.type =
        "button";

    btnExcluir.textContent =
        "Excluir cartão";


    btnExcluir.addEventListener(
        "click",
        function () {

            excluirCartao(
                cartao.id
            );

        }
    );


    botoes.appendChild(
        btnExcluir
    );


    conteudo.appendChild(
        status
    );

    conteudo.appendChild(
        nome
    );

    conteudo.appendChild(
        instituicao
    );

    conteudo.appendChild(
        final
    );

    conteudo.appendChild(
        limite
    );

    conteudo.appendChild(
        botoes
    );


    card.appendChild(
        conteudo
    );


    cartoesGrid.appendChild(
        card
    );

}


// =========================================================
// EXCLUIR CONTA
// =========================================================

function excluirConta(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir esta conta?"
        );


    if (!confirmar) {
        return;
    }


    let contas = [];

    try {

        contas =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CONTAS
                )
            ) || [];

    } catch (erro) {

        contas = [];

    }


    contas =
        contas.filter(
            function (conta) {

                return String(conta.id) !==
                    String(id);

            }
        );


    localStorage.setItem(
        CHAVE_CONTAS,
        JSON.stringify(
            contas
        )
    );


    carregarContas();

}


// =========================================================
// EXCLUIR CARTÃO
// =========================================================

function excluirCartao(id) {

    const confirmar =
        confirm(
            "Deseja realmente excluir este cartão?"
        );


    if (!confirmar) {
        return;
    }


    let cartoes = [];

    try {

        cartoes =
            JSON.parse(
                localStorage.getItem(
                    CHAVE_CARTOES
                )
            ) || [];

    } catch (erro) {

        cartoes = [];

    }


    cartoes =
        cartoes.filter(
            function (cartao) {

                return String(cartao.id) !==
                    String(id);

            }
        );


    localStorage.setItem(
        CHAVE_CARTOES,
        JSON.stringify(
            cartoes
        )
    );


    carregarCartoes();

}


// =========================================================
// CONFIGURAR BOTÕES
// =========================================================

function configurarBotoes() {

    const btnNovaConta =
        document.querySelector(
            "#btnNovaConta"
        );


    const btnNovoCartao =
        document.querySelector(
            "#btnNovoCartao"
        );


    if (btnNovaConta) {

        btnNovaConta.addEventListener(
            "click",
            function () {

                abrirModalConta();

            }
        );

    }


    if (btnNovoCartao) {

        btnNovoCartao.addEventListener(
            "click",
            function () {

                abrirModalCartao();

            }
        );

    }

}

});