/* ============================================================
MEU FINANCEIRO
CONTAS E CARTÕES
============================================================ */

const CHAVE_CONTAS = "contasFinanceiras";
const CHAVE_CARTOES = "cartoesFinanceiros";
const CHAVE_MOVIMENTACOES = "movimentacoesContas";

/* ============================================================
FUNÇÕES DE LEITURA DO LOCALSTORAGE
============================================================ */

function carregarContasDoStorage() {

try {

    return JSON.parse(
        localStorage.getItem(CHAVE_CONTAS)
    ) || [];

} catch (erro) {

    console.error(
        "Erro ao carregar contas:",
        erro
    );

    return [];
}

}

function carregarCartoesDoStorage() {

try {

    return JSON.parse(
        localStorage.getItem(CHAVE_CARTOES)
    ) || [];

} catch (erro) {

    console.error(
        "Erro ao carregar cartões:",
        erro
    );

    return [];
}

}

function carregarMovimentacoesDoStorage() {

try {

    return JSON.parse(
        localStorage.getItem(CHAVE_MOVIMENTACOES)
    ) || [];

} catch (erro) {

    console.error(
        "Erro ao carregar movimentações:",
        erro
    );

    return [];
}

}

/* ============================================================
FORMATAÇÃO DE MOEDA
============================================================ */

function formatarMoeda(valor) {

return Number(valor || 0).toLocaleString(
    "pt-BR",
    {
        style: "currency",
        currency: "BRL"
    }
);

}

/* ============================================================
CALCULAR SALDO DA CONTA
============================================================ */

function calcularSaldoConta(conta) {

const saldoInicial =
    Number(conta.saldoInicial) || 0;

const movimentacoes =
    carregarMovimentacoesDoStorage();

let entradas = 0;
let saidas = 0;


movimentacoes.forEach(function (movimentacao) {

    if (
        String(movimentacao.conta) !==
        String(conta.id)
    ) {

        return;
    }


    const valor =
        Number(movimentacao.valor) || 0;


    if (movimentacao.tipo === "entrada") {

        entradas += valor;

    }


    if (movimentacao.tipo === "saida") {

        saidas += valor;

    }

});


return saldoInicial + entradas - saidas;

}

/* ============================================================
CARREGAR CONTAS NA TELA
============================================================ */

function carregarContas() {

const contasGrid =
    document.querySelector(".contas-grid");


if (!contasGrid) {

    console.error(
        "Elemento .contas-grid não encontrado."
    );

    return;
}


contasGrid.innerHTML = "";


const contas =
    carregarContasDoStorage();


if (contas.length === 0) {

    contasGrid.innerHTML = `
        <div class="mensagem-vazia">
            <p>Nenhuma conta cadastrada.</p>
        </div>
    `;

    return;
}


contas.forEach(function (conta) {

    adicionarContaNaTela(conta);

});

}

/* ============================================================
CRIAR CARD DA CONTA
============================================================ */

function adicionarContaNaTela(conta) {

const contasGrid =
    document.querySelector(".contas-grid");


if (!contasGrid) {

    return;
}


const saldoAtual =
    calcularSaldoConta(conta);


const statusAtivo =
    String(conta.status || "").toLowerCase() === "ativa";


const card =
    document.createElement("div");


card.className =
    "conta-card";


card.innerHTML = `

    <div class="conta-topo">

        <div class="conta-icone">
            💰
        </div>

        <span class="status ${statusAtivo ? "ativo" : "inativo"}">
            ${conta.status || "Ativa"}
        </span>

    </div>


    <div class="conta-info">

        <h3>
            ${conta.nome || "Conta"}
        </h3>

        <p>
            ${conta.instituicao || ""}
        </p>

        <p>
            ${conta.tipo || ""}
        </p>

    </div>


    <div class="conta-saldo">

        <span>
            Saldo atual
        </span>

        <strong>
            ${formatarMoeda(saldoAtual)}
        </strong>

    </div>


    <div class="conta-botoes">

        <button
            type="button"
            class="btn-secundario btn-ver-conta"
        >
            Ver conta
        </button>

        <button
            type="button"
            class="btn-perigo btn-excluir-conta"
        >
            Excluir conta
        </button>

    </div>

`;


const btnVer =
    card.querySelector(".btn-ver-conta");


if (btnVer) {

    btnVer.addEventListener(
        "click",
        function () {

            abrirDetalhesConta(conta.id);

        }
    );
}


const btnExcluir =
    card.querySelector(".btn-excluir-conta");


if (btnExcluir) {

    btnExcluir.addEventListener(
        "click",
        function () {

            excluirConta(conta.id);

        }
    );
}


contasGrid.appendChild(card);

}

/* ============================================================
DETALHES DA CONTA
============================================================ */

function abrirDetalhesConta(id) {

const contas =
    carregarContasDoStorage();


const conta =
    contas.find(function (item) {

        return String(item.id) === String(id);

    });


if (!conta) {

    alert("Conta não encontrada.");

    return;
}


const saldoAtual =
    calcularSaldoConta(conta);


const modal =
    document.createElement("div");


modal.className =
    "modal-fundo";


modal.innerHTML = `

    <div class="modal">

        <div class="modal-cabecalho">

            <div>

                <h2>
                    ${conta.nome || "Conta"}
                </h2>

                <p>
                    Detalhes da conta
                </p>

            </div>


            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

        </div>


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
                ${formatarMoeda(conta.saldoInicial)}
            </p>

            <p>
                <strong>Saldo atual:</strong>
                ${formatarMoeda(saldoAtual)}
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


document.body.appendChild(modal);


const btnFechar =
    modal.querySelector(".modal-fechar");


if (btnFechar) {

    btnFechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );
}


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            modal.remove();

        }

    }
);

}

/* ============================================================
ABRIR NOVA CONTA
============================================================ */

function abrirModalConta() {

const modal =
    document.createElement("div");


modal.className =
    "modal-fundo";


modal.innerHTML = `

    <div class="modal">

        <div class="modal-cabecalho">

            <div>

                <h2>
                    Nova conta
                </h2>

                <p>
                    Cadastre uma nova conta financeira
                </p>

            </div>


            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

        </div>


        <form id="formNovaConta">

            <div class="campo">

                <label for="nomeConta">
                    Nome da conta
                </label>

                <input
                    type="text"
                    id="nomeConta"
                    required
                    placeholder="Ex.: Conta principal"
                >

            </div>


            <div class="campo">

                <label for="instituicaoConta">
                    Instituição
                </label>

                <input
                    type="text"
                    id="instituicaoConta"
                    required
                    placeholder="Ex.: Bradesco"
                >

            </div>


            <div class="campo">

                <label for="tipoConta">
                    Tipo da conta
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

                    <option value="Conta digital">
                        Conta digital
                    </option>

                    <option value="Carteira">
                        Carteira
                    </option>

                </select>

            </div>


            <div class="campo">

                <label for="saldoInicial">
                    Saldo inicial
                </label>

                <input
                    type="number"
                    id="saldoInicial"
                    step="0.01"
                    min="0"
                    value="0"
                    required
                >

            </div>


            <div class="campo">

                <label for="statusConta">
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


            <div class="campo">

                <label for="observacaoConta">
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
                    class="btn-secundario btn-cancelar-modal"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    class="btn-principal"
                >
                    Salvar conta
                </button>

            </div>

        </form>

    </div>

`;


document.body.appendChild(modal);


configurarFechamentoModal(modal);


const formulario =
    modal.querySelector("#formNovaConta");


formulario.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const nome =
            modal.querySelector("#nomeConta")
                .value.trim();


        const instituicao =
            modal.querySelector("#instituicaoConta")
                .value.trim();


        const tipo =
            modal.querySelector("#tipoConta")
                .value;


        const saldoInicial =
            Number(
                modal.querySelector("#saldoInicial")
                    .value
            ) || 0;


        const status =
            modal.querySelector("#statusConta")
                .value;


        const observacao =
            modal.querySelector("#observacaoConta")
                .value.trim();


        if (
            !nome ||
            !instituicao ||
            !tipo
        ) {

            alert(
                "Preencha os campos obrigatórios."
            );

            return;
        }


        const contas =
            carregarContasDoStorage();


        const novaConta = {

            id:
                String(Date.now()) +
                String(
                    Math.floor(
                        Math.random() * 1000
                    )
                ),

            nome: nome,

            instituicao: instituicao,

            tipo: tipo,

            saldoInicial: saldoInicial,

            saldoAtual: saldoInicial,

            status: status,

            observacao: observacao

        };


        contas.push(novaConta);


        localStorage.setItem(
            CHAVE_CONTAS,
            JSON.stringify(contas)
        );


        modal.remove();


        carregarContas();


        alert(
            "Conta cadastrada com sucesso."
        );

    }
);

}

/* ============================================================
ABRIR NOVO CARTÃO
============================================================ */

function abrirModalCartao() {

const modal =
    document.createElement("div");


modal.className =
    "modal-fundo";


modal.innerHTML = `

    <div class="modal">

        <div class="modal-cabecalho">

            <div>

                <h2>
                    Novo cartão
                </h2>

                <p>
                    Cadastre um novo cartão de crédito
                </p>

            </div>


            <button
                type="button"
                class="modal-fechar"
            >
                ×
            </button>

        </div>


        <form id="formNovoCartao">

            <div class="campo">

                <label for="nomeCartao">
                    Nome do cartão
                </label>

                <input
                    type="text"
                    id="nomeCartao"
                    required
                    placeholder="Ex.: Cartão principal"
                >

            </div>


            <div class="campo">

                <label for="instituicaoCartao">
                    Instituição
                </label>

                <input
                    type="text"
                    id="instituicaoCartao"
                    required
                    placeholder="Ex.: Bradesco"
                >

            </div>


            <div class="campo">

                <label for="contaCartao">
                    Conta vinculada
                </label>

                <input
                    type="text"
                    id="contaCartao"
                    placeholder="Ex.: Conta principal"
                >

            </div>


            <div class="campo">

                <label for="finalCartao">
                    Final do cartão
                </label>

                <input
                    type="text"
                    id="finalCartao"
                    maxlength="4"
                    inputmode="numeric"
                    required
                    placeholder="Ex.: 1425"
                >

            </div>


            <div class="campo">

                <label for="limiteCartao">
                    Limite
                </label>

                <input
                    type="number"
                    id="limiteCartao"
                    step="0.01"
                    min="0"
                    value="0"
                    required
                >

            </div>


            <div class="campo">

                <label for="fechamentoCartao">
                    Dia de fechamento
                </label>

                <input
                    type="number"
                    id="fechamentoCartao"
                    min="1"
                    max="31"
                    placeholder="Ex.: 22"
                >

            </div>


            <div class="campo">

                <label for="vencimentoCartao">
                    Dia de vencimento
                </label>

                <input
                    type="number"
                    id="vencimentoCartao"
                    min="1"
                    max="31"
                    placeholder="Ex.: 30"
                >

            </div>


            <div class="campo">

                <label for="statusCartao">
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


            <div class="modal-acoes">

                <button
                    type="button"
                    class="btn-secundario btn-cancelar-modal"
                >
                    Cancelar
                </button>

                <button
                    type="submit"
                    class="btn-principal"
                >
                    Salvar cartão
                </button>

            </div>

        </form>

    </div>

`;


document.body.appendChild(modal);


configurarFechamentoModal(modal);


const formulario =
    modal.querySelector("#formNovoCartao");


formulario.addEventListener(
    "submit",
    function (event) {

        event.preventDefault();


        const nome =
            modal.querySelector("#nomeCartao")
                .value.trim();


        const instituicao =
            modal.querySelector("#instituicaoCartao")
                .value.trim();


        const conta =
            modal.querySelector("#contaCartao")
                .value.trim();


        const final =
            modal.querySelector("#finalCartao")
                .value.trim();


        const limite =
            Number(
                modal.querySelector("#limiteCartao")
                    .value
            ) || 0;


        const fechamento =
            modal.querySelector("#fechamentoCartao")
                .value;


        const vencimento =
            modal.querySelector("#vencimentoCartao")
                .value;


        const status =
            modal.querySelector("#statusCartao")
                .value;


        if (
            !nome ||
            !instituicao ||
            !final
        ) {

            alert(
                "Preencha os campos obrigatórios."
            );

            return;
        }


        if (!/^\d{4}$/.test(final)) {

            alert(
                "O final do cartão deve ter 4 números."
            );

            return;
        }


        const cartoes =
            carregarCartoesDoStorage();


        const novoCartao = {

            id:
                String(Date.now()) +
                String(
                    Math.floor(
                        Math.random() * 1000
                    )
                ),

            nome: nome,

            instituicao: instituicao,

            conta: conta,

            final: final,

            limite: limite,

            fechamento: fechamento,

            vencimento: vencimento,

            status: status

        };


        cartoes.push(novoCartao);


        localStorage.setItem(
            CHAVE_CARTOES,
            JSON.stringify(cartoes)
        );


        modal.remove();


        carregarCartoes();


        alert(
            "Cartão cadastrado com sucesso."
        );

    }
);

}

/* ============================================================
FECHAMENTO DOS MODAIS
============================================================ */

function configurarFechamentoModal(modal) {

const btnFechar =
    modal.querySelector(".modal-fechar");


if (btnFechar) {

    btnFechar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );
}


const btnCancelar =
    modal.querySelector(".btn-cancelar-modal");


if (btnCancelar) {

    btnCancelar.addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );
}


modal.addEventListener(
    "click",
    function (event) {

        if (event.target === modal) {

            modal.remove();

        }

    }
);

}

/* ============================================================
CARREGAR CARTÕES
============================================================ */

function carregarCartoes() {

const cartoesGrid =
    document.querySelector(".cartoes-grid");


if (!cartoesGrid) {

    console.error(
        "Elemento .cartoes-grid não encontrado."
    );

    return;
}


cartoesGrid.innerHTML = "";


const cartoes =
    carregarCartoesDoStorage();


if (cartoes.length === 0) {

    cartoesGrid.innerHTML = `
        <div class="mensagem-vazia">
            <p>Nenhum cartão cadastrado.</p>
        </div>
    `;

    return;
}


cartoes.forEach(function (cartao) {

    adicionarCartaoNaTela(cartao);

});

}

/* ============================================================
CRIAR CARD DO CARTÃO
============================================================ */

function adicionarCartaoNaTela(cartao) {

const cartoesGrid =
    document.querySelector(".cartoes-grid");


if (!cartoesGrid) {

    return;
}


const statusAtivo =
    String(cartao.status || "").toLowerCase() === "ativo";


const card =
    document.createElement("div");


card.className =
    "cartao-card";


card.innerHTML = `

    <div class="cartao-topo">

        <div class="cartao-icone">
            💳
        </div>

        <span class="status ${statusAtivo ? "ativo" : "inativo"}">
            ${cartao.status || "Ativo"}
        </span>

    </div>


    <div class="cartao-numero">

        <span>
            ${cartao.nome || "Cartão"}
        </span>

        <strong>
            •••• ${cartao.final || "----"}
        </strong>

    </div>


    <div class="cartao-dados">

        <div>

            <span>
                Instituição
            </span>

            <strong>
                ${cartao.instituicao || "-"}
            </strong>

        </div>


        <div>

            <span>
                Limite
            </span>

            <strong>
                ${formatarMoeda(cartao.limite)}
            </strong>

        </div>

    </div>


    <div class="cartao-rodape">

        <span>
            Cartão de crédito
        </span>

        <button
            type="button"
            class="btn-perigo btn-excluir-cartao"
        >
            Excluir cartão
        </button>

    </div>

`;


const btnExcluir =
    card.querySelector(".btn-excluir-cartao");


if (btnExcluir) {

    btnExcluir.addEventListener(
        "click",
        function () {

            excluirCartao(cartao.id);

        }
    );
}


cartoesGrid.appendChild(card);

}

/* ============================================================
EXCLUIR CONTA
============================================================ */

function excluirConta(id) {

const contas =
    carregarContasDoStorage();


const conta =
    contas.find(function (item) {

        return String(item.id) === String(id);

    });


if (!conta) {

    alert("Conta não encontrada.");

    return;
}


const confirmou =
    confirm(
        `Deseja realmente excluir a conta "${conta.nome}"?`
    );


if (!confirmou) {

    return;
}


const novasContas =
    contas.filter(function (item) {

        return String(item.id) !== String(id);

    });


localStorage.setItem(
    CHAVE_CONTAS,
    JSON.stringify(novasContas)
);


carregarContas();


alert(
    "Conta excluída com sucesso."
);

}

/* ============================================================
EXCLUIR CARTÃO
============================================================ */

function excluirCartao(id) {

const cartoes =
    carregarCartoesDoStorage();


const cartao =
    cartoes.find(function (item) {

        return String(item.id) === String(id);

    });


if (!cartao) {

    alert("Cartão não encontrado.");

    return;
}


const confirmou =
    confirm(
        `Deseja realmente excluir o cartão "${cartao.nome}"?`
    );


if (!confirmou) {

    return;
}


const novosCartoes =
    cartoes.filter(function (item) {

        return String(item.id) !== String(id);

    });


localStorage.setItem(
    CHAVE_CARTOES,
    JSON.stringify(novosCartoes)
);


carregarCartoes();


alert(
    "Cartão excluído com sucesso."
);

}

/* ============================================================
CONFIGURAR BOTÕES
============================================================ */

function configurarBotoes() {

const btnNovaConta =
    document.getElementById("btnNovaConta");


if (btnNovaConta) {

    btnNovaConta.addEventListener(
        "click",
        function () {

            abrirModalConta();

        }
    );
}


const btnNovoCartao =
    document.getElementById("btnNovoCartao");


if (btnNovoCartao) {

    btnNovoCartao.addEventListener(
        "click",
        function () {

            abrirModalCartao();

        }
    );
}

}

/* ============================================================
INICIALIZAÇÃO
============================================================ */

document.addEventListener(
"DOMContentLoaded",
function () {

    carregarContas();

    carregarCartoes();

    configurarBotoes();

}

);