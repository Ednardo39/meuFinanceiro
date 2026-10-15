function pagarFatura() {
    const cartao = cartaoSelecionado();
    const mes = elementos.mes.value;

    if (!cartao || !mes || !/^\d{4}-\d{2}$/.test(mes)) {
        alert("Selecione um cartão e um mês válido.");
        return;
    }

    if (!cartaoAtivo(cartao)) {
        alert("Este cartão está inativo.");
        return;
    }

    if (faturaPaga(cartao, mes)) {
        alert("Esta fatura já possui registro de pagamento.");
        atualizarFatura();
        return;
    }

    const idConta = elementos.contaPagamento.value;

    if (!idConta) {
        alert("Selecione a conta que pagará a fatura.");
        elementos.contaPagamento.focus();
        return;
    }

    const contas = obterContas();
    const indiceConta = contas.findIndex(function (conta) {
        return String(conta.id) === String(idConta);
    });

    if (indiceConta < 0) {
        alert("A conta selecionada não foi encontrada.");
        carregarContasPagamento();
        return;
    }

    const conta = { ...contas[indiceConta] };

    if (!contaAtiva(conta)) {
        alert("A conta selecionada está inativa.");
        return;
    }

    const total = numeroSeguro(elementos.totalFatura.textContent);

    if (!Number.isFinite(total) || total <= 0) {
        alert("Esta fatura não possui valor válido para pagamento.");
        return;
    }

    const saldoAnterior = numeroSeguro(
        conta.saldoAtual ?? conta.saldoInicial ?? 0
    );

    if (!Number.isFinite(saldoAnterior)) {
        alert("O saldo da conta é inválido.");
        return;
    }

    if (centavos(saldoAnterior) < centavos(total)) {
        alert(
            "Saldo insuficiente na conta selecionada.\n" +
            "Saldo disponível: " + formatarMoeda(saldoAnterior) + "\n" +
            "Valor da fatura: " + formatarMoeda(total)
        );
        return;
    }

    // Verifica novamente para evitar duplicidade.
    if (faturaPaga(cartao, mes)) {
        alert("Esta fatura já possui registro de pagamento.");
        atualizarFatura();
        return;
    }

    const agora = Date.now();
    const id = String(agora) + "-" +
        Math.random().toString(36).slice(2, 9);

    const dataPagamento = dataLocal();
    const nomeCartaoSalvo = nomeCompletoCartao(cartao);
    const nomeContaSalvo = conta.nome || "Conta";

    const pagamento = {
        id: id,
        cartao: String(cartao.id),
        nomeCartao: nomeCartaoSalvo,
        mes: mes,
        mesFatura: mes,
        valor: total,
        contaPagamento: String(conta.id),
        nomeContaPagamento: nomeContaSalvo,
        dataPagamento: dataPagamento
    };

    const movimentacao = {
        id: id + "-mov",
        tipo: "saida",
        descricao: "Pagamento de fatura - " +
            (cartao.nome || cartao.instituicao || "Cartão"),
        valor: total,
        conta: String(conta.id),
        nomeContaPagamento: nomeContaSalvo,
        data: dataPagamento,
        origem: "fatura",
        cartao: String(cartao.id),
        nomeCartao: nomeCartaoSalvo,
        mesFatura: mes
    };

    // O saldo é atualizado aqui uma única vez.
    conta.saldoAtual = dinheiroDeCentavos(
        centavos(saldoAnterior) - centavos(total)
    );

    contas[indiceConta] = conta;

    const pagamentos = obterPagamentos();
    const movimentacoes = obterMovimentacoes();

    pagamentos.push(pagamento);
    movimentacoes.push(movimentacao);

    const chaves = [
        CHAVES.contas,
        CHAVES.pagamentos,
        CHAVES.movimentacoes
    ];

    const anteriores = {};

    try {
        chaves.forEach(function (chave) {
            anteriores[chave] = localStorage.getItem(chave);
        });

        // Última proteção antes de gravar.
        if (faturaPaga(cartao, mes)) {
            alert("Esta fatura já possui registro de pagamento.");
            atualizarFatura();
            return;
        }

        salvarLista(CHAVES.contas, contas);
        salvarLista(CHAVES.pagamentos, pagamentos);
        salvarLista(CHAVES.movimentacoes, movimentacoes);

    } catch (erro) {
        console.error("Erro ao salvar o pagamento:", erro);

        chaves.forEach(function (chave) {
            try {
                if (!(chave in anteriores)) return;

                if (anteriores[chave] === null) {
                    localStorage.removeItem(chave);
                } else {
                    localStorage.setItem(chave, anteriores[chave]);
                }
            } catch (erroRestauracao) {
                console.error(
                    "Erro ao restaurar " + chave + ":",
                    erroRestauracao
                );
            }
        });

        alert(
            "Não foi possível salvar o pagamento. " +
            "Os dados anteriores foram restaurados quando possível."
        );
        return;
    }

    carregarContasPagamento();
    atualizarFatura();

    alert("Pagamento da fatura registrado com sucesso!");
}