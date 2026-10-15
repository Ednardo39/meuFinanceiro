/* ============================================================
   MEU FINANCEIRO
   CONTAS E CARTÕES
   ============================================================ */

"use strict";

/* ============================================================
   CONFIGURAÇÃO E CHAVES DO LOCALSTORAGE
   ============================================================ */

const CHAVE_CONTAS = "contasFinanceiras";
const CHAVE_CARTOES = "cartoesFinanceiros";
const CHAVE_MOVIMENTACOES = "movimentacoesContas";

/* ============================================================
   LEITURA SEGURA DO LOCALSTORAGE
   ============================================================ */

function lerArrayDoStorage(chave) {
    try {
        const dados = localStorage.getItem(chave);

        if (!dados) {
            return [];
        }

        const resultado = JSON.parse(dados);

        if (!Array.isArray(resultado)) {
            console.error(
                `O conteúdo de "${chave}" não é uma lista válida.`
            );

            return [];
        }

        return resultado;
    } catch (erro) {
        console.error(`Erro ao ler "${chave}":`, erro);
        return [];
    }
}

function carregarContasDoStorage() {
    return lerArrayDoStorage(CHAVE_CONTAS);
}

function carregarCartoesDoStorage() {
    return lerArrayDoStorage(CHAVE_CARTOES);
}

function carregarMovimentacoesDoStorage() {
    return lerArrayDoStorage(CHAVE_MOVIMENTACOES);
}

/* ============================================================
   SALVAR DADOS
   ============================================================ */

function salvarDadosNoStorage(chave, dados) {
    try {
        localStorage.setItem(chave, JSON.stringify(dados));
        return true;
    } catch (erro) {
        console.error(`Erro ao salvar "${chave}":`, erro);

        alert(
            "Não foi possível salvar os dados. " +
            "Verifique o espaço disponível no navegador."
        );

        return false;
    }
}

function salvarContas(contas) {
    return salvarDadosNoStorage(CHAVE_CONTAS, contas);
}

function salvarCartoes(cartoes) {
    return salvarDadosNoStorage(CHAVE_CARTOES, cartoes);
}

/* ============================================================
   UTILITÁRIOS
   ============================================================ */

function formatarMoeda(valor) {
    const numero = Number(valor);

    return (Number.isFinite(numero) ? numero : 0).toLocaleString(
        "pt-BR",
        {
            style: "currency",
            currency: "BRL"
        }
    );
}

function converterParaNumero(valor) {
    if (typeof valor === "number") {
        return Number.isFinite(valor) ? valor : 0;
    }

    if (valor === null || valor === undefined || valor === "") {
        return 0;
    }

    let texto = String(valor).trim();

    texto = texto.replace(/\s/g, "");
    texto = texto.replace(/R\$/gi, "");

    if (texto.includes(",")) {
        texto = texto.replace(/\./g, "");
        texto = texto.replace(",", ".");
    }

    const numero = Number(texto);

    return Number.isFinite(numero) ? numero : 0;
}

function arredondarCentavos(valor) {
    return Math.round((valor + Number.EPSILON) * 100) / 100;
}

function gerarId() {
    return String(Date.now()) +
        String(Math.floor(Math.random() * 100000));
}

function escaparHTML(valor) {
    return String(valor ?? "").replace(/[&<>"']/g, function (caractere) {
        const substituicoes = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return substituicoes[caractere];
    });
}

/* ============================================================
   CÁLCULO DO SALDO DA CONTA

   Regra:
   saldo inicial + entradas - saídas.

   O saldo é calculado pelo histórico de movimentações.
   O campo saldoAtual é sincronizado com esse resultado.
   ============================================================ */

function calcularSaldoConta(conta) {
    if (!conta) {
        return 0;
    }

    const saldoInicial = converterParaNumero(conta.saldoInicial);
    const movimentacoes = carregarMovimentacoesDoStorage();

    let entradas = 0;
    let saidas = 0;

    movimentacoes.forEach(function (movimentacao) {
        if (
            String(movimentacao.conta ?? "") !==
            String(conta.id ?? "")
        ) {
            return;
        }

        const valor = Math.abs(
            converterParaNumero(movimentacao.valor)
        );

        if (movimentacao.tipo === "entrada") {
            entradas += valor;
        } else if (movimentacao.tipo === "saida") {
            saidas += valor;
        }
    });

    return arredondarCentavos(
        saldoInicial + entradas - saidas
    );
}

/* ============================================================
   SINCRONIZAR SALDOS SALVOS

   Não cria movimentações.
   Não altera o saldo inicial.
   Apenas atualiza saldoAtual conforme o histórico existente.
   ============================================================ */

function sincronizarSaldosContas() {
    const contas = carregarContasDoStorage();

    if (contas.length === 0) {
        return;
    }

    let houveAlteracao = false;

    contas.forEach(function (conta) {
        const saldoCalculado = calcularSaldoConta(conta);
        const saldoSalvo = converterParaNumero(conta.saldoAtual);

        if (
            !Number.isFinite(Number(conta.saldoAtual)) ||
            arredondarCentavos(saldoSalvo) !== saldoCalculado
        ) {
            conta.saldoAtual = saldoCalculado;
            houveAlteracao = true;
        }
    });

    if (houveAlteracao) {
        salvarContas(contas);
    }
}

/* ============================================================
   CARREGAR CONTAS NA TELA
   ============================================================ */

function carregarContas() {
    const contasGrid = document.querySelector(".contas-grid");

    if (!contasGrid) {
        // A página atual pode não ser a página de contas.
        return;
    }

    const contas = carregarContasDoStorage();

    contasGrid.innerHTML = "";

    if (contas.length === 0) {
        contasGrid.innerHTML = `
            <div class="mensagem-vazia">
                <p>Nenhuma conta cadastrada.</p>
            </div>
        `;

        return;
    }

    // Calcula e sincroniza os saldos antes de desenhar os cartões.
    contas.forEach(function (conta) {
        conta.saldoAtual = calcularSaldoConta(conta);
    });

    salvarContas(contas);

    contas.forEach(function (conta) {
        adicionarContaNaTela(conta);
    });
}

/* ============================================================
   CRIAR CARTÃO VISUAL DA CONTA
   ============================================================ */

function adicionarContaNaTela(conta) {
    const contasGrid = document.querySelector(".contas-grid");

    if (!contasGrid || !conta) {
        return;
    }

    const saldoAtual = calcularSaldoConta(conta);
    const status = conta.status || "Ativa";
    const statusAtivo = status.toLowerCase() === "ativa";

    const card = document.createElement("article");
    card.className = "conta-card";

    card.innerHTML = `
        <div class="conta-topo">
            <div class="conta-icone">
                💰
            </div>

            <span class="status ${statusAtivo ? "ativo" : "inativo"}">
                ${escaparHTML(status)}
            </span>
        </div>

        <div class="conta-info">
            <h3>${escaparHTML(conta.nome || "Conta")}</h3>
            <p>${escaparHTML(conta.instituicao || "")}</p>
            <p>${escaparHTML(conta.tipo || "")}</p>
        </div>

        <div class="conta-saldo">
            <span>Saldo disponível</span>
            <strong>${formatarMoeda(saldoAtual)}</strong>
        </div>

        <div class="conta-acoes">
            <button
                class="btn-secundario btn-ver-conta"
                type="button"
            >
                Ver conta
            </button>

            <button
                class="btn-secundario btn-excluir-conta"
                type="button"
            >
                Excluir conta
            </button>
        </div>
    `;

    const btnVer = card.querySelector(".btn-ver-conta");
    const btnExcluir = card.querySelector(".btn-excluir-conta");

    btnVer.addEventListener("click", function () {
        abrirDetalhesConta(conta.id);
    });

    btnExcluir.addEventListener("click", function () {
        excluirConta(conta.id);
    });

    contasGrid.appendChild(card);
}

/* ============================================================
   DETALHES DA CONTA
   ============================================================ */

function abrirDetalhesConta(id) {
    const contas = carregarContasDoStorage();

    const conta = contas.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!conta) {
        alert("Não foi possível encontrar esta conta.");
        return;
    }

    const saldoAtual = calcularSaldoConta(conta);

    const modal = document.createElement("div");
    modal.className = "modal-fundo";

    modal.innerHTML = `
        <div class="modal">
            <div class="modal-cabecalho">
                <div>
                    <h2>${escaparHTML(conta.nome || "Conta")}</h2>
                    <p>Detalhes da conta</p>
                </div>

                <button
                    type="button"
                    class="modal-fechar"
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <div class="detalhes-conta">
                <p>
                    <strong>Instituição:</strong>
                    ${escaparHTML(conta.instituicao || "-")}
                </p>

                <p>
                    <strong>Tipo:</strong>
                    ${escaparHTML(conta.tipo || "-")}
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
                    ${escaparHTML(conta.status || "-")}
                </p>

                <p>
                    <strong>Observação:</strong>
                    ${escaparHTML(conta.observacao || "Nenhuma observação")}
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    configurarFechamentoModal(modal);
}

/* ============================================================
   MODAL: NOVA CONTA
   ============================================================ */

function abrirModalConta() {
    const modal = document.createElement("div");
    modal.className = "modal-fundo";

    modal.innerHTML = `
        <div class="modal">
            <div class="modal-cabecalho">
                <div>
                    <h2>Nova conta</h2>
                    <p>Cadastre uma conta financeira.</p>
                </div>

                <button
                    type="button"
                    class="modal-fechar"
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <form id="formNovaConta">
                <div class="form-group">
                    <label for="nomeConta">Nome da conta</label>
                    <input
                        type="text"
                        id="nomeConta"
                        placeholder="Ex.: Conta principal"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="instituicaoConta">Instituição</label>
                    <input
                        type="text"
                        id="instituicaoConta"
                        placeholder="Ex.: Caixa Econômica"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="tipoConta">Tipo de conta</label>
                    <select id="tipoConta" required>
                        <option value="">Selecione o tipo</option>
                        <option value="Conta corrente">Conta corrente</option>
                        <option value="Conta poupança">Conta poupança</option>
                        <option value="Conta de pagamento">Conta de pagamento</option>
                        <option value="Carteira">Carteira</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="saldoInicial">Saldo inicial (R$)</label>
                    <input
                        type="number"
                        id="saldoInicial"
                        min="0"
                        step="0.01"
                        value="0"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="statusConta">Status</label>
                    <select id="statusConta">
                        <option value="Ativa">Ativa</option>
                        <option value="Inativa">Inativa</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="observacaoConta">Observação</label>
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

                    <button type="submit" class="btn-principal">
                        Salvar conta
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);
    configurarFechamentoModal(modal);

    const formulario = modal.querySelector("#formNovaConta");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = modal.querySelector("#nomeConta").value.trim();
        const instituicao = modal.querySelector("#instituicaoConta").value.trim();
        const tipo = modal.querySelector("#tipoConta").value;
        const saldoInicial = converterParaNumero(
            modal.querySelector("#saldoInicial").value
        );
        const status = modal.querySelector("#statusConta").value;
        const observacao = modal.querySelector("#observacaoConta").value.trim();

        if (!nome || !instituicao || !tipo) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (saldoInicial < 0) {
            alert("O saldo inicial não pode ser negativo.");
            return;
        }

        const contas = carregarContasDoStorage();

        const novaConta = {
            id: gerarId(),
            nome: nome,
            instituicao: instituicao,
            tipo: tipo,
            saldoInicial: arredondarCentavos(saldoInicial),
            saldoAtual: arredondarCentavos(saldoInicial),
            status: status,
            observacao: observacao
        };

        contas.push(novaConta);

        if (!salvarContas(contas)) {
            return;
        }

        modal.remove();
        carregarContas();

        alert("Conta cadastrada com sucesso!");
    });
}

/* ============================================================
   EXCLUIR CONTA
   ============================================================ */

function excluirConta(id) {
    const contas = carregarContasDoStorage();

    const conta = contas.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!conta) {
        alert("Conta não encontrada.");
        return;
    }

    const confirmou = confirm(
        `Deseja realmente excluir a conta "${conta.nome}"?`
    );

    if (!confirmou) {
        return;
    }

    // Não apaga movimentações nem pagamentos vinculados.
    // Isso preserva o histórico financeiro.
    const novasContas = contas.filter(function (item) {
        return String(item.id) !== String(id);
    });

    if (!salvarContas(novasContas)) {
        return;
    }

    carregarContas();
    carregarCartoes();

    alert(
        "Conta excluída. O histórico de movimentações foi preservado."
    );
}

/* ============================================================
   CARREGAR CARTÕES NA TELA
   ============================================================ */

function carregarCartoes() {
    const cartoesGrid = document.querySelector(".cartoes-grid");

    if (!cartoesGrid) {
        return;
    }

    const cartoes = carregarCartoesDoStorage();

    cartoesGrid.innerHTML = "";

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
   CRIAR CARTÃO VISUAL DO CARTÃO
   ============================================================ */

function adicionarCartaoNaTela(cartao) {
    const cartoesGrid = document.querySelector(".cartoes-grid");

    if (!cartoesGrid || !cartao) {
        return;
    }

    const status = cartao.status || "Ativo";
    const statusAtivo = status.toLowerCase() === "ativo";

    const contaVinculada = obterNomeContaVinculada(cartao.conta);

    const card = document.createElement("article");
    card.className = "cartao-card";

    card.innerHTML = `
        <div class="cartao-topo">
            <div class="cartao-icone">
                💳
            </div>

            <span class="status ${statusAtivo ? "ativo" : "inativo"}">
                ${escaparHTML(status)}
            </span>
        </div>

        <div class="cartao-info">
            <h3>${escaparHTML(cartao.nome || "Cartão")}</h3>
            <p>${escaparHTML(cartao.instituicao || "")}</p>
            <p>Final ${escaparHTML(cartao.final || "----")}</p>
            <p>Conta: ${escaparHTML(contaVinculada)}</p>
        </div>

        <div class="cartao-limite">
            <span>Limite</span>
            <strong>${formatarMoeda(cartao.limite)}</strong>
        </div>

        <div class="cartao-datas">
            <p>Fechamento: ${escaparHTML(cartao.fechamento || "-")}</p>
            <p>Vencimento: ${escaparHTML(cartao.vencimento || "-")}</p>
        </div>

        <div class="cartao-acoes">
            <button
                type="button"
                class="btn-secundario btn-detalhes-cartao"
            >
                Ver cartão
            </button>

            <button
                type="button"
                class="btn-secundario btn-excluir-cartao"
            >
                Excluir cartão
            </button>
        </div>
    `;

    card.querySelector(".btn-detalhes-cartao").addEventListener(
        "click",
        function () {
            abrirDetalhesCartao(cartao.id);
        }
    );

    card.querySelector(".btn-excluir-cartao").addEventListener(
        "click",
        function () {
            excluirCartao(cartao.id);
        }
    );

    cartoesGrid.appendChild(card);
}

/* ============================================================
   NOME DA CONTA VINCULADA AO CARTÃO

   Aceita tanto IDs quanto nomes antigos salvos no campo conta.
   ============================================================ */

function obterNomeContaVinculada(valorConta) {
    if (!valorConta) {
        return "Não informada";
    }

    const contas = carregarContasDoStorage();

    const conta = contas.find(function (item) {
        return (
            String(item.id) === String(valorConta) ||
            String(item.nome || "").toLowerCase() ===
                String(valorConta).toLowerCase()
        );
    });

    if (conta) {
        return `${conta.nome} - ${conta.instituicao || ""}`;
    }

    // Preserva a informação de cartões antigos cujo vínculo
    // foi salvo como texto em vez de ID.
    return String(valorConta);
}

/* ============================================================
   CARREGAR CONTAS NO SELECT DO CARTÃO
   ============================================================ */

function carregarContasNoSelect(modal) {
    const select = modal.querySelector("#contaVinculada");

    if (!select) {
        return;
    }

    select.innerHTML = "";

    const contas = carregarContasDoStorage();

    if (contas.length === 0) {
        const opcao = document.createElement("option");

        opcao.value = "";
        opcao.textContent = "Nenhuma conta cadastrada";

        select.appendChild(opcao);
        select.disabled = true;

        return;
    }

    select.disabled = false;

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = "Selecione a conta";

    select.appendChild(opcaoInicial);

    contas.forEach(function (conta) {
        const opcao = document.createElement("option");

        opcao.value = String(conta.id);
        opcao.textContent =
            `${conta.nome} - ${conta.instituicao || ""}`;

        select.appendChild(opcao);
    });
}

/* ============================================================
   MODAL: NOVO CARTÃO
   ============================================================ */

function abrirModalCartao() {
    const modal = document.createElement("div");
    modal.className = "modal-fundo";

    modal.innerHTML = `
        <div class="modal">
            <div class="modal-cabecalho">
                <div>
                    <h2>Novo cartão</h2>
                    <p>Cadastre um novo cartão.</p>
                </div>

                <button
                    type="button"
                    class="modal-fechar"
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <form id="formNovoCartao">
                <div class="form-group">
                    <label for="nomeCartao">Nome do cartão</label>
                    <input
                        type="text"
                        id="nomeCartao"
                        placeholder="Ex.: Cartão principal"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="instituicaoCartao">Instituição</label>
                    <input
                        type="text"
                        id="instituicaoCartao"
                        placeholder="Ex.: Caixa Econômica"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="contaVinculada">Conta vinculada</label>
                    <select id="contaVinculada" required></select>
                </div>

                <div class="form-group">
                    <label for="finalCartao">Últimos quatro dígitos</label>
                    <input
                        type="text"
                        id="finalCartao"
                        maxlength="4"
                        inputmode="numeric"
                        pattern="[0-9]{4}"
                        placeholder="1234"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="limiteCartao">Limite (R$)</label>
                    <input
                        type="number"
                        id="limiteCartao"
                        min="0"
                        step="0.01"
                        value="0"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="fechamentoCartao">Dia de fechamento</label>
                    <input
                        type="number"
                        id="fechamentoCartao"
                        min="1"
                        max="31"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="vencimentoCartao">Dia de vencimento</label>
                    <input
                        type="number"
                        id="vencimentoCartao"
                        min="1"
                        max="31"
                        required
                    >
                </div>

                <div class="form-group">
                    <label for="statusCartao">Status</label>
                    <select id="statusCartao">
                        <option value="Ativo">Ativo</option>
                        <option value="Inativo">Inativo</option>
                    </select>
                </div>

                <div class="form-group">
                    <label for="observacaoCartao">Observação</label>
                    <textarea
                        id="observacaoCartao"
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

                    <button type="submit" class="btn-principal">
                        Salvar cartão
                    </button>
                </div>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    configurarFechamentoModal(modal);
    carregarContasNoSelect(modal);

    const formulario = modal.querySelector("#formNovoCartao");

    formulario.addEventListener("submit", function (event) {
        event.preventDefault();

        const nome = modal.querySelector("#nomeCartao").value.trim();
        const instituicao = modal.querySelector("#instituicaoCartao").value.trim();
        const conta = modal.querySelector("#contaVinculada").value;
        const final = modal.querySelector("#finalCartao").value.trim();
        const limite = converterParaNumero(
            modal.querySelector("#limiteCartao").value
        );
        const fechamento = modal.querySelector("#fechamentoCartao").value;
        const vencimento = modal.querySelector("#vencimentoCartao").value;
        const status = modal.querySelector("#statusCartao").value;
        const observacao = modal.querySelector("#observacaoCartao").value.trim();

        if (!nome || !instituicao || !conta || !final) {
            alert("Preencha os campos obrigatórios.");
            return;
        }

        if (!/^\d{4}$/.test(final)) {
            alert("Informe os quatro últimos dígitos do cartão.");
            return;
        }

        if (limite < 0) {
            alert("O limite não pode ser negativo.");
            return;
        }

        const diaFechamento = Number(fechamento);
        const diaVencimento = Number(vencimento);

        if (
            diaFechamento < 1 || diaFechamento > 31 ||
            diaVencimento < 1 || diaVencimento > 31
        ) {
            alert("Os dias de fechamento e vencimento devem estar entre 1 e 31.");
            return;
        }

        const cartoes = carregarCartoesDoStorage();

        const novoCartao = {
            id: gerarId(),
            nome: nome,
            instituicao: instituicao,
            conta: String(conta),
            final: final,
            limite: arredondarCentavos(limite),
            fechamento: diaFechamento,
            vencimento: diaVencimento,
            status: status,
            observacao: observacao
        };

        cartoes.push(novoCartao);

        if (!salvarCartoes(cartoes)) {
            return;
        }

        modal.remove();
        carregarCartoes();

        alert("Cartão cadastrado com sucesso!");
    });
}

/* ============================================================
   DETALHES DO CARTÃO
   ============================================================ */

function abrirDetalhesCartao(id) {
    const cartoes = carregarCartoesDoStorage();

    const cartao = cartoes.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!cartao) {
        alert("Cartão não encontrado.");
        return;
    }

    const modal = document.createElement("div");
    modal.className = "modal-fundo";

    modal.innerHTML = `
        <div class="modal">
            <div class="modal-cabecalho">
                <div>
                    <h2>${escaparHTML(cartao.nome || "Cartão")}</h2>
                    <p>Detalhes do cartão</p>
                </div>

                <button
                    type="button"
                    class="modal-fechar"
                    aria-label="Fechar"
                >
                    &times;
                </button>
            </div>

            <div class="detalhes-cartao">
                <p>
                    <strong>Instituição:</strong>
                    ${escaparHTML(cartao.instituicao || "-")}
                </p>

                <p>
                    <strong>Final do cartão:</strong>
                    ${escaparHTML(cartao.final || "----")}
                </p>

                <p>
                    <strong>Conta vinculada:</strong>
                    ${escaparHTML(obterNomeContaVinculada(cartao.conta))}
                </p>

                <p>
                    <strong>Limite:</strong>
                    ${formatarMoeda(cartao.limite)}
                </p>

                <p>
                    <strong>Fechamento:</strong>
                    ${escaparHTML(cartao.fechamento || "-")}
                </p>

                <p>
                    <strong>Vencimento:</strong>
                    ${escaparHTML(cartao.vencimento || "-")}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${escaparHTML(cartao.status || "-")}
                </p>

                <p>
                    <strong>Observação:</strong>
                    ${escaparHTML(cartao.observacao || "Nenhuma observação")}
                </p>
            </div>
        </div>
    `;

    document.body.appendChild(modal);
    configurarFechamentoModal(modal);
}

/* ============================================================
   EXCLUIR CARTÃO
   ============================================================ */

function excluirCartao(id) {
    const cartoes = carregarCartoesDoStorage();

    const cartao = cartoes.find(function (item) {
        return String(item.id) === String(id);
    });

    if (!cartao) {
        alert("Cartão não encontrado.");
        return;
    }

    const confirmou = confirm(
        `Deseja realmente excluir o cartão "${cartao.nome}"?`
    );

    if (!confirmou) {
        return;
    }

    // Não apaga compras, faturas ou pagamentos históricos.
    const novosCartoes = cartoes.filter(function (item) {
        return String(item.id) !== String(id);
    });

    if (!salvarCartoes(novosCartoes)) {
        return;
    }

    carregarCartoes();

    alert(
        "Cartão excluído. O histórico financeiro foi preservado."
    );
}

/* ============================================================
   FECHAMENTO DOS MODAIS
   ============================================================ */

function configurarFechamentoModal(modal) {
    const btnFechar = modal.querySelector(".modal-fechar");
    const btnCancelar = modal.querySelector(".btn-cancelar-modal");

    if (btnFechar) {
        btnFechar.addEventListener("click", function () {
            modal.remove();
        });
    }

    if (btnCancelar) {
        btnCancelar.addEventListener("click", function () {
            modal.remove();
        });
    }

    modal.addEventListener("click", function (event) {
        if (event.target === modal) {
            modal.remove();
        }
    });
}

/* ============================================================
   CONFIGURAR BOTÕES DA PÁGINA
   ============================================================ */

function configurarBotoes() {
    const btnNovaConta = document.getElementById("btnNovaConta");
    const btnNovoCartao = document.getElementById("btnNovoCartao");

    if (btnNovaConta && !btnNovaConta.dataset.eventoConfigurado) {
        btnNovaConta.dataset.eventoConfigurado = "true";

        btnNovaConta.addEventListener("click", function (event) {
            event.preventDefault();
            abrirModalConta();
        });
    }

    if (btnNovoCartao && !btnNovoCartao.dataset.eventoConfigurado) {
        btnNovoCartao.dataset.eventoConfigurado = "true";

        btnNovoCartao.addEventListener("click", function (event) {
            event.preventDefault();
            abrirModalCartao();
        });
    }

    // Compatibilidade com páginas que usam a classe .btn-principal.
    document.querySelectorAll(".btn-principal").forEach(function (botao) {
        if (
            botao.id === "btnNovaConta" ||
            botao.id === "btnNovoCartao" ||
            botao.dataset.eventoConfigurado
        ) {
            return;
        }

        const texto = botao.textContent.trim().toLowerCase();

        if (texto.includes("nova conta")) {
            botao.dataset.eventoConfigurado = "true";

            botao.addEventListener("click", function (event) {
                event.preventDefault();
                abrirModalConta();
            });
        } else if (texto.includes("novo cartão")) {
            botao.dataset.eventoConfigurado = "true";

            botao.addEventListener("click", function (event) {
                event.preventDefault();
                abrirModalCartao();
            });
        }
    });
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener("DOMContentLoaded", function () {
    // Só sincroniza os dados se houver contas e histórico disponíveis.
    sincronizarSaldosContas();

    carregarContas();
    carregarCartoes();
    configurarBotoes();
});