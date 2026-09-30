/* ============================================================
MEU FINANCEIRO
TELA DE CATEGORIAS
============================================================ */

document.addEventListener("DOMContentLoaded", function () {

const formulario = document.getElementById("formulario");
const nome = document.getElementById("nome");
const tipo = document.getElementById("tipo");
const listaCategorias = document.getElementById("listaCategorias");
const totalCategorias = document.getElementById("totalCategorias");

// ========================================================
// CARREGAR CATEGORIAS
// ========================================================

function carregarCategorias() {

const categoriasSalvas =
    JSON.parse(localStorage.getItem("categorias")) || [];

mostrarCategorias(categoriasSalvas);

}

// ========================================================
// MOSTRAR CATEGORIAS
// ========================================================

function mostrarCategorias(categorias) {

listaCategorias.innerHTML = "";

totalCategorias.textContent = categorias.length;


if (categorias.length === 0) {

    listaCategorias.innerHTML = `
        <p class="sem-registros">
            Nenhuma categoria cadastrada.
        </p>
    `;

    return;
}


categorias.forEach(function (categoria) {

    const item = document.createElement("div");

    item.className = "item-categoria";


    item.innerHTML = `

        <div>

            <strong>
                ${categoria.nome}
            </strong>

            <small>
                ${mostrarTipo(categoria.tipo)}
            </small>

        </div>


        <button
            type="button"
            class="btn-excluir"
            data-id="${categoria.id}"
        >
            Excluir
        </button>

    `;


    listaCategorias.appendChild(item);

});


adicionarEventosExcluir();

}

// ========================================================
// MOSTRAR TIPO
// ========================================================

function mostrarTipo(tipoCategoria) {

if (tipoCategoria === "entrada") {

    return "Entrada";

}

if (tipoCategoria === "saida") {

    return "Gasto";

}

if (tipoCategoria === "ambos") {

    return "Entrada e Gasto";

}

return tipoCategoria;

}

// ========================================================
// ADICIONAR CATEGORIA
// ========================================================

formulario.addEventListener("submit", function (event) {

event.preventDefault();


const nomeCategoria = nome.value.trim();

const tipoCategoria = tipo.value;


if (nomeCategoria === "") {

    alert("Digite o nome da categoria.");

    nome.focus();

    return;

}


if (tipoCategoria === "") {

    alert("Selecione o tipo da categoria.");

    tipo.focus();

    return;

}


const categoriasSalvas =
    JSON.parse(localStorage.getItem("categorias")) || [];


const categoriaExiste = categoriasSalvas.some(function (categoria) {

    return categoria.nome.toLowerCase() ===
           nomeCategoria.toLowerCase();

});


if (categoriaExiste) {

    alert("Essa categoria já está cadastrada.");

    nome.focus();

    return;

}


const novaCategoria = {

    id: Date.now(),

    nome: nomeCategoria,

    tipo: tipoCategoria

};


categoriasSalvas.push(novaCategoria);


localStorage.setItem(
    "categorias",
    JSON.stringify(categoriasSalvas)
);


formulario.reset();


carregarCategorias();


alert("Categoria adicionada com sucesso.");

});

// ========================================================
// VERIFICAR CONFIGURAÇÃO DE CONFIRMAÇÃO
// ========================================================

function deveConfirmarExclusao() {

const configuracoes =
    JSON.parse(localStorage.getItem("configuracoes")) || {};


// Se a configuração ainda não existir,
// mantém o comportamento antigo: confirmar.

if (configuracoes.confirmarExclusao === undefined) {

    return true;

}


return configuracoes.confirmarExclusao === true;

}

// ========================================================
// EXCLUIR CATEGORIA
// ========================================================

function adicionarEventosExcluir() {

const botoesExcluir =
    document.querySelectorAll(".btn-excluir");


botoesExcluir.forEach(function (botao) {

    botao.addEventListener("click", function () {

        const id = Number(this.dataset.id);


        // =================================================
        // CONFIRMAÇÃO
        // =================================================

        if (deveConfirmarExclusao()) {

            const confirmar = confirm(
                "Deseja realmente excluir esta categoria?"
            );


            if (!confirmar) {

                return;

            }

        }


        // =================================================
        // EXCLUIR
        // =================================================

        let categoriasSalvas =
            JSON.parse(localStorage.getItem("categorias")) || [];


        categoriasSalvas =
            categoriasSalvas.filter(function (categoria) {

                return categoria.id !== id;

            });


        localStorage.setItem(
            "categorias",
            JSON.stringify(categoriasSalvas)
        );


        carregarCategorias();

    });

});

}

// ========================================================
// INICIAR
// ========================================================

carregarCategorias();

});