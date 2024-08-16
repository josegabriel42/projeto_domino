class Peca {
    constructor(valor_direita, valor_esquerda, numero_peca) {
        this.valor_direita = valor_direita;
        this.valor_esquerda = valor_esquerda;
        this.direita_livre = true;
        this.esquerda_livre = true;
        this.numero_peca = numero_peca;
    }
}

let valor_maior_peca = 3;
let mesa = [];
let bot = [];
let jogador = [];
let cemiterio = [];
// let pecas_contadas = []; // Peças visíveis para o agente
let pecas_ponta = []; // Peças na mesa com movimentos disponíveis
let movimentos_disponiveis = []; // Lista com os movimentos disponíveis na rodada
let qnt_movimentos_disponiveis = 0; // Quantidade disponível na rodada
let qnt_pecas_coletadas_bot = 0;
let qnt_pecas_coletadas_jogador = 0;
let qnt_pecas_atual_bot = 0;
let qnt_pecas_atual_jogador = 0;
let tem_ganhador = false;

// Possibilita o jogador escolher a quantidade de peças disponível no jogo
function escolherConfiguracoes() {
    let qnt = Number(prompt("Maior valor que um lado de uma peça pode assumir (valor mínimo 2, máximo 6 e padrão 3):"));
    
    if(!isNaN(qnt) && qnt != null && qnt >= 2 && qnt <= 6)
        valor_maior_peca = qnt;

    iniciar();
}

// Organiza e distribui as peças
function iniciar() {
    let pecas = [];
    let vetor_tmp = [];
    let vetor_tmp_2 = [];
    let tmp;

    // Gerando e embaralhando as peças
    for(let i = 0; i <= valor_maior_peca; i++) {
        // pecas_contadas[i] = [];
        for(let j = i; j <= valor_maior_peca; j++)
            pecas.push(new Peca(i, j, i+j+1));
    }

    for(let i = 0; i < pecas.length; i++)
        vetor_tmp[i] = i+1;

    vetor_tmp.sort(function() { return 0.5 - Math.random(); });

    for(let i = 0; i < pecas.length; i++)
        vetor_tmp_2[i] = pecas[vetor_tmp[i]-1];

    pecas = vetor_tmp_2;

    // Distribuindo peças
    for (let i = 0; i < valor_maior_peca * 2; i++) {
        if (i < valor_maior_peca) { // Agente
            pecas[i].numero_peca = qnt_pecas_coletadas_bot;
            // atualizar_contagem(pecas[i]);
            bot.push(pecas[i]);
            desenhar_pecas_mao(false, pecas[i]); // "Desenha" as informações na tela
            qnt_pecas_coletadas_bot++;
            qnt_pecas_atual_bot++;
        }else { // Jogador
            pecas[i].numero_peca = qnt_pecas_coletadas_jogador;
            jogador.push(pecas[i]);
            desenhar_pecas_mao(true, pecas[i]); // "Desenha" as informações na tela
            qnt_pecas_coletadas_jogador++;
            qnt_pecas_atual_jogador++;
        }
    }

    mesa.push(pecas[valor_maior_peca * 2]); // Pega a primeira peça que sobrou para ser a inicial
    cemiterio.push(...pecas.splice(valor_maior_peca * 2 + 1, pecas.length)); // Resto das peças para o cemitério
    tmp = mesa[0];
    tmp.index_peca_mesa = 0;
    pecas_ponta[0] = tmp;

    // "Desenha" as informações na tela
    desenhar_peca_mesa(null, mesa[0], []);
    atualizar_cemiterio(true, 0);

    // Primeira verificação do jogo
    conferir_resultado(true);
}

function conferir_resultado(eh_jogador) {
    if(!tem_ganhador && verificar_rodada(eh_jogador)) {
        // Abre para o jogador ou passa para o bot
        if(eh_jogador)
            rodada_jogador();
        else
            rodada_bot();
    }else {
        // Segunda verificação para garantir que o jogo não está trancado
        if(!tem_ganhador && verificar_rodada(!eh_jogador)) {
            if(eh_jogador)
                rodada_bot();
            else
                rodada_jogador();
        }else {
            finalizar();
        }
    }
}

function finalizar() {
    const area_mensagem_vitoria = document.getElementById("mensagem_vitoria");
    const area_mesa = document.getElementById("area_mesa");
    let pontos_bot = 0;
    let pontos_jogador = 0;

    bot.forEach(peca => {
        if(peca != null)
            pontos_bot += peca.valor_direita + peca.valor_esquerda + 1;
    });

    jogador.forEach(peca => {
        if(peca != null)
            pontos_jogador += peca.valor_direita + peca.valor_esquerda + 1;
    });

    if(pontos_bot > pontos_jogador) {
        area_mesa.style.backgroundColor = "dodgerblue";
        area_mensagem_vitoria.innerHTML = `<h2 style="text-align:center; color:dodgerblue">Vitória!</h2>`;
    }else {
        area_mesa.style.backgroundColor = "red";
        area_mensagem_vitoria.innerHTML = `<h2 style="text-align:center; color:red">Derrota!</h2>`;
    }

}

function rodada_bot() {
    const movimento_bot = agente_bot();
    if(movimento_bot)
        marcar_movimento(false, movimento_bot.index_peca_mao, movimento_bot.movimento);

    conferir_resultado(true);
}

function rodada_jogador() {

}

function verificar_rodada(eh_jogador) {
    let mao = eh_jogador ? jogador : bot;
    let peca_cemiterio = null;
    let qnt_pecas_cemiterio_mao = 0;
    let tmp = 0;

    movimentos_disponiveis = [];
    qnt_movimentos_disponiveis = 0;

    mao.forEach((peca, index) => {
        movimentos_disponiveis[index] = verificar_movimento(peca);
        qnt_movimentos_disponiveis += movimentos_disponiveis[index].length;
    });

    while(qnt_movimentos_disponiveis == 0 && cemiterio.length > 0) {
        peca_cemiterio = cemiterio.pop();
        qnt_pecas_cemiterio_mao++;

        if(eh_jogador) {
            peca_cemiterio.numero_peca = qnt_pecas_coletadas_jogador;
            desenhar_pecas_mao(eh_jogador, peca_cemiterio);
            qnt_pecas_coletadas_jogador++;
            qnt_pecas_atual_jogador++;
        }else {
            peca_cemiterio.numero_peca = qnt_pecas_coletadas_bot;
            desenhar_pecas_mao(eh_jogador, peca_cemiterio);
            qnt_pecas_coletadas_bot++;
            qnt_pecas_atual_bot++;
        }

        mao.push(peca_cemiterio);
        tmp = mao.length -1;
        movimentos_disponiveis[tmp] = verificar_movimento(peca_cemiterio);
        qnt_movimentos_disponiveis += movimentos_disponiveis[tmp].length;
    }

    atualizar_cemiterio(eh_jogador, qnt_pecas_cemiterio_mao);

    if(eh_jogador)
        jogador = mao;
    else
        bot = mao;
    
    return (qnt_movimentos_disponiveis > 0);
}

function verificar_movimento(peca) {
    let movimentos = [];

    if(peca) {
        pecas_ponta.forEach(peca_ponta => {
            if(peca_ponta.esquerda_livre) {
                if(peca_ponta.valor_esquerda == peca.valor_esquerda)
                    movimentos.push([peca_ponta.index_peca_mesa, 0, 0]);
                else if(peca_ponta.valor_esquerda == peca.valor_direita)
                    movimentos.push([peca_ponta.index_peca_mesa, 0, 1]);
            }
            
            if(peca_ponta.direita_livre){
                if(peca_ponta.valor_direita == peca.valor_esquerda)
                    movimentos.push([peca_ponta.index_peca_mesa, 1, 0]);
                else if(peca_ponta.valor_direita == peca.valor_direita)
                    movimentos.push([peca_ponta.index_peca_mesa, 1, 1]);
            }
        });
    }

    return movimentos;
}

// Atualiza as variáveis para poder realizar o movimento
function marcar_movimento(eh_jogador, index_peca_mao, movimento) {
    let peca_mao = null;
    let tmp = null;

    if(eh_jogador) {
        peca_mao = jogador[index_peca_mao];
        jogador[index_peca_mao] = null;
        qnt_pecas_atual_jogador--;
        tem_ganhador = qnt_pecas_atual_jogador == 0 ? true : false;
    }else {
        peca_mao = bot[index_peca_mao];
        bot.splice(index_peca_mao, 1);
        qnt_pecas_atual_bot--;
        tem_ganhador = qnt_pecas_atual_bot == 0 ? true : false;
    }

    remover_peca_mao(eh_jogador, peca_mao.numero_peca);

    if(movimento[1] == 0)
        mesa[movimento[0]].esquerda_livre = false;
    else
        mesa[movimento[0]].direita_livre = false;

    if(movimento[1] == movimento[2]) {
        // "Gira a peça" para facilitar detalhe de implementação do código
        tmp = peca_mao.valor_direita;
        peca_mao.valor_direita = peca_mao.valor_esquerda;
        peca_mao.valor_esquerda = tmp;

        if(movimento[2] == 0)
            peca_mao.direita_livre = false;
        else
            peca_mao.esquerda_livre = false;
    }else {
        if(movimento[2] == 0)
            peca_mao.esquerda_livre = false;
        else
            peca_mao.direita_livre = false;
    }

    movimentos_disponiveis = [];
    qnt_movimentos_disponiveis = 0;
    mesa.push(peca_mao);
    tmp = peca_mao;
    tmp.index_peca_mesa = mesa.length-1;

    // Atualiza o vetor que aponta para as peças na mesa disponíveis para movimento
    if(!mesa[movimento[0]].esquerda_livre && !mesa[movimento[0]].direita_livre) {
        if(mesa[movimento[0]] == pecas_ponta[0])
            pecas_ponta[0] = mesa[mesa.length-1];
        else
            pecas_ponta[1] = mesa[mesa.length-1];
    }else {
        if(mesa[movimento[0]] == pecas_ponta[0])
            pecas_ponta[1] = mesa[mesa.length-1];
        else
            pecas_ponta[0] = mesa[mesa.length-1];
    }
    
    desenhar_peca_mesa(eh_jogador, peca_mao, movimento);
    // atualizar_contagem(peca_mao);
}

function posicinar_na_mesa(id) {
    const area_movimentos = document.getElementById("quadro_movimentos");
    let info = id.split("_");
    let peca_origem = Number(info[0]);
    let movimento = [Number(info[1]), Number(info[2]), Number(info[3])];

    marcar_movimento(true, peca_origem, movimento);
    area_movimentos.innerHTML = "";
    
    conferir_resultado(false);
}

function desenhar_pecas_mao(eh_jogador, peca) {
    let funcao_ao_clicar = "";
    let tipo_id_peca = "bot";
    let tipo_class_peca = "";
    let index_peca = qnt_pecas_coletadas_bot;
    
    if(eh_jogador) {
        funcao_ao_clicar = "desenhar_area_movimentos(id)";
        tipo_id_peca = "jogador";
        tipo_class_peca = "peca_mao_jogador";
        index_peca = qnt_pecas_coletadas_jogador;
    }

    const area_mao = document.getElementById(("area_pecas_" + tipo_id_peca));
    area_mao.innerHTML += `<div onclick="${funcao_ao_clicar}" class="peca peca_em_pe ${tipo_class_peca}" id="peca_${tipo_id_peca}_index_${index_peca++}">
                                <div class="pedaco_peca pedaco_peca_em_pe pedaco_peca_cima">
                                    ${peca.valor_direita}
                                </div>
                                <div class="pedaco_peca pedaco_peca_em_pe">
                                    ${peca.valor_esquerda}
                                </div>
                            </div>`;
}

function remover_peca_mao(eh_jogador, index_peca_mao) {
    const tipo_id_peca = eh_jogador ? "jogador" : "bot";
    const peca = document.getElementById(("peca_" + tipo_id_peca + "_index_" + index_peca_mao));
    peca.remove();
}

function desenhar_peca_mesa(eh_jogador, peca, movimento) {
    const area_mesa = document.getElementById("area_mesa");
    let cor_peca = "";
    let index_peca = mesa.length - 1;
    let desenha_mesa = area_mesa.innerHTML;
    let desenho_peca = null;

    if(eh_jogador !== null) 
        cor_peca = eh_jogador ? "peca_jogador" : "peca_bot";
    else
        cor_peca = "peca_inicial";
    
    if(peca.valor_direita == peca.valor_esquerda) { // Peça em pé
        desenho_peca = `<div class="peca peca_em_pe ${cor_peca}" id="peca_index_${index_peca}">
                            <div class="pedaco_peca pedaco_peca_em_pe pedaco_peca_cima">
                                ${peca.valor_direita}
                            </div>
                            <div class="pedaco_peca pedaco_peca_em_pe ">
                                ${peca.valor_esquerda}
                            </div>
                        </div>`;
    } else { // Peça deitada
        desenho_peca = `<div class="peca peca_deitada ${cor_peca}" id="peca_index_${index_peca}">
                            <div class="pedaco_peca pedaco_peca_deitada">
                                ${peca.valor_esquerda}
                            </div>
                            <div class="pedaco_peca pedaco_peca_deitada pedaco_peca_direita">
                                ${peca.valor_direita}
                            </div>
                        </div>`;
    }
    
    if(movimento.length > 0){
        if(movimento[1] == 0) {
            area_mesa.innerHTML = desenho_peca;
            area_mesa.innerHTML += desenha_mesa;
        }else {
            area_mesa.innerHTML += desenho_peca;
        }
    }else {
        area_mesa.innerHTML += desenho_peca;
    }
}

function desenhar_area_movimentos(id_peca_mao){
    const area_movimentos = document.getElementById("quadro_movimentos");
    let peca = null;
    area_movimentos.innerHTML = "";

    let index_peca_mao = Number(id_peca_mao.substr(19));
    let index_peca_alvo = 0;
    let id_peca = ""; // Uma forma de rastrear a peça de origem, o movimento e peça alvo

    movimentos_disponiveis[index_peca_mao].forEach(movimento => {
        id_peca = index_peca_mao + "_" + movimento[0] + "_" + movimento[1] + "_" + movimento[2];
        index_peca_alvo = movimento[0];
        peca = mesa[index_peca_alvo];
        area_movimentos.innerHTML += `<div onclick="posicinar_na_mesa(id)" class="peca peca_em_pe peca_area_movimento" id="${id_peca}">
                                        <div class="pedaco_peca pedaco_peca_em_pe pedaco_peca_cima">
                                            ${peca.valor_direita}
                                        </div>
                                        <div class="pedaco_peca pedaco_peca_em_pe">
                                            ${peca.valor_esquerda}
                                        </div>
                                    </div>`;
    });
}

function atualizar_cemiterio(eh_jogador, qnt_pecas_cemiterio_mao) {
    const area_cemiterio = document.getElementById("qnt_pecas_cemiterio");
    const area_avisos = document.getElementById("avisos");
    let cor = eh_jogador ? "dodgerblue" : "red";
    
    area_cemiterio.innerHTML = cemiterio.length;
    if(qnt_pecas_cemiterio_mao > 0)
        area_avisos.innerHTML = `<h3 style="text-align:center; color: ${cor}">+${qnt_pecas_cemiterio_mao} peça(s) adicionada(s) do cemitério</h3>`;

    setTimeout(() => {
        area_avisos.innerHTML = ``;
    }, 3000);
    
}

// Agente
function agente_bot() {
    let melhor_jogada = null;
    let melhor_impacto = -1; // Mede a melhor jogada e começa negativo pro valor que vier ser sempre maior

    // Encontra o melhor movimento possível
    movimentos_disponiveis.forEach((movimentos_peca, index) => {
        movimentos_peca.forEach(movimento => {
            const peca_mao = bot[index];
            const peca_mesa = mesa[movimento[0]];

            let valor_mao = peca_mao.valor_esquerda + peca_mao.valor_direita;
            let valor_mesa = peca_mesa.valor_esquerda + peca_mesa.valor_direita;

            // Contar quantas peças de cada valor estão na mesa e na mão do jogador
            let valor_jogado = movimento[1] === 0 ? peca_mesa.valor_esquerda : peca_mesa.valor_direita;
            let contagem_pecas_valor = contar_pecas(valor_jogado);

            // Calcular o impacto do movimento. O bot prefere jogar peças que podem fechar o jogador
            let impacto_movimento = 0;
            if (contagem_pecas_valor >= 3) { // Se há 3 ou mais peças do mesmo valor
                impacto_movimento = 1;
            }

            // Escolhe o movimento que tem o melhor valor de peça e maior impacto
            if (melhor_jogada === null || impacto_movimento > melhor_impacto) {
                melhor_jogada = {
                    index_peca_mao: index,
                    movimento: movimento,
                    valor_mao: valor_mao,
                    valor_mesa: valor_mesa
                };
                melhor_impacto = impacto_movimento;
            }
        });
    });

    return melhor_jogada;
}

// Função para contar peças de um determinado valor
function contar_pecas(valor) {
    let contagem = 0;

    // Contar peças na mesa
    mesa.forEach(peca => {
        if (peca && (peca.valor_esquerda === valor || peca.valor_direita === valor)) {
            contagem++;
        }
    });

    // Contar peças na mão
    bot.forEach(peca => {
        if (peca && (peca.valor_esquerda === valor || peca.valor_direita === valor)) {
            contagem++;
        }
    });

    return contagem;
}

/*
function atualizar_contagem(peca) {
    if(pecas_contadas[peca.valor_direita].indexOf(peca.valor_esquerda) === -1)
        pecas_contadas[peca.valor_direita].push(peca.valor_esquerda);
    
    if(pecas_contadas[peca.valor_esquerda].indexOf(peca.valor_direita) === -1)
        pecas_contadas[peca.valor_esquerda].push(peca.valor_direita);
}
*/

// Run
escolherConfiguracoes();

