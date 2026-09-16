// =========================================================
// ELEMENTOS DA TELA
// =========================================================

const botoesNovaConta = document.querySelectorAll(".btn-principal");


// =========================================================
// ABRIR FORMULÁRIO DE NOVA CONTA
// =========================================================

botoesNovaConta.forEach(function (botao) {

    if (botao.textContent.includes("Nova conta")) {

        botao.addEventListener("click", function () {

            abrirFormularioConta();

        });

    }

});


// =========================================================
// FUNÇÃO PARA CRIAR O FORMULÁRIO
// =========================================================

function abrirFormularioConta() {

    const fundo = document.createElement("div");

    fundo.className = "modal-fundo";


    const modal = document.createElement("div");

    modal.className = "modal";


    modal.innerHTML = `
        <div class="modal-cabecalho">

            <div>
                <h2>Nova conta</h2>

                <p>
                    Cadastre uma conta de onde o dinheiro poderá sair.
                </p>
            </div>

            <button class="modal-fechar" type="button">
                ×
            </button>

        </div>


        <form id="formulario-conta">


            <div class="form-group">

                <label for="nome-conta">
                    Nome da conta
                </label>

                <input
                    type="text"
                    id="nome-conta"
                    placeholder="Ex.: Nubank"
                >

            </div>


            <div class="form-group">

                <label for="instituicao">
                    Instituição
                </label>

                <input
                    type="text"
                    id="instituicao"
                    placeholder="Ex.: Nubank"
                >

            </div>


            <div class="form-group">

                <label for="tipo-conta">
                    Tipo de conta
                </label>

                <select id="tipo-conta">

                    <option value="">
                        Selecione
                    </option>

                    <option value="corrente">
                        Conta corrente
                    </option>

                    <option value="poupanca">
                        Conta poupança
                    </option>

                    <option value="pagamento">
                        Conta de pagamento
                    </option>

                    <option value="carteira">
                        Carteira
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label for="saldo-inicial">
                    Saldo inicial
                </label>

                <div class="campo-dinheiro">

                    <span>R$</span>

                    <input
                        type="text"
                        id="saldo-inicial"
                        placeholder="0,00"
                    >

                </div>

            </div>


            <div class="form-group">

                <label for="status-conta">
                    Status
                </label>

                <select id="status-conta">

                    <option value="ativa">
                        Ativa
                    </option>

                    <option value="inativa">
                        Inativa
                    </option>

                </select>

            </div>


            <div class="form-group">

                <label for="observacao-conta">
                    Observação
                </label>

                <textarea
                    id="observacao-conta"
                    rows="3"
                    placeholder="Opcional"
                ></textarea>

            </div>


            <div class="modal-acoes">

                <button
                    type="button"
                    class="btn-modal-cancelar"
                    id="cancelar-conta"
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
    `;


    fundo.appendChild(modal);

    document.body.appendChild(fundo);


    // =====================================================
    // ELEMENTOS DO MODAL
    // =====================================================

    const fechar = modal.querySelector(".modal-fechar");

    const cancelar = modal.querySelector("#cancelar-conta");

    const formulario = modal.querySelector("#formulario-conta");

    const saldo = modal.querySelector("#saldo-inicial");


    // =====================================================
    // FECHAR MODAL
    // =====================================================

    fechar.addEventListener("click", function () {

        fundo.remove();

    });


    cancelar.addEventListener("click", function () {

        fundo.remove();

    });


    // =====================================================
    // FORMATAR SALDO
    // =====================================================

    saldo.addEventListener("blur", function () {

        let texto = saldo.value.trim();

        if (texto === "") {
            saldo.value = "";
            return;
        }

        texto = texto.replace("R$", "").trim();

        texto = texto.replace(/\./g, "");

        texto = texto.replace(",", ".");

        const numero = Number(texto);

        if (isNaN(numero)) {

            saldo.value = "";

            return;
        }

        saldo.value = numero.toLocaleString("pt-BR", {

            minimumFractionDigits: 2,

            maximumFractionDigits: 2

        });

    });


    // =====================================================
    // SALVAR CONTA
    // =====================================================

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();


        const nome = modal.querySelector("#nome-conta");

        const instituicao = modal.querySelector("#instituicao");

        const tipo = modal.querySelector("#tipo-conta");


        if (nome.value.trim() === "") {

            alert("Informe o nome da conta.");

            nome.focus();

            return;
        }


        if (instituicao.value.trim() === "") {

            alert("Informe a instituição.");

            instituicao.focus();

            return;
        }


        if (tipo.value === "") {

            alert("Selecione o tipo da conta.");

            tipo.focus();

            return;
        }


        alert("Conta preenchida corretamente!");

    });

}