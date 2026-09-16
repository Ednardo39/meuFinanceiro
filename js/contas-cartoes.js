// ============================================================
// CONTAS E CARTÕES
// ============================================================


// ============================================================
// BOTÃO: NOVA CONTA
// ============================================================

const botaoNovaConta = document.querySelector(".btn-principal");


// ============================================================
// BOTÃO: NOVO CARTÃO
// ============================================================

const botoesPrincipal = document.querySelectorAll(".btn-principal");


// Verifica qual botão foi clicado
botoesPrincipal.forEach(function (botao) {

    const texto = botao.textContent.trim();

    if (texto.includes("Nova conta")) {

        botao.addEventListener("click", function () {
            abrirModalConta();
        });

    }

    if (texto.includes("Novo cartão")) {

        botao.addEventListener("click", function () {
            abrirModalCartao();
        });

    }

});


// ============================================================
// FUNÇÃO PARA FORMATAR VALOR EM REAIS
// ============================================================

function formatarMoeda(valor) {

    return valor.toLocaleString("pt-BR", {
        style: "currency",
        currency: "BRL"
    });

}


// ============================================================
// MODAL - NOVA CONTA
// ============================================================

function abrirModalConta() {

    const modal = document.createElement("div");

    modal.className = "modal-fundo";

    modal.innerHTML = `
        <div class="modal">

            <div class="modal-cabecalho">
                <h2>Nova conta</h2>
                <button class="modal-fechar">&times;</button>
            </div>

            <form id="formNovaConta">

                <div class="form-group">
                    <label>Nome da conta</label>
                    <input
                        type="text"
                        id="nomeConta"
                        placeholder="Ex.: Conta principal"
                    >
                </div>

                <div class="form-group">
                    <label>Instituição</label>
                    <input
                        type="text"
                        id="instituicaoConta"
                        placeholder="Ex.: Nubank"
                    >
                </div>

                <div class="form-group">
                    <label>Tipo de conta</label>

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
                    <label>Saldo inicial</label>

                    <input
                        type="text"
                        id="saldoInicial"
                        class="campo-dinheiro"
                        placeholder="R$ 0,00"
                    >
                </div>

                <div class="form-group">
                    <label>Status</label>

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
                    <label>Observação</label>

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


    // Fechar pelo X
    modal.querySelector(".modal-fechar").addEventListener(
        "click",
        function () {
            modal.remove();
        }
    );


    // Cancelar
    modal.querySelector(".btn-modal-cancelar").addEventListener(
        "click",
        function () {
            modal.remove();
        }
    );


    // Campo saldo
    const campoSaldo = modal.querySelector("#saldoInicial");

    campoSaldo.addEventListener("blur", function () {

        let texto = campoSaldo.value.trim();

        if (texto === "") {
            return;
        }

        texto = texto.replace("R$", "").trim();
        texto = texto.replace(/\./g, "");
        texto = texto.replace(",", ".");

        const numero = Number(texto);

        if (!isNaN(numero)) {

            campoSaldo.value = numero.toLocaleString("pt-BR", {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2
            });

        }

    });


    // Salvar conta
    modal.querySelector("#formNovaConta").addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const nome = modal.querySelector("#nomeConta").value.trim();

            const instituicao =
                modal.querySelector("#instituicaoConta").value.trim();

            const tipo =
                modal.querySelector("#tipoConta").value;

            const saldoTexto =
                modal.querySelector("#saldoInicial").value.trim();

            const status =
                modal.querySelector("#statusConta").value;


            if (nome === "") {

                alert("Informe o nome da conta.");
                return;

            }


            if (instituicao === "") {

                alert("Informe a instituição.");
                return;

            }


            if (tipo === "") {

                alert("Selecione o tipo de conta.");
                return;

            }


            let saldo = 0;

            if (saldoTexto !== "") {

                let texto = saldoTexto;

                texto = texto.replace("R$", "").trim();
                texto = texto.replace(/\./g, "");
                texto = texto.replace(",", ".");

                saldo = Number(texto);

                if (isNaN(saldo)) {
                    saldo = 0;
                }

            }


            adicionarContaNaTela(
                nome,
                instituicao,
                tipo,
                saldo,
                status
            );


            modal.remove();

        }
    );

}


// ============================================================
// ADICIONAR CONTA NA TELA
// ============================================================

function adicionarContaNaTela(
    nome,
    instituicao,
    tipo,
    saldo,
    status
) {

    const gradeContas =
        document.querySelector(".contas-grid");

    if (!gradeContas) {
        return;
    }


    const conta = document.createElement("div");

    conta.className = "conta-card";


    const primeiraLetra =
        nome.charAt(0).toUpperCase();


    conta.innerHTML = `

        <div class="conta-topo">

            <div class="conta-icone">
                ${primeiraLetra}
            </div>

            <div>
                <h3>${nome}</h3>
                <p>${instituicao}</p>
            </div>

        </div>

        <div class="conta-info">

            <span>${tipo}</span>

            <strong>
                ${formatarMoeda(saldo)}
            </strong>

        </div>

        <div class="conta-status">

            <span class="${status === "Ativa" ? "status-ativo" : "status-inativo"}">
                ${status}
            </span>

        </div>

    `;


    gradeContas.appendChild(conta);

}


// ============================================================
// MODAL - NOVO CARTÃO
// ============================================================

function abrirModalCartao() {

    const modal = document.createElement("div");

    modal.className = "modal-fundo";

    modal.innerHTML = `

        <div class="modal">

            <div class="modal-cabecalho">

                <h2>Novo cartão</h2>

                <button class="modal-fechar">
                    &times;
                </button>

            </div>


            <form id="formNovoCartao">


                <div class="form-group">

                    <label>Nome do cartão</label>

                    <input
                        type="text"
                        id="nomeCartao"
                        placeholder="Ex.: Cartão Nubank"
                    >

                </div>


                <div class="form-group">

                    <label>Instituição</label>

                    <input
                        type="text"
                        id="instituicaoCartao"
                        placeholder="Ex.: Nubank"
                    >

                </div>


                <div class="form-group">

                    <label>Conta vinculada</label>

                    <select id="contaVinculada">

                        <option value="">
                            Selecione
                        </option>

                        <option value="Nubank">
                            Nubank
                        </option>

                        <option value="Mercado Pago">
                            Mercado Pago
                        </option>

                        <option value="Caixa">
                            Caixa
                        </option>

                    </select>

                </div>


                <div class="form-group">

                    <label>Final do cartão</label>

                    <input
                        type="text"
                        id="finalCartao"
                        maxlength="4"
                        inputmode="numeric"
                        placeholder="Ex.: 1234"
                    >

                </div>


                <div class="form-group">

                    <label>Limite do cartão</label>

                    <input
                        type="text"
                        id="limiteCartao"
                        class="campo-dinheiro"
                        placeholder="R$ 0,00"
                    >

                </div>


                <div class="form-group">

                    <label>Dia de fechamento</label>

                    <input
                        type="number"
                        id="fechamentoCartao"
                        min="1"
                        max="31"
                        placeholder="Ex.: 02"
                    >

                </div>


                <div class="form-group">

                    <label>Dia de vencimento</label>

                    <input
                        type="number"
                        id="vencimentoCartao"
                        min="1"
                        max="31"
                        placeholder="Ex.: 10"
                    >

                </div>


                <div class="form-group">

                    <label>Status</label>

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

                    <label>Observação</label>

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


    // ========================================================
    // FECHAR MODAL
    // ========================================================

    modal.querySelector(".modal-fechar").addEventListener(
        "click",
        function () {
            modal.remove();
        }
    );


    modal.querySelector(".btn-modal-cancelar").addEventListener(
        "click",
        function () {
            modal.remove();
        }
    );


    // ========================================================
    // FINAL DO CARTÃO - SOMENTE NÚMEROS
    // ========================================================

    const campoFinal =
        modal.querySelector("#finalCartao");

    campoFinal.addEventListener("input", function () {

        campoFinal.value =
            campoFinal.value.replace(/\D/g, "").slice(0, 4);

    });


    // ========================================================
    // FORMATAR LIMITE
    // ========================================================

    const campoLimite =
        modal.querySelector("#limiteCartao");

    campoLimite.addEventListener("blur", function () {

        let texto = campoLimite.value.trim();

        if (texto === "") {
            return;
        }

        texto = texto.replace("R$", "").trim();
        texto = texto.replace(/\./g, "");
        texto = texto.replace(",", ".");

        const numero = Number(texto);

        if (!isNaN(numero)) {

            campoLimite.value =
                numero.toLocaleString("pt-BR", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                });

        }

    });


    // ========================================================
    // SALVAR CARTÃO
    // ========================================================

    modal.querySelector("#formNovoCartao").addEventListener(
        "submit",
        function (evento) {

            evento.preventDefault();


            const nome =
                modal.querySelector("#nomeCartao").value.trim();


            const instituicao =
                modal.querySelector("#instituicaoCartao").value.trim();


            const conta =
                modal.querySelector("#contaVinculada").value;


            const final =
                modal.querySelector("#finalCartao").value.trim();


            const limiteTexto =
                modal.querySelector("#limiteCartao").value.trim();


            const fechamento =
                modal.querySelector("#fechamentoCartao").value;


            const vencimento =
                modal.querySelector("#vencimentoCartao").value;


            const status =
                modal.querySelector("#statusCartao").value;


            // ==================================================
            // VALIDAÇÕES
            // ==================================================

            if (nome === "") {

                alert("Informe o nome do cartão.");
                return;

            }


            if (instituicao === "") {

                alert("Informe a instituição.");
                return;

            }


            if (conta === "") {

                alert("Selecione a conta vinculada.");
                return;

            }


            if (final.length !== 4) {

                alert("Informe os 4 últimos dígitos do cartão.");
                return;

            }


            if (fechamento === "") {

                alert("Informe o dia de fechamento.");
                return;

            }


            if (vencimento === "") {

                alert("Informe o dia de vencimento.");
                return;

            }


            // ==================================================
            // CONVERTER LIMITE
            // ==================================================

            let limite = 0;

            if (limiteTexto !== "") {

                let texto = limiteTexto;

                texto = texto.replace("R$", "").trim();
                texto = texto.replace(/\./g, "");
                texto = texto.replace(",", ".");

                limite = Number(texto);

                if (isNaN(limite)) {

                    alert("Informe um limite válido.");
                    return;

                }

            }


            // ==================================================
            // ADICIONAR CARTÃO NA TELA
            // ==================================================

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


    const cartao = document.createElement("div");

    cartao.className = "cartao-card";


    const primeiraLetra =
        nome.charAt(0).toUpperCase();


    cartao.innerHTML = `

        <div class="cartao-topo">

            <div class="cartao-icone">
                ${primeiraLetra}
            </div>

            <div>

                <h3>${nome}</h3>

                <p>
                    ${instituicao}
                    • final ${final}
                </p>

            </div>

        </div>


        <div class="cartao-info">

            <div class="cartao-info">

        <div>

            <span>Limite</span>

                <strong>
                    ${formatarMoeda(limite)}
                </strong>

        </div>


        <div>

            <span>Utilizado</span>

                <strong>
                    ${formatarMoeda(0)}
                </strong>

        </div>


        <div>

            <span>Disponível</span>

            <strong>
                ${formatarMoeda(limite)}
            </strong>

         </div>

        </div>

        </div>


        <div class="cartao-detalhes">

            <span>
                Fechamento: dia ${fechamento}
            </span>

            <span>
                Vencimento: dia ${vencimento}
            </span>

        </div>


        <div class="cartao-status">

            <span class="${status === "Ativo" ? "status-ativo" : "status-inativo"}">
                ${status}
            </span>

            <span>
                ${conta}
            </span>

        </div>

    `;


    gradeCartoes.appendChild(cartao);

}