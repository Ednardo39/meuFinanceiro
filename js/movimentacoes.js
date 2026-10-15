"use strict";

(function () {
    document.addEventListener("DOMContentLoaded", iniciarMovimentacoes);

    const CHAVE_MOVIMENTACOES = "movimentacoesContas";
    const CHAVE_CONTAS = "contasFinanceiras";

    const NOMES_MESES = [
        "Janeiro", "Fevereiro", "Março", "Abril",
        "Maio", "Junho", "Julho", "Agosto",
        "Setembro", "Outubro", "Novembro", "Dezembro"
    ];

    let movimentacoes = [];
    let contas = [];

    function iniciarMovimentacoes() {
        const lista = document.getElementById("listaMovimentacoes");
        const filtroMes = document.getElementById("filtroMes");
        const filtroConta = document.getElementById("filtroConta");
        const entradas = document.getElementById("totalEntradas");
        const saidas = document.getElementById("totalSaidas");
        const saldo = document.getElementById("saldoMovimentacoes");

        if (!lista || !filtroMes || !filtroConta ||
            !entradas || !saidas || !saldo) {
            console.error(
                "Movimentações: confira os IDs dos elementos no HTML."
            );
            return;
        }

        movimentacoes = lerLista(CHAVE_MOVIMENTACOES);
        contas = lerLista(CHAVE_CONTAS);

        carregarContas();
        carregarMeses();

        filtroMes.addEventListener("change", mostrarMovimentacoes);
        filtroConta.addEventListener("change", mostrarMovimentacoes);

        // Atualiza a tela se outro módulo modificar os dados.
        window.addEventListener("storage", function (evento) {
            if (
                evento.key === CHAVE_MOVIMENTACOES ||
                evento.key === CHAVE_CONTAS
            ) {
                movimentacoes = lerLista(CHAVE_MOVIMENTACOES);
                contas = lerLista(CHAVE_CONTAS);
                carregarContas();
                carregarMeses();
                mostrarMovimentacoes();
            }
        });

        mostrarMovimentacoes();

        function lerLista(chave) {
            try {
                const texto = localStorage.getItem(chave);
                if (!texto) return [];

                const dados = JSON.parse(texto);
                return Array.isArray(dados) ? dados : [];
            } catch (erro) {
                console.error("Erro ao ler " + chave + ":", erro);
                return [];
            }
        }

        function formatarMoeda(valor) {
            const numero = Number(valor);
            return (Number.isFinite(numero) ? numero : 0)
                .toLocaleString("pt-BR", {
                    style: "currency",
                    currency: "BRL"
                });
        }

        function formatarData(data) {
            if (!data) return "-";

            const texto = String(data).slice(0, 10);
            const partes = texto.split("-");

            if (partes.length !== 3) return texto;

            return partes[2] + "/" + partes[1] + "/" + partes[0];
        }

        function normalizarTipo(tipo) {
            const valor = String(tipo || "")
                .trim()
                .toLowerCase()
                .normalize("NFD")
                .replace(/[\u0300-\u036f]/g, "");

            if (valor === "entrada" || valor === "receita") {
                return "entrada";
            }

            if (valor === "saida" || valor === "despesa") {
                return "saida";
            }

            return "outro";
        }

        function obterIdConta(movimentacao) {
            return String(
                movimentacao.conta ??
                movimentacao.contaId ??
                movimentacao.idConta ??
                ""
            );
        }

        function nomeDaConta(idConta, movimentacao) {
            const conta = contas.find(function (item) {
                return String(item.id) === String(idConta);
            });

            if (conta) {
                const nome = conta.nome || "Conta";
                const instituicao = conta.instituicao
                    ? " - " + conta.instituicao
                    : "";

                return nome + instituicao;
            }

            if (movimentacao && movimentacao.nomeContaPagamento) {
                return movimentacao.nomeContaPagamento;
            }

            const nomesAntigos = {
                "nubank": "Nubank",
                "mercado-pago": "Mercado Pago",
                "caixa": "Caixa",
                "dinheiro": "Dinheiro em espécie"
            };

            return nomesAntigos[idConta] || idConta || "-";
        }

        function carregarContas() {
            const valorAnterior = filtroConta.value;
            filtroConta.replaceChildren();

            const todas = document.createElement("option");
            todas.value = "todas";
            todas.textContent = "Todas as contas";
            filtroConta.appendChild(todas);

            const contasValidas = contas.filter(function (conta) {
                return conta &&
                    conta.id !== undefined &&
                    conta.id !== null;
            });

            contasValidas.forEach(function (conta) {
                const opcao = document.createElement("option");
                opcao.value = String(conta.id);

                const nome = conta.nome || "Conta";
                const instituicao = conta.instituicao
                    ? " - " + conta.instituicao
                    : "";

                opcao.textContent = nome + instituicao;
                filtroConta.appendChild(opcao);
            });

            if ([...filtroConta.options].some(function (opcao) {
                return opcao.value === valorAnterior;
            })) {
                filtroConta.value = valorAnterior;
            }
        }

        function carregarMeses() {
            const valorAnterior = filtroMes.value;
            const meses = new Set();

            movimentacoes.forEach(function (movimentacao) {
                const data = String(movimentacao.data || "");

                if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
                    meses.add(data.slice(0, 7));
                }
            });

            const listaMeses = [...meses].sort().reverse();
            filtroMes.replaceChildren();

            const todos = document.createElement("option");
            todos.value = "todos";
            todos.textContent = "Todos os períodos";
            filtroMes.appendChild(todos);

            listaMeses.forEach(function (mes) {
                const partes = mes.split("-");
                const numeroMes = Number(partes[1]);

                const opcao = document.createElement("option");
                opcao.value = mes;
                opcao.textContent =
                    (NOMES_MESES[numeroMes - 1] || mes) +
                    " de " + partes[0];

                filtroMes.appendChild(opcao);
            });

            if ([...filtroMes.options].some(function (opcao) {
                return opcao.value === valorAnterior;
            })) {
                filtroMes.value = valorAnterior;
            }
        }

        function atualizarResumo(lista) {
            let totalEntradas = 0;
            let totalSaidas = 0;

            lista.forEach(function (movimentacao) {
                const valor = Number(movimentacao.valor);
                if (!Number.isFinite(valor)) return;

                const tipo = normalizarTipo(movimentacao.tipo);

                if (tipo === "entrada") {
                    totalEntradas += valor;
                } else if (tipo === "saida") {
                    totalSaidas += valor;
                }
            });

            entradas.textContent = formatarMoeda(totalEntradas);
            saidas.textContent = formatarMoeda(totalSaidas);
            saldo.textContent = formatarMoeda(
                totalEntradas - totalSaidas
            );
        }

        function mostrarMovimentacoes() {
            const periodo = filtroMes.value || "todos";
            const contaSelecionada = filtroConta.value || "todas";

            const filtradas = movimentacoes.filter(function (mov) {
                if (!mov || typeof mov !== "object") return false;

                const data = String(mov.data || "");

                if (
                    periodo !== "todos" &&
                    !data.startsWith(periodo)
                ) {
                    return false;
                }

                if (
                    contaSelecionada !== "todas" &&
                    obterIdConta(mov) !== String(contaSelecionada)
                ) {
                    return false;
                }

                return true;
            });

            filtradas.sort(function (a, b) {
                const dataA = String(a.data || "");
                const dataB = String(b.data || "");

                if (dataA !== dataB) {
                    return dataB.localeCompare(dataA);
                }

                return String(b.id || "").localeCompare(
                    String(a.id || "")
                );
            });

            atualizarResumo(filtradas);
            lista.replaceChildren();

            if (filtradas.length === 0) {
                const linha = document.createElement("tr");
                const celula = document.createElement("td");

                celula.colSpan = 5;
                celula.textContent = "Nenhuma movimentação encontrada.";

                linha.appendChild(celula);
                lista.appendChild(linha);
                return;
            }

            filtradas.forEach(function (mov) {
                const linha = document.createElement("tr");
                const tipo = normalizarTipo(mov.tipo);
                const entrada = tipo === "entrada";

                const dados = [
                    formatarData(mov.data),
                    mov.descricao || "-",
                    nomeDaConta(obterIdConta(mov), mov),
                    tipo === "outro"
                        ? (mov.tipo || "Não identificado")
                        : entrada ? "Entrada" : "Saída",
                    (entrada ? "+ " : tipo === "saida" ? "- " : "") +
                        formatarMoeda(mov.valor)
                ];

                dados.forEach(function (valor, indice) {
                    const celula = document.createElement("td");
                    celula.textContent = String(valor);

                    if (indice === 3 && tipo !== "outro") {
                        celula.classList.add(
                            entrada ? "tipo-entrada" : "tipo-saida"
                        );
                    }

                    if (indice === 4 && tipo !== "outro") {
                        celula.classList.add(
                            entrada ? "valor-entrada" : "valor-saida"
                        );
                    }

                    linha.appendChild(celula);
                });

                lista.appendChild(linha);
            });
        }
    }
})();