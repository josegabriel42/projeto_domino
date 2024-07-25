class Peca {
    constructor(valor_direita, valor_esquerda, numero_peca) {
        this.valor_direita = valor_direita;
        this.valor_esquerda = valor_esquerda;
        this.direita_livre = true;
        this.esquerda_livre = true;
        this.numero_peca = numero_peca;
    }
}

let pecas = [];
let mao_bot = [];
let mao_jogador = [];
let qnt_pecas_coletadas_bot = 0;
let qnt_pecas_coletadas_jogador = 0;
let peca_inicial = null;
let pecas_mesa = [];
let cemiterio = [];
let movimentos_disponiveis = [];
let qnt_movimentos_disponiveis = 0;
let tem_ganhador = false;
let vencedor = "";


// Funções

function iniciar_jogo() {
    // Gera as peças
    pecas = [];
    for(let i = 0; i < 4; i++) {
        for(let j = i; j < 4; j++)
            pecas.push(new Peca(i, j, i+j+1));
    }

    // Embaralha as peças
    pecas = embaralhar_pecas(pecas);

    // Distribui as peças na mão do bot
    pecas[0].numero_peca = qnt_pecas_coletadas_bot;
    mao_bot.push(pecas[0]);
    desenhar_peca_mao_bot();
    qnt_pecas_coletadas_bot++;

    pecas[2].numero_peca = qnt_pecas_coletadas_bot;
    mao_bot.push(pecas[2]);
    desenhar_peca_mao_bot();
    qnt_pecas_coletadas_bot++;

    pecas[4].numero_peca = qnt_pecas_coletadas_bot;
    mao_bot.push(pecas[4]);
    desenhar_peca_mao_bot();
    qnt_pecas_coletadas_bot++;

    // Distribui as peças na mão do jogador
    pecas[1].numero_peca = qnt_pecas_coletadas_jogador;
    mao_jogador.push(pecas[1]);
    desenhar_peca_mao_jogador(pecas[1]);
    qnt_pecas_coletadas_jogador++;

    pecas[3].numero_peca = qnt_pecas_coletadas_jogador;
    mao_jogador.push(pecas[3]);
    desenhar_peca_mao_jogador(pecas[3]);
    qnt_pecas_coletadas_jogador++;

    pecas[5].numero_peca = qnt_pecas_coletadas_jogador;
    mao_jogador.push(pecas[5]);
    desenhar_peca_mao_jogador(pecas[5]);
    qnt_pecas_coletadas_jogador++;

    // Peça inicial e cemitério
    pecas_mesa.push(pecas[6]);
    desenhar_peca_mesa(null, pecas[6], [])
    cemiterio = [pecas[7], pecas[8], pecas[9]];
    desenhar_peca_cemiterio();
    

    // Dá inicio à primeira rodada da partidade
    if(verificar_rodada(true)) {
        // Jogador escolhe a sua jogada
    }else {
        // Bot vai verificar a rodada e, se possível, realizar um movimento
        
        if(verificar_rodada(false)){
            rodada_bot();
        }else {
            // Sem jogadas disponíveis. Fim da partida.
            tem_ganhador = true;
            finalizarPartida();
        }
    }
}

function finalizarPartida() {
    const campo_mensagem = document.getElementById("mensagem_vencedor");
    const area_jogo = document.getElementById("area_jogo");
    let bot = jogador = 0;
    
    mao_bot.forEach(peca => {
        if(peca != null)
            bot += peca.valor_direita + peca.valor_esquerda;
    });

    mao_jogador.forEach(peca => {
        if(peca != null)
            jogador += peca.valor_direita + peca.valor_esquerda;
    });

    vencedor = bot < jogador ? "Bot" : "Jogador";
    campo_mensagem.innerHTML = `<h2 style="text-align:center">Vencedor ${vencedor}</h2>`;
}

// Bot faz sua jogada
function rodada_bot() {
    for(let i = 0; i < movimentos_disponiveis.length; i++) {
        let movimentos_peca = movimentos_disponiveis[i];

        if(movimentos_peca.length > 0) {
            marcar_movimento(false, i, movimentos_peca[0]);
            break;
        }
    }

    if(verificar_rodada(true)) {
        // Jogador escolhe a sua jogada
    }else {
        // Bot vai verificar a rodada e, se possível, realizar um movimento novamente
        if(verificar_rodada(false)){
            rodada_bot();
        }else {
            // Sem jogadas disponíveis. Fim da partida.
            tem_ganhador = true;
            finalizarPartida();
        }
    }
}

// Arruma o cenário para o jogador
function rodada_jogador() {
    if(!tem_ganhador && verificar_rodada(false)) {
        for(let i = 0; i < movimentos_disponiveis.length; i++) {
            let movimentos_peca = movimentos_disponiveis[i];
    
            if(movimentos_peca.length > 0) {
                marcar_movimento(false, i, movimentos_peca[0]);
                break;
            }
        }
    }
}

// Retorna true se houver movimentos disponíveis, se não retorna false
function verificar_rodada(vez_jogador){
    let mao = vez_jogador ? mao_jogador : mao_bot;
    movimentos_disponiveis = [];
    qnt_movimentos_disponiveis = 0;

    mao.forEach((peca, index) => {
        movimentos_disponiveis[index] = verificar_peca(peca);
        qnt_movimentos_disponiveis += movimentos_disponiveis[index].length;
    });

    while(qnt_movimentos_disponiveis == 0 && cemiterio.length > 0) {
        peca_cemiterio = cemiterio.pop();

        if(vez_jogador) {
            desenhar_peca_mao_jogador(peca_cemiterio);
            peca_cemiterio.numero_peca = qnt_pecas_coletadas_jogador;
            qnt_pecas_coletadas_jogador++;
        }else {
            desenhar_peca_mao_bot(peca_cemiterio);
            peca_cemiterio.numero_peca = qnt_pecas_coletadas_bot;
            qnt_pecas_coletadas_bot++;
        }

        mao.push(peca_cemiterio);

        temp = mao.length -1;
        movimentos_disponiveis[temp] = verificar_peca(peca_cemiterio);
        qnt_movimentos_disponiveis += movimentos_disponiveis[temp].length;
    }

    desenhar_peca_cemiterio();

    if(vez_jogador)
        mao_jogador = mao;
    else
        mao_bot = mao;

    return (qnt_movimentos_disponiveis > 0);
}

function embaralhar_pecas(pecas) {
    const nova_ordem = [];
    for(let i = 0; i < pecas.length; i++)
        nova_ordem[i] = i+1;
        
    nova_ordem.sort(function() { return 0.5 - Math.random(); });
    const pecas_embaralhadas = [];

    for(let i = 0; i < pecas.length; i++)
        pecas_embaralhadas[i] = pecas[nova_ordem[i]-1];

    return pecas_embaralhadas;
}

/*
  Verifica se existem movimentos para a peça e retorna um vetor de vetores da forma:
  [
    [index_peca_mesa, lado_movimento, lado_movimento_peca_mao],
    [index_peca_mesa, lado_movimento, lado_movimento_peca_mao],
  ]
*/
function verificar_peca(peca_mao) {
    let movimentos = [];

    if(peca_mao){
        pecas_mesa.forEach((peca_mesa, index) => {
            if(peca_mesa.esquerda_livre) {
                // Lembrar de marcar a peça como disponível para jogada quando for fazer a parte gráfica
                if(peca_mao.valor_esquerda == peca_mesa.valor_esquerda) {
                    movimentos.push([index, 0, 0]);
                }else if(peca_mao.valor_direita == peca_mesa.valor_esquerda) {
                    movimentos.push([index, 0, 1]);
                }
            }
    
            if(peca_mesa.direita_livre) {
                // Lembrar de marcar a peça como disponível para jogada quando for fazer a parte gráfica
                if(peca_mao.valor_esquerda == peca_mesa.valor_direita) {
                    movimentos.push([index, 1, 0]);
                }else if(peca_mao.valor_direita == peca_mesa.valor_direita) {
                    movimentos.push([index, 1, 1]);
                }
            }
         });
    }

     return movimentos;
}

function marcar_movimento(vez_jogador, index_peca_mao, movimento) {
    let peca_mao = null;
    let temp = null;

    if(vez_jogador) {
        peca_mao = mao_jogador[index_peca_mao];
        mao_jogador[index_peca_mao] = null;
        remover_peca_mao_jogador(peca_mao.numero_peca);
        tem_ganhador = mao_jogador.length == 0 ? true : false
    }else {
        peca_mao = mao_bot[index_peca_mao];
        mao_bot.splice(index_peca_mao, 1);
        remover_peca_mao_bot(peca_mao.numero_peca);
        tem_ganhador = mao_bot.length == 0 ? true : false
    }

    if(movimento[1] == 0)
        pecas_mesa[movimento[0]].esquerda_livre = false;
    else
        pecas_mesa[movimento[0]].direita_livre = false;

    if(movimento[1] == movimento[2]) {
        // "Gira a peça" para facilitar detalhe de implementação do código
        temp = peca_mao.valor_direita;
        peca_mao.valor_direita = peca_mao.valor_esquerda;
        peca_mao.valor_esquerda = temp;

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
    pecas_mesa.push(peca_mao);
    desenhar_peca_mesa(vez_jogador, peca_mao, movimento);
}

// Testando

function testar() {
    console.log("Peças:", pecas);
    console.log("Bot:", mao_bot);
    console.log("Jogador:", mao_jogador);
    console.log("Mesa:", pecas_mesa);
    console.log("Cemitério:", cemiterio);
    console.log("Movimentos:", movimentos_disponiveis);
    console.log("Vencedor:", vencedor);
    console.log();
}

// Manipulação do DOM
function desenhar_peca_mesa(vez_jogador, peca, movimento) {
    const area_mesa = document.getElementById("area_mesa");
    let cor_peca = "";
    let index_peca = pecas_mesa.length - 1;
    let desenha_mesa = area_mesa.innerHTML;
    let desenho_peca = null;

    if(vez_jogador !== null) 
        cor_peca = vez_jogador ? "peca_jogador" : "peca_bot";
    
    // Peça em pé
    if(peca.valor_direita == peca.valor_esquerda) {
        desenho_peca = `<div class="peca peca_em_pe ${cor_peca}" id="peca_index_${index_peca}">
                            <div class="pedaco_peca pedaco_peca_em_pe pedaco_peca_cima">
                                ${peca.valor_direita}
                            </div>
                            <div class="pedaco_peca pedaco_peca_em_pe ">
                                ${peca.valor_esquerda}
                            </div>
                        </div>`;
    } else { // Peça em deitada
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

function desenhar_peca_mao_bot(peca) {

}

function desenhar_peca_mao_jogador(peca) {
    const area_mesa = document.getElementById("area_pecas_jogador");
    let index_peca = qnt_pecas_coletadas_jogador;
    area_mesa.innerHTML += `<div onclick="desenhar_area_movimentos(id)" class="peca peca_em_pe peca_mao_jogador" id="peca_jogador_index_${index_peca}">
                                <div class="pedaco_peca pedaco_peca_em_pe pedaco_peca_cima">
                                    ${peca.valor_direita}
                                </div>
                                <div class="pedaco_peca pedaco_peca_em_pe">
                                    ${peca.valor_esquerda}
                                </div>
                            </div>`;
}

function remover_peca_mao_bot(index_peca_mao) {
    // const peca = document.getElementById("peca_mao_bot_" + index_peca_mao);
    // peca.remove();
}

function remover_peca_mao_jogador(index_peca_mao) {
    const peca = document.getElementById(("peca_jogador_index_" + index_peca_mao));
    peca.remove();
}


function desenhar_peca_cemiterio() {
    const area_cemiterio = document.getElementById("qnt_pecas_cemiterio");
    area_cemiterio.innerHTML = cemiterio.length;
}

function desenhar_area_movimentos(id_peca_mao){
    if(tem_ganhador)
        return;
    
    const area_movimentos = document.getElementById("quadro_movimentos");
    let peca = null;
    area_movimentos.innerHTML = "";

    let index_peca_mao = Number(id_peca_mao.substr(19));
    let index_peca_alvo = 0;
    let id_peca = ""; // Uma forma de rastrear a peça de origem, o movimento e peça alvo

    movimentos_disponiveis[index_peca_mao].forEach(movimento => {
        id_peca = index_peca_mao + "_" + movimento[0] + "_" + movimento[1] + "_" + movimento[2];
        index_peca_alvo = movimento[0];

        peca = pecas_mesa[index_peca_alvo];
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

function posicinar_na_mesa(id) {
    const area_movimentos = document.getElementById("quadro_movimentos");
    let info = id.split("_");
    let peca_origem = Number(info[0]);
    let movimento = [Number(info[1]), Number(info[2]), Number(info[3])];

    marcar_movimento(true, peca_origem, movimento);
    area_movimentos.innerHTML = "";
    
    if(verificar_rodada(false)) {
        // Bot faz sua jogada
        rodada_bot();
    }else {
        if(verificar_rodada(true)){
            // Jogador escolhe a sua jogada
        }else {
            // Sem jogadas disponíveis. Fim da partida.
            tem_ganhador = true;
            finalizarPartida();
        }
    }
}

// Run

iniciar_jogo();
// rodada_teste();
// testar();