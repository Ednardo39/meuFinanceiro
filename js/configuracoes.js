/* ============================================================
   MEU FINANCEIRO
   CONFIGURAÇÕES
   ============================================================ */

(function () {

    const CHAVE_CONFIGURACOES = "configuracoes";

    function obterConfiguracoes() {
        try {
            return JSON.parse(
                localStorage.getItem(CHAVE_CONFIGURACOES)
            ) || {};
        } catch (erro) {
            console.error(
                "Erro ao carregar configurações:",
                erro
            );

            return {};
        }
    }

    /* ========================================================
       APLICAR TEMA GLOBALMENTE
       ======================================================== */

    function aplicarTema(tema) {
        const temaEscolhido = tema || "claro";

        if (temaEscolhido === "escuro") {
            document.documentElement.setAttribute(
                "data-tema",
                "escuro"
            );

        } else if (temaEscolhido === "sistema") {
            const prefereEscuro = window.matchMedia &&
                window.matchMedia(
                    "(prefers-color-scheme: dark)"
                ).matches;

            document.documentElement.setAttribute(
                "data-tema",
                prefereEscuro ? "escuro" : "claro"
            );

        } else {
            document.documentElement.setAttribute(
                "data-tema",
                "claro"
            );
        }
    }

    /* ========================================================
       APLICAR TEMA SALVO EM QUALQUER PÁGINA
       ======================================================== */

    aplicarTema(obterConfiguracoes().tema);

    /* Atualiza automaticamente se o sistema mudar de tema. */

    if (window.matchMedia) {
        const consultaTema = window.matchMedia(
            "(prefers-color-scheme: dark)"
        );

        function atualizarTemaSistema() {
            const configuracoes = obterConfiguracoes();

            if (configuracoes.tema === "sistema") {
                aplicarTema("sistema");
            }
        }

        if (consultaTema.addEventListener) {
            consultaTema.addEventListener(
                "change",
                atualizarTemaSistema
            );
        } else if (consultaTema.addListener) {
            consultaTema.addListener(
                atualizarTemaSistema
            );
        }
    }

    /* ========================================================
       CONFIGURAÇÕES DA PÁGINA
       ======================================================== */

    document.addEventListener(
        "DOMContentLoaded",
        function () {

            const moeda =
                document.getElementById("moeda");

            const tema =
                document.getElementById("tema");

            const formatoData =
                document.getElementById("formatoData");

            const confirmarExclusao =
                document.getElementById("confirmarExclusao");

            const btnSalvar =
                document.getElementById("btnSalvar");

            /* Se não for a página Configurações,
               o tema global já foi aplicado. */

            if (
                !moeda ||
                !tema ||
                !formatoData ||
                !confirmarExclusao ||
                !btnSalvar
            ) {
                return;
            }

            /* Carregar preferências salvas. */

            const configuracoesSalvas =
                obterConfiguracoes();

            moeda.value =
                configuracoesSalvas.moeda || "BRL";

            tema.value =
                configuracoesSalvas.tema || "claro";

            formatoData.value =
                configuracoesSalvas.formatoData ||
                "dd/mm/yyyy";

            confirmarExclusao.checked =
                configuracoesSalvas.confirmarExclusao !==
                undefined
                    ? configuracoesSalvas.confirmarExclusao
                    : true;

            /* Salvar preferências. */

            btnSalvar.addEventListener(
                "click",
                function () {

                    const configuracoes = {
                        moeda: moeda.value,
                        tema: tema.value,
                        formatoData: formatoData.value,
                        confirmarExclusao:
                            confirmarExclusao.checked
                    };

                    try {
                        localStorage.setItem(
                            CHAVE_CONFIGURACOES,
                            JSON.stringify(configuracoes)
                        );

                        aplicarTema(configuracoes.tema);

                        alert(
                            "Configurações salvas com sucesso!"
                        );

                    } catch (erro) {
                        console.error(
                            "Erro ao salvar configurações:",
                            erro
                        );

                        alert(
                            "Não foi possível salvar as configurações."
                        );
                    }
                }
            );
        }
    );

})();