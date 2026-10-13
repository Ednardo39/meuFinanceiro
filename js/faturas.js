"use strict";

// ============================================================
// MEU FINANCEIRO
// MÓDULO DE FATURAS
// ============================================================

// Chaves já utilizadas pelo restante do sistema.
const CHAVE_CARTOES = "cartoesFinanceiros";
const CHAVE_CONTAS = "contasFinanceiras";
const CHAVE_COMPRAS = "compras";
const CHAVE_PAGAMENTOS = "pagamentosFaturas";
const CHAVE_MOVIMENTACOES = "movimentacoesContas";

// ============================================================
// ELEMENTOS HTML
// ============================================================

const cartaoSelect = document.querySelector("#cartao");
const mesSelect = document.querySelector("#mes");

const tituloFatura = document.querySelector("#tituloFatura");
const nomeCartao = document.querySelector("#nomeCartao");
const statusFatura = document.querySelector("#statusFatura");

const fechamento = document.querySelector("#fechamento");
const vencimento = document.querySelector("#vencimento");
const quantidadeCompras = document.querySelector("#quantidadeCompras");
const totalFatura = document.querySelector("#totalFatura");
const listaCompras = document.querySelector("#listaCompras");

const valorPagamento = document.querySelector("#valorPagamento");
const contaPagamento = document.querySelector("#contaPagamento");
const btnPagar = document.querySelector("#btnPagar");

const dadosPagamento = document.querySelector("#dadosPagamento");
const contaPagamentoInfo = document.querySelector("#contaPagamentoInfo");
const dataPagamentoInfo = document.querySelector("#dataPagamentoInfo");
const valorPagamentoInfo = document.querySelector("#valorPagamentoInfo");

const nomesMeses = [
    "Janeiro", "Fevereiro", "Março", "Abril",
    "Maio", "Junho", "Julho", "Agosto",
    "Setembro", "Outubro", "Novembro", "Dezembro"
];

// ============================================================
// INICIALIZAÇÃO SEGURA
// ============================================================

document.addEventListener("DOMContentLoaded", inicializarFaturas);

function inicializarFaturas() {
    const elementosObrigatorios = [
        cartaoSelect,
        mesSelect,
        tituloFatura,
        nomeCartao,
        statusFatura,
        fechamento,
        vencimento,
        quantidadeCompras,
        totalFatura,
        listaCompras,
        valorPagamento,
        contaPagamento,
        btnPagar,
        dadosPagamento,
        contaPagamentoInfo,
        dataPagamentoInfo,
        valorPagamentoInfo
    ];

    if (elementosObrigatorios.some(elemento => !elemento)) {
        console.error(
            "Faturas: faltam elementos HTML. Confira os IDs em faturas.html."
        );
        return;
    }

    cartaoSelect.addEventListener("change", atualizarFatura);
    mesSelect.addEventListener("change", atualizarFatura);
    btnPagar.addEventListener("click", pagarFatura);

    // Abre no mês atual, sem deixar uma data fixa no código.
    mesSelect.value = obterDataLocal().slice(0, 7);

    carregarCartoes();
    carregarContasPagamento();
    atualizarFatura();

    console.log("Faturas: módulo inicializado.");
}

// ============================================================
// LOCALSTORAGE
// ============================================================

function lerLista(chave) {
    try {
        const texto = localStorage.getItem(chave);

        if (!texto) {
            return [];
        }

        const dados = JSON.parse(texto);

        if (!Array.isArray(dados)) {
            console.error(
                `Faturas: o conteúdo de "${chave}" não é uma lista.`
            );
            return [];
        }

        return dados;
    } catch (erro) {
        console.error(`Erro ao ler "${chave}":`, erro);
        return [];
    }
}

function salvarLista(chave, lista) {
    localStorage.setItem(chave, JSON.stringify(lista));
}

function obterCartoes() {
    return lerLista(CHAVE_CARTOES);
}

function obterContas() {
    return lerLista(CHAVE_CONTAS);
}

function obterCompras() {
    return lerLista(CHAVE_COMPRAS);
}

function obterPagamentos() {
    return lerLista(CHAVE_PAGAMENTOS);
}

function obterMovimentacoes() {
    return lerLista(CHAVE_MOVIMENTACOES);
}

// ============================================================
// FORMATAÇÃO
// ============================================================

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

function converterMoedaParaNumero(texto) {
    if (typeof texto === "number") {
        return Number.isFinite(texto) ? texto : 0;
    }

    const valor = String(texto || "")
        .replace(/[^\d,.-]/g, "")
        .replace(/\./g, "")
        .replace(",", ".");

    const numero = Number(valor);

    return Number.isFinite(numero) ? numero : 0;
}

function formatarData(data) {
    if (!data) {
        return "--";
    }

    const texto = String(data).slice(0, 10);
    const partes = texto.split("-");

    if (partes.length !== 3) {
        return texto;
    }

    return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

function obterDataLocal() {
    const agora = new Date();

    const ano = agora.getFullYear();
    const mes = String(agora.getMonth() + 1).padStart(2, "0");
    const dia = String(agora.getDate()).padStart(2, "0");

    return `${ano}-${mes}-${dia}`;
}

function normalizar(texto) {
    return String(texto || "")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase()
        .replace(/[^a-z0-9]/g, "");
}

// ============================================================
// DATAS DE FECHAMENTO E VENCIMENTO
// ============================================================

function diasNoMes(ano, mesZeroBased) {
    return new Date(ano, mesZeroBased + 1, 0).getDate();
}

function dataDoDia(ano, mesZeroBased, dia) {
    const diaReal = Math.min(
        Math.max(Number(dia) || 1, 1),
        diasNoMes(ano, mesZeroBased)
    );

    return new Date(ano, mesZeroBased, diaReal);
}

function obterFechamento(cartao) {
    const dia = Number(cartao.fechamento);

    return Number.isFinite(dia) && dia >= 1 && dia <= 31
        ? dia
        : 1;
}

function obterVencimento(cartao) {
    const dia = Number(cartao.vencimento);

    return Number.isFinite(dia) && dia >= 1 && dia <= 31
        ? dia
        : 1;
}

// ============================================================
// IDENTIFICAÇÃO DE CARTÕES
// ============================================================

function obterCartaoSelecionado() {
    const id = cartaoSelect.value;

    if (!id) {
        return null;
    }

    return obterCartoes().find(
        cartao => String(cartao.id) === String(id)
    ) || null;
}

function nomeCompletoCartao(cartao) {
    const nome = cartao.nome || cartao.instituicao || "Cartão";
    const final = cartao.final ? ` •••• ${cartao.final}` : "";

    return `${nome}${final}`;
}

function cartaoEstaAtivo(cartao) {
    if (!cartao.status) {
        return true;
    }

    return normalizar(cartao.status) === "ativo" ||
           normalizar(cartao.status) === "ativa";
}

// ============================================================
// COMPATIBILIDADE COM COMPRAS E REGISTROS ANTIGOS
// ============================================================

function compraPertenceAoCartao(compra, cartaoAtual) {
    const identificadorCompra = normalizar(compra.cartao);
    const idAtual = normalizar(cartaoAtual.id);

    // Primeiro, tenta identificar pelo ID atual.
    if (identificadorCompra && identificadorCompra === idAtual) {
        return true;
    }

    const nomesAtuais = [
        cartaoAtual.nome,
        cartaoAtual.instituicao
    ].map(normalizar).filter(Boolean);

    // Compatibilidade com compras antigas que guardaram o nome.
    if (
        identificadorCompra &&
        nomesAtuais.includes(identificadorCompra)
    ) {
        return true;
    }

    // Compatibilidade com compras que guardaram o nome exibido,
    // por exemplo: "Caixa •••• 9012".
    const nomeSalvo = normalizar(compra.nomeCartao);

    if (
        nomeSalvo &&
        nomesAtuais.some(nome => nomeSalvo.includes(nome))
    ) {
        return true;
    }

    return false;
}

function registroPertenceAoCartao(registro, cartaoAtual) {
    const identificador = normalizar(registro.cartao);
    const idAtual = normalizar(cartaoAtual.id);

    if (identificador && identificador === idAtual) {
        return true;
    }

    const nomesAtuais = [
        cartaoAtual.nome,
        cartaoAtual.instituicao
    ].map(normalizar).filter(Boolean);

    if (identificador && nomesAtuais.includes(identificador)) {
        return true;
    }

    const nomeSalvo = normalizar(registro.nomeCartao);

    return Boolean(
        nomeSalvo &&
        nomesAtuais.some(nome => nomeSalvo.includes(nome))
    );
}

// ============================================================
// CARREGAR CARTÕES NO SELECT
// ============================================================

function carregarCartoes() {
    const valorAnterior = cartaoSelect.value;

    const cartoes = obterCartoes().filter(cartao =>
        cartao &&
        cartao.id !== undefined &&
        cartao.id !== null
    );

    cartaoSelect.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = cartoes.length
        ? "Selecione um cartão"
        : "Nenhum cartão cadastrado";

    cartaoSelect.appendChild(opcaoInicial);

    cartoes.forEach(cartao => {
        const opcao = document.createElement("option");

        opcao.value = String(cartao.id);
        opcao.textContent = nomeCompletoCartao(cartao);

        cartaoSelect.appendChild(opcao);
    });

    if (cartoes.some(cartao => String(cartao.id) === valorAnterior)) {
        cartaoSelect.value = valorAnterior;
    } else if (cartoes.length > 0) {
        cartaoSelect.value = String(cartoes[0].id);
    }

    cartaoSelect.disabled = cartoes.length === 0;
}

// ============================================================
// CARREGAR CONTAS ATIVAS PARA PAGAMENTO
// ============================================================

function contaEstaAtiva(conta) {
    if (!conta.status) {
        return true;
    }

    return normalizar(conta.status) === "ativa" ||
           normalizar(conta.status) === "ativo";
}

function carregarContasPagamento() {
    const valorAnterior = contaPagamento.value;

    const contas = obterContas().filter(conta =>
        conta &&
        conta.id !== undefined &&
        conta.id !== null &&
        contaEstaAtiva(conta)
    );

    contaPagamento.innerHTML = "";

    const opcaoInicial = document.createElement("option");
    opcaoInicial.value = "";
    opcaoInicial.textContent = contas.length
        ? "Selecione a conta"
        : "Nenhuma conta ativa";

    contaPagamento.appendChild(opcaoInicial);

    contas.forEach(conta => {
        const opcao = document.createElement("option");

        opcao.value = String(conta.id);

        const nome = conta.nome || "Conta sem nome";
        const instituicao = conta.instituicao
            ? ` - ${conta.instituicao}`
            : "";

        opcao.textContent = `${nome}${instituicao}`;

        contaPagamento.appendChild(opcao);
    });

    if (contas.some(conta => String(conta.id) === valorAnterior)) {
        contaPagamento.value = valorAnterior;
    }

    contaPagamento.disabled = contas.length === 0;
}

// ============================================================
// CALCULAR A PRIMEIRA FATURA DA COMPRA
// ============================================================

function calcularPrimeiraFatura(dataTexto, diaFechamento) {
    if (!dataTexto) {
        return null;
    }

    const partes = String(dataTexto).slice(0, 10).split("-");

    if (partes.length !== 3) {
        return null;
    }

    let ano = Number(partes[0]);
    let mes = Number(partes[1]) - 1;
    const dia = Number(partes[2]);

    if (
        !ano ||
        mes < 0 ||
        mes > 11 ||
        !dia ||
        dia < 1 ||
        dia > 31
    ) {
        return null;
    }

    // Compra após o fechamento entra na fatura do mês seguinte.
    if (dia > diaFechamento) {
        mes++;

        if (mes > 11) {
            mes = 0;
            ano++;
        }
    }

    return { ano, mes };
}

// ============================================================
// DIVIDIR PARCELAS EM CENTAVOS
// ============================================================

function calcularParcelas(valorTotal, quantidade) {
    const quantidadeSegura = Math.max(
        1,
        Math.min(600, Math.floor(Number(quantidade) || 1))
    );

    const totalCentavos = Math.round(
        (Number(valorTotal) || 0) * 100
    );

    const base = Math.floor(totalCentavos / quantidadeSegura);
    const resto = totalCentavos % quantidadeSegura;

    const parcelas = [];

    for (let i = 0; i < quantidadeSegura; i++) {
        let centavos = base;

        // Distribui os centavos restantes sem perder valor.
        if (i >= quantidadeSegura - resto) {
            centavos++;
        }

        parcelas.push(centavos / 100);
    }

    return parcelas;
}

// ============================================================
// LOCALIZAR PAGAMENTO E MOVIMENTAÇÃO DA FATURA
// ============================================================

function pagamentoPertenceAEstaFatura(pagamento, cartaoAtual, mesFatura) {
    const mesSalvo = pagamento.mes || pagamento.mesFatura;

    return (
        String(mesSalvo) === String(mesFatura) &&
        registroPertenceAoCartao(pagamento, cartaoAtual)
    );
}

function movimentacaoPertenceAEstaFatura(
    movimento,
    cartaoAtual,
    mesFatura
) {
    return (
        normalizar(movimento.origem) === "fatura" &&
        String(movimento.mesFatura || "") === String(mesFatura) &&
        registroPertenceAoCartao(movimento, cartaoAtual)
    );
}

function encontrarPagamento(cartaoAtual, mesFatura) {
    return obterPagamentos().find(pagamento =>
        pagamentoPertenceAEstaFatura(
            pagamento,
            cartaoAtual,
            mesFatura
        )
    ) || null;
}

function encontrarMovimentacaoFatura(cartaoAtual, mesFatura) {
    return obterMovimentacoes().find(movimento =>
        movimentacaoPertenceAEstaFatura(
            movimento,
            cartaoAtual,
            mesFatura
        )
    ) || null;
}

// Considera a fatura paga se existir o registro de pagamento OU
// uma movimentação antiga de pagamento já gravada.
// Isso evita debitar novamente uma fatura com registros incompletos.
function faturaFoiPaga(cartaoAtual, mesFatura) {
    return Boolean(
        encontrarPagamento(cartaoAtual, mesFatura) ||
        encontrarMovimentacaoFatura(cartaoAtual, mesFatura)
    );
}

// ============================================================
// EXIBIR OS DADOS DO PAGAMENTO
// ============================================================

function obterNomeConta(idConta, nomeSalvo) {
    const conta = obterContas().find(
        item => String(item.id) === String(idConta)
    );

    if (conta) {
        const nome = conta.nome || "Conta";
        const instituicao = conta.instituicao
            ? ` - ${conta.instituicao}`
            : "";

        return `${nome}${instituicao}`;
    }

    return nomeSalvo || String(idConta || "Conta não identificada");
}

function atualizarDadosPagamento(cartaoAtual, mesFatura) {
    const pagamento = encontrarPagamento(cartaoAtual, mesFatura);
    const movimentacao = encontrarMovimentacaoFatura(
        cartaoAtual,
        mesFatura
    );

    // O registro principal é o pagamento. Se ele não existir, usa
    // a movimentação para reconhecer um pagamento já registrado.
    const registro = pagamento || movimentacao;

    if (!registro) {
        dadosPagamento.style.display = "none";
        contaPagamentoInfo.textContent = "-";
        dataPagamentoInfo.textContent = "-";
        valorPagamentoInfo.textContent = formatarMoeda(0);
        return;
    }

    const idConta = pagamento
        ? pagamento.contaPagamento
        : movimentacao.conta;

    const nomeContaSalvo = pagamento
        ? pagamento.nomeContaPagamento
        : movimentacao.nomeContaPagamento;

    const dataSalva = pagamento
        ? pagamento.dataPagamento
        : movimentacao.data;

    const valorSalvo = pagamento
        ? pagamento.valor
        : movimentacao.valor;

    dadosPagamento.style.display = "block";

    contaPagamentoInfo.textContent = obterNomeConta(
        idConta,
        nomeContaSalvo
    );

    dataPagamentoInfo.textContent = formatarData(dataSalva);

    valorPagamentoInfo.textContent = formatarMoeda(valorSalvo);
}

// ============================================================
// ATUALIZAR STATUS DA FATURA
// ============================================================

function atualizarStatusFatura(cartaoAtual, mesFatura) {
    const paga = faturaFoiPaga(cartaoAtual, mesFatura);
    const total = converterMoedaParaNumero(totalFatura.textContent);

    statusFatura.textContent = paga ? "Paga" : "Aberta";
    statusFatura.classList.toggle("paga", paga);
    statusFatura.classList.toggle("aberta", !paga);

    btnPagar.textContent = paga ? "Fatura paga" : "Pagar fatura";

    // Não permite pagar fatura vazia ou já paga.
    btnPagar.disabled = paga || total <= 0;

    atualizarDadosPagamento(cartaoAtual, mesFatura);
}

// ============================================================
// ATUALIZAR A FATURA EXIBIDA
// ============================================================

function atualizarFatura() {
    const cartaoAtual = obterCartaoSelecionado();
    const mesTexto = mesSelect.value;

    listaCompras.innerHTML = "";

    if (!cartaoAtual || !mesTexto) {
        tituloFatura.textContent = "Selecione uma fatura";
        nomeCartao.textContent = "Nenhum cartão selecionado";
        fechamento.textContent = "--";
        vencimento.textContent = "--";
        quantidadeCompras.textContent = "0";
        totalFatura.textContent = formatarMoeda(0);
        valorPagamento.textContent = formatarMoeda(0);

        statusFatura.textContent = "Aberta";
        statusFatura.classList.remove("paga");
        statusFatura.classList.add("aberta");

        dadosPagamento.style.display = "none";
        btnPagar.disabled = true;
        btnPagar.textContent = "Pagar fatura";

        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.style.textAlign = "center";
        celula.textContent = cartaoAtual
            ? "Selecione o mês da fatura."
            : "Nenhum cartão selecionado ou cadastrado.";

        linha.appendChild(celula);
        listaCompras.appendChild(linha);

        return;
    }

    const partesMes = mesTexto.split("-");
    const ano = Number(partesMes[0]);
    const mesZeroBased = Number(partesMes[1]) - 1;

    if (
        !ano ||
        mesZeroBased < 0 ||
        mesZeroBased > 11
    ) {
        return;
    }

    tituloFatura.textContent =
        `${nomesMeses[mesZeroBased]}/${ano}`;

    nomeCartao.textContent = nomeCompletoCartao(cartaoAtual);

    fechamento.textContent = dataDoDia(
        ano,
        mesZeroBased,
        obterFechamento(cartaoAtual)
    ).toLocaleDateString("pt-BR");

    vencimento.textContent = dataDoDia(
        ano,
        mesZeroBased,
        obterVencimento(cartaoAtual)
    ).toLocaleDateString("pt-BR");

    const comprasDaFatura = [];

    obterCompras().forEach(compra => {
        if (!compra || typeof compra !== "object") {
            return;
        }

        // Somente compras no crédito entram na fatura.
        if (normalizar(compra.modo) !== "credito") {
            return;
        }

        if (!compraPertenceAoCartao(compra, cartaoAtual)) {
            return;
        }

        const valorTotalCompra = Number(compra.valor);

        if (!Number.isFinite(valorTotalCompra) || valorTotalCompra <= 0) {
            return;
        }

        const quantidadeParcelas = Math.max(
            1,
            Math.min(600, Math.floor(Number(compra.parcelas) || 1))
        );

        const primeiraFatura = calcularPrimeiraFatura(
            compra.data,
            obterFechamento(cartaoAtual)
        );

        if (!primeiraFatura) {
            return;
        }

        const parcelas = calcularParcelas(
            valorTotalCompra,
            quantidadeParcelas
        );

        for (let i = 0; i < quantidadeParcelas; i++) {
            const indiceMes = primeiraFatura.mes + i;

            const anoParcela = primeiraFatura.ano +
                Math.floor(indiceMes / 12);

            const mesParcela = indiceMes % 12;

            if (
                anoParcela === ano &&
                mesParcela === mesZeroBased
            ) {
                comprasDaFatura.push({
                    data: compra.data,
                    descricao: compra.descricao || "Compra sem descrição",
                    categoria: compra.categoria || "Sem categoria",
                    parcela: `${i + 1}/${quantidadeParcelas}`,
                    valor: parcelas[i]
                });
            }
        }
    });

    comprasDaFatura.sort((a, b) =>
        String(a.data || "").localeCompare(String(b.data || ""))
    );

    let totalCentavos = 0;

    comprasDaFatura.forEach(compra => {
        totalCentavos += Math.round(compra.valor * 100);

        const linha = document.createElement("tr");

        const valores = [
            formatarData(compra.data),
            compra.descricao,
            compra.parcela,
            compra.categoria,
            formatarMoeda(compra.valor)
        ];

        valores.forEach((valor, indice) => {
            const celula = document.createElement("td");

            celula.textContent = valor;

            if (indice === 4) {
                celula.classList.add("valor");
            }

            linha.appendChild(celula);
        });

        listaCompras.appendChild(linha);
    });

    if (comprasDaFatura.length === 0) {
        const linha = document.createElement("tr");
        const celula = document.createElement("td");

        celula.colSpan = 5;
        celula.style.textAlign = "center";
        celula.textContent = "Nenhuma compra nesta fatura.";

        linha.appendChild(celula);
        listaCompras.appendChild(linha);
    }

    const total = totalCentavos / 100;

    totalFatura.textContent = formatarMoeda(total);
    valorPagamento.textContent = formatarMoeda(total);
    quantidadeCompras.textContent = String(comprasDaFatura.length);

    atualizarStatusFatura(cartaoAtual, mesTexto);
}

// ============================================================
// PAGAR FATURA
// ============================================================

function pagarFatura() {
    const cartaoAtual = obterCartaoSelecionado();
    const mesFatura = mesSelect.value;

    if (!cartaoAtual || !mesFatura) {
        alert("Selecione um cartão e o mês da fatura.");
        return;
    }

    // Confere novamente os dados persistidos antes de qualquer débito.
    if (faturaFoiPaga(cartaoAtual, mesFatura)) {
        alert("Esta fatura já possui registro de pagamento.");
        atualizarFatura();
        return;
    }

    if (!contaPagamento.value) {
        alert("Selecione a conta que será utilizada para pagar a fatura.");
        contaPagamento.focus();
        return;
    }

    const contaSelecionada = obterContas().find(
        conta => String(conta.id) === String(contaPagamento.value)
    );

    if (!contaSelecionada) {
        alert("A conta selecionada não foi encontrada.");
        carregarContasPagamento();
        return;
    }

    if (!contaEstaAtiva(contaSelecionada)) {
        alert("A conta selecionada está inativa.");
        carregarContasPagamento();
        return;
    }

    const cartaoCadastrado = obterCartoes().some(
        cartao => String(cartao.id) === String(cartaoAtual.id)
    );

    if (!cartaoCadastrado) {
        alert("O cartão não foi encontrado no cadastro atual.");
        carregarCartoes();
        atualizarFatura();
        return;
    }

    const total = converterMoedaParaNumero(totalFatura.textContent);

    if (!Number.isFinite(total) || total <= 0) {
        alert("Esta fatura não possui valor para pagamento.");
        return;
    }

    // Última verificação imediatamente antes de gravar.
    if (faturaFoiPaga(cartaoAtual, mesFatura)) {
        alert("Esta fatura já possui registro de pagamento.");
        atualizarFatura();
        return;
    }

    const dataPagamento = obterDataLocal();
    const idBase = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    const pagamento = {
        id: idBase,
        cartao: String(cartaoAtual.id),
        nomeCartao: nomeCompletoCartao(cartaoAtual),
        mes: mesFatura,
        valor: total,
        contaPagamento: String(contaSelecionada.id),
        nomeContaPagamento: contaSelecionada.nome || "Conta",
        dataPagamento: dataPagamento
    };

    const movimentacao = {
        id: `${idBase}-mov`,
        tipo: "saida",
        descricao:
            "Pagamento de fatura - " +
            (cartaoAtual.nome || cartaoAtual.instituicao || "Cartão"),
        valor: total,
        conta: String(contaSelecionada.id),
        nomeContaPagamento: contaSelecionada.nome || "Conta",
        data: dataPagamento,
        origem: "fatura",
        cartao: String(cartaoAtual.id),
        nomeCartao: nomeCompletoCartao(cartaoAtual),
        mesFatura: mesFatura
    };

    const pagamentos = obterPagamentos();
    const movimentacoes = obterMovimentacoes();

    // Preserva os valores anteriores para tentar desfazer uma gravação
    // parcial caso o segundo salvamento falhe.
    let pagamentosAnteriores;
    let movimentacoesAnteriores;

    try {
        pagamentosAnteriores = localStorage.getItem(CHAVE_PAGAMENTOS);
        movimentacoesAnteriores = localStorage.getItem(CHAVE_MOVIMENTACOES);
    } catch (erro) {
        console.error("Erro ao preparar o pagamento:", erro);
        alert("Não foi possível acessar os dados do navegador.");
        return;
    }

    pagamentos.push(pagamento);
    movimentacoes.push(movimentacao);

    try {
        salvarLista(CHAVE_PAGAMENTOS, pagamentos);
        salvarLista(CHAVE_MOVIMENTACOES, movimentacoes);
    } catch (erro) {
        console.error("Erro ao salvar o pagamento:", erro);

        // Tenta restaurar exatamente o conteúdo anterior das duas chaves.
        try {
            if (pagamentosAnteriores === null) {
                localStorage.removeItem(CHAVE_PAGAMENTOS);
            } else {
                localStorage.setItem(
                    CHAVE_PAGAMENTOS,
                    pagamentosAnteriores
                );
            }

            if (movimentacoesAnteriores === null) {
                localStorage.removeItem(CHAVE_MOVIMENTACOES);
            } else {
                localStorage.setItem(
                    CHAVE_MOVIMENTACOES,
                    movimentacoesAnteriores
                );
            }
        } catch (erroRestauracao) {
            console.error(
                "Não foi possível restaurar todos os dados anteriores:",
                erroRestauracao
            );
        }

        alert(
            "Não foi possível salvar o pagamento. " +
            "Confira o armazenamento do navegador antes de tentar novamente."
        );

        return;
    }

    atualizarFatura();

    alert("Pagamento da fatura registrado com sucesso!");
}