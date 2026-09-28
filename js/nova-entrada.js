document.addEventListener("DOMContentLoaded", function () {

const data = document.querySelector("#data");

const valor = document.querySelector("#valor");

const formulario = document.querySelector("#formulario");

const descricao = document.querySelector("#descricao");

const categoria = document.querySelector("#categoria");

const forma = document.querySelector("#forma");

const conta = document.querySelector("#conta");

const observacao = document.querySelector("#observacao");


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


    // Limpar opções atuais
    categoria.innerHTML = "";


    // Opção inicial
    const opcaoInicial =
        document.createElement("option");

    opcaoInicial.value = "";

    opcaoInicial.textContent =
        "Selecione uma categoria";

    categoria.appendChild(opcaoInicial);


    // =====================================================
    // FILTRAR CATEGORIAS DE ENTRADA
    // =====================================================

    const categoriasEntrada =
        categoriasSalvas.filter(function (item) {

            return (
                item.tipo === "entrada" ||
                item.tipo === "ambos"
            );

        });


    // =====================================================
    // SE NÃO EXISTIR CATEGORIA
    // =====================================================

    if (categoriasEntrada.length === 0) {

        const opcaoVazia =
            document.createElement("option");

        opcaoVazia.value = "";

        opcaoVazia.textContent =
            "Nenhuma categoria de entrada cadastrada";

        opcaoVazia.disabled = true;

        categoria.appendChild(opcaoVazia);

        return;

    }


    // =====================================================
    // ADICIONAR CATEGORIAS
    // =====================================================

    categoriasEntrada.forEach(function (item) {

        const opcao =
            document.createElement("option");

        opcao.value = item.nome;

        opcao.textContent = item.nome;

        categoria.appendChild(opcao);

    });

}


// Carregar categorias ao abrir a tela
carregarCategorias();


// =========================================================
// PREENCHER DATA ATUAL
// =========================================================

const hoje = new Date();

const ano =
    hoje.getFullYear();

const mes =
    String(
        hoje.getMonth() + 1
    ).padStart(2, "0");

const dia =
    String(
        hoje.getDate()
    ).padStart(2, "0");

const dataAtual =
    ano +
    "-" +
    mes +
    "-" +
    dia;


data.value = dataAtual;


// =========================================================
// FORMATAÇÃO DO VALOR
// =========================================================

valor.addEventListener(
    "focus",
    function () {

        valor.value =
            valor.value
                .replace("R$", "")
                .trim();

    }
);


valor.addEventListener(
    "blur",
    function () {

        let texto =
            valor.value.trim();


        if (texto === "") {

            valor.value = "";

            return;

        }


        texto =
            texto
                .replace("R$", "")
                .trim();


        texto =
            texto.replace(/\./g, "");


        texto =
            texto.replace(",", ".");


        const numero =
            Number(texto);


        if (isNaN(numero)) {

            valor.value = "";

            return;

        }


        const numeroFormatado =
            numero.toLocaleString(
                "pt-BR",
                {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                }
            );


        valor.value =
            "R$ " +
            numeroFormatado;

    }
);


// =========================================================
// VALIDAÇÃO DO FORMULÁRIO
// =========================================================

formulario.addEventListener(
    "submit",
    function (evento) {

        evento.preventDefault();


        // -------------------------------------------------
        // VALIDAÇÃO DA DESCRIÇÃO
        // -------------------------------------------------

        const textoDescricao =
            descricao.value.trim();


        if (textoDescricao === "") {

            descricao.classList.add(
                "campo-erro"
            );

            alert(
                "Informe a descrição da entrada."
            );

            descricao.focus();

            return;

        }


        descricao.classList.remove(
            "campo-erro"
        );


        // -------------------------------------------------
        // VALIDAÇÃO DA CATEGORIA
        // -------------------------------------------------

        if (categoria.value === "") {

            categoria.classList.add(
                "campo-erro"
            );

            alert(
                "Selecione uma categoria."
            );

            categoria.focus();

            return;

        }


        categoria.classList.remove(
            "campo-erro"
        );


        // -------------------------------------------------
        // VALIDAÇÃO DO VALOR
        // -------------------------------------------------

        let valorTexto =
            valor.value.trim();


        if (valorTexto === "") {

            valor.classList.add(
                "campo-erro"
            );

            alert(
                "Informe o valor da entrada."
            );

            valor.focus();

            return;

        }


        valorTexto =
            valorTexto
                .replace("R$", "")
                .trim();


        valorTexto =
            valorTexto.replace(
                /\./g,
                ""
            );


        valorTexto =
            valorTexto.replace(
                ",",
                "."
            );


        const valorNumerico =
            Number(valorTexto);


        if (
            isNaN(valorNumerico) ||
            valorNumerico <= 0
        ) {

            valor.classList.add(
                "campo-erro"
            );

            alert(
                "Informe um valor maior que zero."
            );

            valor.focus();

            return;

        }


        valor.classList.remove(
            "campo-erro"
        );


        // -------------------------------------------------
        // VALIDAÇÃO DA DATA
        // -------------------------------------------------

        if (data.value === "") {

            data.classList.add(
                "campo-erro"
            );

            alert(
                "Informe a data da entrada."
            );

            data.focus();

            return;

        }


        data.classList.remove(
            "campo-erro"
        );


        // -------------------------------------------------
        // VALIDAÇÃO DA FORMA DE RECEBIMENTO
        // -------------------------------------------------

        if (forma.value === "") {

            forma.classList.add(
                "campo-erro"
            );

            alert(
                "Selecione a forma de recebimento."
            );

            forma.focus();

            return;

        }


        forma.classList.remove(
            "campo-erro"
        );


        // -------------------------------------------------
        // VALIDAÇÃO DA CONTA
        // -------------------------------------------------

        if (conta.value === "") {

            conta.classList.add(
                "campo-erro"
            );

            alert(
                "Selecione onde o dinheiro entrou."
            );

            conta.focus();

            return;

        }


        conta.classList.remove(
            "campo-erro"
        );


        // =================================================
        // SALVAR MOVIMENTAÇÃO
        // =================================================

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


        const novaMovimentacao = {

            id: Date.now(),

            tipo: "entrada",

            descricao:
                textoDescricao,

            categoria:
                categoria.value,

            valor:
                valorNumerico,

            data:
                data.value,

            forma:
                forma.value,

            conta:
                conta.value,

            observacao:
                observacao
                    ? observacao.value.trim()
                    : "",

            origem:
                "entrada"

        };


        movimentacoes.push(
            novaMovimentacao
        );


        localStorage.setItem(
            "movimentacoesContas",
            JSON.stringify(
                movimentacoes
            )
        );


        // =================================================
        // CONFIRMAÇÃO
        // =================================================

        alert(
            "Entrada registrada com sucesso!"
        );


        // =================================================
        // LIMPAR FORMULÁRIO
        // =================================================

        formulario.reset();

        data.value = dataAtual;


        // Recarregar categorias
        carregarCategorias();

    }
);

});