// ============================================================
// MEU FINANCEIRO
// CONTAS E CARTÕES
// ============================================================

// ============================================================
// CONFIGURAÇÃO
// ============================================================

const CHAVE_CONTAS = "contasFinanceiras";
const CHAVE_CARTOES = "cartoesFinanceiros";

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


texto = texto.replace(/\./g, "");

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
// OBTER CARTÕES SALVOS
// ============================================================

function obterCartoes() {

const cartoesSalvos =
    localStorage.getItem(CHAVE_CARTOES);


if (!cartoesSalvos) {
    return [];
}


try {

    const cartoes =
        JSON.parse(cartoesSalvos);


    if (!Array.isArray(cartoes)) {
        return [];
    }


    return cartoes;

} catch (erro) {

    console.error(
        "Erro ao carregar cartões:",
        erro
    );


    return [];

}

}

// ============================================================
// SALVAR CARTÕES
// ============================================================

function salvarCartoes(cartoes) {

localStorage.setItem(
    CHAVE_CARTOES,
    JSON.stringify(cartoes)
);

}

// ============================================================
// CARREGAR CONTAS
// ============================================================

function carregarContas() {

const contas =
    obterContas();


if (contas.length === 0) {
    return;
}


const gradeContas =
    document.querySelector(".contas-grid");


if (!gradeContas) {
    return;
}


gradeContas.innerHTML = "";


contas.forEach(function (conta) {

    adicionarContaNaTela(conta);

});

}

// ============================================================
// CARREGAR CARTÕES
// ============================================================

function carregarCartoes() {

const cartoes =
    obterCartoes();


if (cartoes.length === 0) {
    return;
}


const gradeCartoes =
    document.querySelector(".cartoes-grid");


if (!gradeCartoes) {
    return;
}


gradeCartoes.innerHTML = "";


cartoes.forEach(function (cartao) {

    adicionarCartaoNaTela(cartao);

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


modal
    .querySelector(".modal-fechar")
    .addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


modal
    .querySelector(".btn-modal-cancelar")
    .addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


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


            const saldo =
                converterParaNumero(
                    saldoTexto
                );


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


            const contas =
                obterContas();


            contas.push(
                novaConta
            );


            salvarContas(
                contas
            );


            adicionarContaNaTela(
                novaConta
            );


            modal.remove();


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


    <button
        class="btn-excluir-conta"
        type="button"
    >
        Excluir conta
    </button>

`;


gradeContas.appendChild(
    elemento
);


const botaoExcluir =
    elemento.querySelector(
        ".btn-excluir-conta"
    );


botaoExcluir.addEventListener(
    "click",
    function () {

        excluirConta(conta.id);

    }
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


if (contas.length === 0) {

    const opcao =
        document.createElement("option");


    opcao.value = "";


    opcao.textContent =
        "Nenhuma conta cadastrada";


    select.appendChild(
        opcao
    );


    return;

}


contas.forEach(function (conta) {

    const opcao =
        document.createElement("option");


    opcao.value =
        conta.id;


    opcao.textContent =
        conta.nome +
        " - " +
        conta.instituicao;


    select.appendChild(
        opcao
    );

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


document.body.appendChild(
    modal
);


carregarContasNoSelect(
    modal
);


modal
    .querySelector(".modal-fechar")
    .addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


modal
    .querySelector(".btn-modal-cancelar")
    .addEventListener(
        "click",
        function () {

            modal.remove();

        }
    );


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


            const cartoes =
                obterCartoes();


            cartoes.push(
                novoCartao
            );


            salvarCartoes(
                cartoes
            );


            adicionarCartaoNaTela(
                novoCartao
            );


            modal.remove();

        }
    );

}

// ============================================================
// ADICIONAR CARTÃO NA TELA
// ============================================================

function adicionarCartaoNaTela(cartao) {

const gradeCartoes =
    document.querySelector(".cartoes-grid");


if (!gradeCartoes) {
    return;
}


const elemento =
    document.createElement("div");


elemento.className =
    "cartao-card";


elemento.innerHTML = `

    <div class="cartao-topo">

        <div>

            <span class="cartao-tipo">
                CRÉDITO
            </span>

            <h3>
                ${cartao.nome}
            </h3>

        </div>


        <span class="cartao-chip">
            ▣
        </span>

    </div>


    <div class="cartao-numero">

        •••• •••• •••• ${cartao.final}

    </div>


    <div class="cartao-dados">

        <div>

            <span>
                Limite
            </span>

            <strong>
                ${formatarMoeda(cartao.limite)}
            </strong>

        </div>


        <div>

            <span>
                Disponível
            </span>

            <strong>
                ${formatarMoeda(cartao.limite)}
            </strong>

        </div>

    </div>


    <div class="cartao-rodape">

        <span>
            Fecha dia ${cartao.fechamento}
        </span>

        <span>
            Vence dia ${cartao.vencimento}
        </span>

    </div>


    <button
        class="btn-excluir-cartao"
        type="button"
    >
        Excluir cartão
    </button>

`;


gradeCartoes.appendChild(
    elemento
);


// ========================================================
// BOTÃO EXCLUIR CARTÃO
// ========================================================

const botaoExcluir =
    elemento.querySelector(
        ".btn-excluir-cartao"
    );


botaoExcluir.addEventListener(
    "click",
    function () {

        excluirCartao(
            cartao.id
        );

    }
);

}

// ============================================================
// VERIFICAR CONFIGURAÇÃO DE CONFIRMAÇÃO
// ============================================================

function deveConfirmarExclusao() {

const configuracoes =
    JSON.parse(
        localStorage.getItem("configuracoes")
    ) || {};


if (
    configuracoes.confirmarExclusao === undefined
) {

    return true;

}


return configuracoes.confirmarExclusao === true;

}

// ============================================================
// EXCLUIR CONTA
// ============================================================

function excluirConta(id) {

if (deveConfirmarExclusao()) {

    const confirmar = confirm(
        "Deseja realmente excluir esta conta?"
    );


    if (!confirmar) {

        return;

    }

}


let contas =
    obterContas();


contas =
    contas.filter(function (conta) {

        return String(conta.id) !== String(id);

    });


salvarContas(
    contas
);


const gradeContas =
    document.querySelector(".contas-grid");


if (gradeContas) {

    gradeContas.innerHTML = "";


    contas.forEach(function (conta) {

        adicionarContaNaTela(
            conta
        );

    });

}


alert(
    "Conta excluída com sucesso!"
);

}

// ============================================================
// EXCLUIR CARTÃO
// ============================================================

function excluirCartao(id) {

if (deveConfirmarExclusao()) {

    const confirmar = confirm(
        "Deseja realmente excluir este cartão?"
    );


    if (!confirmar) {

        return;

    }

}


let cartoes =
    obterCartoes();


cartoes =
    cartoes.filter(function (cartao) {

        return String(cartao.id) !== String(id);

    });


salvarCartoes(
    cartoes
);


const gradeCartoes =
    document.querySelector(".cartoes-grid");


if (gradeCartoes) {

    gradeCartoes.innerHTML = "";


    cartoes.forEach(function (cartao) {

        adicionarCartaoNaTela(
            cartao
        );

    });

}


alert(
    "Cartão excluído com sucesso!"
);

}