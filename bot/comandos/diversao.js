// REQUERINDO MODULOS
import { criarTexto, primeiraLetraMaiuscula, erroComandoMsg, consoleErro, timestampParaData } from '../lib/util.js'
import path from 'node:path'
import api from '@victorsouzaleal/lbot-api-comandos'
import * as socket from '../baileys/socket.js'
import { tiposMensagem } from '../baileys/mensagem.js'
import { comandosInfo } from '../comandos/comandos.js'
import { UsuarioControle } from '../controles/UsuarioControle.js'
import axios from 'axios'
import translate from '@vitalets/google-translate-api'

export const diversao = async (c, mensagemBaileys, botInfo) => {
    // Atribuição de valores
    const comandos_info = comandosInfo(botInfo)
    const numero_dono = await new UsuarioControle().obterIdDono()
    const { prefixo, numero_bot } = botInfo
    const {
        comando,
        texto_recebido,
        args,
        mensagem,
        id_chat,
        mensagem_grupo,
        mensagem_citada,
        mencionados,
        citacao,
        grupo
    } = mensagemBaileys
    const { dono, usuario_admin, bot_admin } = { ...grupo }
    const comandoSemPrefixo = comando.replace(prefixo, "")

    // Comandos de diversão
    try {
        switch (comandoSemPrefixo) {
            case 'detector':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let imgsDetector = ['verdade', 'vaipra', 'mentiroso', 'meengana', 'kao', 'incerteza', 'estresse', 'conversapraboi']
                    let indexAleatorio = Math.floor(Math.random() * imgsDetector.length)
                    await socket.responderArquivoLocal(c, tiposMensagem.imagem, id_chat, './bot/midia/detector/calibrando.png', comandos_info.diversao.detector.msgs.espera, mensagem)
                    await socket.responderArquivoLocal(c, tiposMensagem.imagem, id_chat, `./bot/midia/detector/${imgsDetector[indexAleatorio]}.png`, '', citacao.mensagem)
                } catch (err) {
                    throw err
                }
                break

            case 'simi':
                try {
                    if (!args.length) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let perguntaSimi = texto_recebido
                    let { resultado: resultadoTexto } = await api.IA.obterRespostaSimi(perguntaSimi)
                    await socket.responderTexto(c, id_chat, criarTexto(comandos_info.diversao.simi.msgs.resposta, timestampParaData(Date.now()), resultadoTexto), mensagem)
                } catch (err) {
                    if (!err.erro) throw err
                    await socket.responderTexto(c, id_chat, criarTexto(comandos_info.outros.erro_api, comando, err.erro), mensagem)
                }
                break

            case 'viadometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.viadometro.msgs.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.viadometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    if (numero_dono == alvo) indexAleatorio = 0
                    let respostaTexto = criarTexto(comandos_info.diversao.viadometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

            case 'bafometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.bafometro.msgs.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.bafometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    if (numero_dono == alvo) indexAleatorio = 0
                    let respostaTexto = criarTexto(comandos_info.diversao.bafometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

            case 'chance':
                try {
                    if (!args.length) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let num = Math.floor(Math.random() * 100), temaChance = texto_recebido
                    if (mensagem_citada) {
                        await socket.responderTexto(c, id_chat, criarTexto(comandos_info.diversao.chance.msgs.resposta, num, temaChance), citacao.mensagem)
                    } else {
                        await socket.responderTexto(c, id_chat, criarTexto(comandos_info.diversao.chance.msgs.resposta, num, temaChance), mensagem)
                    }
                } catch (err) {
                    throw err
                }
                break

            case "caracoroa":
                try {
                    if (!args.length) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let ladosMoeda = ["cara", "coroa"]
                    let textoUsuario = texto_recebido.toLowerCase()
                    if (!ladosMoeda.includes(textoUsuario)) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    await socket.responderTexto(c, id_chat, comandos_info.diversao.caracoroa.msgs.espera, mensagem)
                    let indexAleatorio = Math.floor(Math.random() * ladosMoeda.length)
                    let vitoriaUsuario = ladosMoeda[indexAleatorio] == textoUsuario
                    let textoResultado
                    if (vitoriaUsuario) {
                        textoResultado = criarTexto(comandos_info.diversao.caracoroa.msgs.resposta.vitoria, primeiraLetraMaiuscula(ladosMoeda[indexAleatorio]))
                    } else {
                        textoResultado = criarTexto(comandos_info.diversao.caracoroa.msgs.resposta.derrota, primeiraLetraMaiuscula(ladosMoeda[indexAleatorio]))
                    }
                    await socket.responderArquivoUrl(c, tiposMensagem.imagem, id_chat, path.resolve(`bot/midia/caracoroa/${ladosMoeda[indexAleatorio]}.png`), textoResultado, mensagem)
                } catch (err) {
                    throw err
                }
                break

            case "ppt":
                try {
                    let ppt = ["pedra", "papel", "tesoura"], indexAleatorio = Math.floor(Math.random() * ppt.length)
                    if (!args.length) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (!ppt.includes(texto_recebido.toLowerCase())) return await socket.responderTexto(c, id_chat, comandos_info.diversao.ppt.msgs.opcao_erro, mensagem)
                    let escolhaBot = ppt[indexAleatorio], iconeEscolhaBot = null, escolhaUsuario = texto_recebido.toLowerCase(), iconeEscolhaUsuario = null, vitoriaUsuario = null
                    if (escolhaBot == "pedra") {
                        iconeEscolhaBot = "✊"
                        if (escolhaUsuario == "pedra") vitoriaUsuario = null, iconeEscolhaUsuario = "✊"
                        if (escolhaUsuario == "tesoura") vitoriaUsuario = false, iconeEscolhaUsuario = "✌️"
                        if (escolhaUsuario == "papel") vitoriaUsuario = true, iconeEscolhaUsuario = "✋"
                    } else if (escolhaBot == "papel") {
                        iconeEscolhaBot = "✋"
                        if (escolhaUsuario == "pedra") vitoriaUsuario = false, iconeEscolhaUsuario = "✊"
                        if (escolhaUsuario == "tesoura") vitoriaUsuario = true, iconeEscolhaUsuario = "✌️"
                        if (escolhaUsuario == "papel") vitoriaUsuario = null, iconeEscolhaUsuario = "✋"
                    } else {
                        iconeEscolhaBot = "✌️"
                        if (escolhaUsuario == "pedra") vitoriaUsuario = true, iconeEscolhaUsuario = "✊"
                        if (escolhaUsuario == "tesoura") vitoriaUsuario = null, iconeEscolhaUsuario = "✌️"
                        if (escolhaUsuario == "papel") vitoriaUsuario = false, iconeEscolhaUsuario = "✋"
                    }
                    let textoResultado = ''
                    if (vitoriaUsuario == true) {
                        textoResultado = criarTexto(comandos_info.diversao.ppt.msgs.resposta.vitoria, iconeEscolhaUsuario, iconeEscolhaBot)
                    } else if (vitoriaUsuario == false) {
                        textoResultado = criarTexto(comandos_info.diversao.ppt.msgs.resposta.derrota, iconeEscolhaUsuario, iconeEscolhaBot)
                    } else {
                        textoResultado = criarTexto(comandos_info.diversao.ppt.msgs.resposta.empate, iconeEscolhaUsuario, iconeEscolhaBot)
                    }
                    await socket.responderTexto(c, id_chat, textoResultado, mensagem)
                } catch (err) {
                    throw err
                }
                break

            case "massacote":
            case 'mascote':
                try {
                    const mascoteFotoURL = "https://i.imgur.com/mVwa7q4.png"
                    await socket.responderArquivoUrl(c, tiposMensagem.imagem, id_chat, mascoteFotoURL, 'Whatsapp Jr.', mensagem)
                } catch (err) {
                    throw err
                }
                break

            case 'malacos':
                try {
                    const malacosFotoURL = "https://i.imgur.com/7bcn2TK.jpg"
                    await socket.responderArquivoUrl(c, tiposMensagem.imagem, id_chat, malacosFotoURL, 'Somos o problema', mensagem)
                } catch (err) {
                    throw err
                }
                break

            case 'roletarussa':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!usuario_admin) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.apenas_admin, mensagem)
                    if (!bot_admin) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.bot_admin, mensagem)
                    let idParticipantesAtuais = grupo.participantes
                    if (dono == numero_bot) idParticipantesAtuais.splice(idParticipantesAtuais.indexOf(numero_bot), 1)
                    else {
                        idParticipantesAtuais.splice(idParticipantesAtuais.indexOf(dono), 1)
                        idParticipantesAtuais.splice(idParticipantesAtuais.indexOf(numero_bot), 1)
                    }
                    if (idParticipantesAtuais.length == 0) return await socket.responderTexto(c, id_chat, comandos_info.diversao.roletarussa.msgs.sem_membros, mensagem)
                    let indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    let participanteEscolhido = idParticipantesAtuais[indexAleatorio]
                    let respostaTexto = criarTexto(comandos_info.diversao.roletarussa.msgs.resposta, participanteEscolhido.replace("@s.whatsapp.net", ''))
                    await socket.responderTexto(c, id_chat, comandos_info.diversao.roletarussa.msgs.espera, mensagem)
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, [participanteEscolhido])
                    await socket.removerParticipante(c, id_chat, participanteEscolhido)
                } catch (err) {
                    throw err
                }
                break

            case 'casal':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    let idParticipantesAtuais = grupo.participantes
                    if (idParticipantesAtuais.length < 2) return await socket.responderTexto(c, id_chat, comandos_info.diversao.casal.msgs.minimo, mensagem)
                    let indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    let pessoaEscolhida1 = idParticipantesAtuais[indexAleatorio]
                    idParticipantesAtuais.splice(indexAleatorio, 1)
                    indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    let pessoaEscolhida2 = idParticipantesAtuais[indexAleatorio]
                    let respostaTexto = criarTexto(comandos_info.diversao.casal.msgs.resposta, pessoaEscolhida1.replace("@s.whatsapp.net", ''), pessoaEscolhida2.replace("@s.whatsapp.net", ''))
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, [pessoaEscolhida1, pessoaEscolhida2])
                } catch (err) {
                    throw err
                }
                break

            case 'gadometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.gadometro.msgs.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.gadometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    if (numero_dono == alvo) indexAleatorio = 0
                    let respostaTexto = criarTexto(comandos_info.diversao.gadometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

            case 'top5':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!args.length) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let temaRanking = texto_recebido, idParticipantesAtuais = grupo.participantes
                    if (idParticipantesAtuais.length < 5) return await socket.responderTexto(c, id_chat, comandos_info.diversao.top5.msgs.erro_membros, mensagem)
                    let respostaTexto = criarTexto(comandos_info.diversao.top5.msgs.resposta_titulo, temaRanking), mencionarMembros = []
                    for (let i = 0; i < 5; i++) {
                        let medalha = ""
                        switch (i + 1) {
                            case 1:
                                medalha = '🥇'
                                break
                            case 2:
                                medalha = '🥈'
                                break
                            case 3:
                                medalha = '🥉'
                                break
                            default:
                                medalha = ''
                        }
                        let indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                        let membroSelecionado = idParticipantesAtuais[indexAleatorio]
                        respostaTexto += criarTexto(comandos_info.diversao.top5.msgs.resposta_itens, medalha, i + 1, membroSelecionado.replace("@s.whatsapp.net", ''))
                        mencionarMembros.push(membroSelecionado)
                        idParticipantesAtuais.splice(idParticipantesAtuais.indexOf(membroSelecionado), 1)
                    }
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, mencionarMembros)
                } catch (err) {
                    throw err
                }
                break

            case 'par':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (mencionados.length !== 2) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    let respostas = comandos_info.diversao.par.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length)
                    let respostaTexto = criarTexto(comandos_info.diversao.par.msgs.resposta, mencionados[0].replace("@s.whatsapp.net", ''), mencionados[1].replace("@s.whatsapp.net", ''), respostas[indexAleatorio])
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, mencionados)
                } catch (err) {
                    throw err
                }
                break

            case "fch":
                try {
                    let { resultado: resultadoTexto } = await api.Gerais.obterCartasContraHu()
                    await socket.responderTexto(c, id_chat, criarTexto(comandos_info.diversao.fch.msgs.resposta, resultadoTexto), mensagem)
                } catch (err) {
                    if(!err.erro) throw err
                    await socket.responderTexto(c, id_chat, criarTexto(comandos_info.outros.erro_api, comando, err.erro), mensagem)
                }
                break

            // NOVOS COMANDOS

            case 'trisal':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)

                    let idParticipantesAtuais = grupo.participantes

                    if (idParticipantesAtuais.length < 3) return await socket.responderTexto(c, id_chat, comandos_info.diversao.trisal.minimo, mensagem)

                    var indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    var pessoaEscolhida1 = idParticipantesAtuais[indexAleatorio]
                    idParticipantesAtuais.splice(indexAleatorio, 1)

                    indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    var pessoaEscolhida2 = idParticipantesAtuais[indexAleatorio]
                    idParticipantesAtuais.splice(indexAleatorio, 1)

                    indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                    var pessoaEscolhida3 = idParticipantesAtuais[indexAleatorio]

                    var respostaTexto = criarTexto(comandos_info.diversao.trisal.msgs.resposta, pessoaEscolhida1.replace("@s.whatsapp.net", ''), pessoaEscolhida2.replace("@s.whatsapp.net", ''), pessoaEscolhida3.replace("@s.whatsapp.net", ''))
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, [pessoaEscolhida1, pessoaEscolhida2, pessoaEscolhida3])
                } catch (err) {
                    throw err
                }
                break

            case 'top':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (args.length === 1) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)

                    let qtdUsuarios = parseInt(args[0])
                    let temaRanking = texto_recebido.slice(1 + args[0].length).trim()
                    let idParticipantesAtuais = grupo.participantes

                    if (isNaN(qtdUsuarios)) return await socket.responderTexto(c, id_chat, comandos_info.diversao.top.msgs.erro_qtd, mensagem)
                    if (qtdUsuarios > 200) return await socket.responderTexto(c, id_chat, comandos_info.diversao.top.msgs.limite_qtd, mensagem)
                    if (qtdUsuarios > grupo.participantes.length) return await socket.responderTexto(c, id_chat, comandos_info.diversao.top.msgs.erro_qtd, mensagem)

                    let respostaTexto = criarTexto(comandos_info.diversao.top.msgs.resposta_titulo, qtdUsuarios, temaRanking)
                    let mencionarMembros = []

                    for (let i = 0; i < qtdUsuarios; i++) {
                        let medalha = ""
                        switch (i + 1) {
                            case 1:
                                medalha = '🥇'
                                break
                            case 2:
                                medalha = '🥈'
                                break
                            case 3:
                                medalha = '🥉'
                                break
                            default:
                                medalha = ''
                        }
                        let indexAleatorio = Math.floor(Math.random() * idParticipantesAtuais.length)
                        let membroSelecionado = idParticipantesAtuais[indexAleatorio]
                        respostaTexto += criarTexto(comandos_info.diversao.top.msgs.resposta_itens, medalha, i + 1, membroSelecionado.replace("@s.whatsapp.net", ''))
                        mencionarMembros.push(membroSelecionado)
                        idParticipantesAtuais.splice(idParticipantesAtuais.indexOf(membroSelecionado), 1)
                    }
                    await socket.enviarTextoComMencoes(c, id_chat, respostaTexto, mencionarMembros)
                } catch (err) {
                    throw err
                }
                break

            case 'jacometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.jacometro.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.jacometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    let respostaTexto = criarTexto(comandos_info.diversao.jacometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

            case 'bolometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.bolometro.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.bolometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    let respostaTexto = criarTexto(comandos_info.diversao.bolometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

            case 'fernandometro':
                try {
                    if (!mensagem_grupo) return await socket.responderTexto(c, id_chat, comandos_info.outros.permissao.grupo, mensagem)
                    if (!mensagem_citada && mencionados.length == 0) return await socket.responderTexto(c, id_chat, erroComandoMsg(comando, botInfo), mensagem)
                    if (mencionados.length > 1) return await socket.responderTexto(c, id_chat, comandos_info.diversao.fernandometro.apenas_um, mensagem)
                    let respostas = comandos_info.diversao.fernandometro.msgs.respostas
                    let indexAleatorio = Math.floor(Math.random() * respostas.length), idResposta = null, alvo = null
                    if (mencionados.length == 1) idResposta = mensagem, alvo = mencionados[0]
                    else idResposta = citacao.mensagem, alvo = citacao.remetente
                    let respostaTexto = criarTexto(comandos_info.diversao.fernandometro.msgs.resposta, respostas[indexAleatorio])
                    await socket.responderTexto(c, id_chat, respostaTexto, idResposta)
                } catch (err) {
                    throw err
                }
                break

                // COMANDOOSSSSS NOVOS ------------------------------------------------------
                
            case 'joke':
                try {
                    let response = await axios.get('https://official-joke-api.appspot.com/random_joke')
                    let joke = `${response.data.setup} - ${response.data.punchline}`
                    await socket.responderTexto(c, id_chat, joke, mensagem)
                } catch (err) {
                    await socket.responderTexto(c, id_chat, criarTexto(comandos_info.outros.erro_api, comando, 'Não foi possível obter uma piada no momento.'), mensagem)
                }
                break

            // case 'vod':
            //     try {
            //         if (!mensagem_grupo) {
            //             return await socket.responderTexto(c, id_chat, "Este comando só pode ser usado em grupos.", mensagem)
            //         }
            //         if (args.length < 1 || args.length > 2) {
            //             return await socket.responderTexto(c, id_chat, "Formato inválido. Use !vod [vdd/dsf] [nível]", mensagem)
            //         }

            //         const tipoEscolha = args[0].toLowerCase()
            //         const nivel = parseInt(args[1])
            //         const tipoEscolhaMapeado = tipoEscolha === 'vdd' ? 'truth' : tipoEscolha === 'dsf' ? 'dare' : ''

            //         if (!tipoEscolhaMapeado) {
            //             return await socket.responderTexto(c, id_chat, "Tipo de escolha inválido. Use vdd ou dsf.", mensagem)
            //         }
            //         if (isNaN(nivel) || nivel < 1 || nivel > 5) {
            //             return await socket.responderTexto(c, id_chat, "Nível inválido. Use um número de 1 a 5.", mensagem)
            //         }

            //         const frasesVOD = await axios.get("https://gist.githubusercontent.com/thiagopivatto/3ed7f417a37590b75745cc1c4cba450a/raw/a960f63a10323565a21c32d13a457edca67ebb75/vod.json")
            //         const frasesFiltradas = frasesVOD.data.filter(frase => frase.level === nivel.toString() && frase.type.toLowerCase() === tipoEscolhaMapeado)
            //         const traduzirFrases = async (frases) => {
            //             return new Promise(async (resolve, reject) => {
            //                 try {
            //                     const targetLanguage = 'pt'
            //                     const traducaoPromises = frases.map(async (frase) => {
            //                         const translation = await translate(frase.summary, { to: targetLanguage })
            //                         frase.summary = translation.text
            //                     })
            //                     await Promise.all(traducaoPromises)
            //                     resolve({ sucesso: true, frases })
            //                 } catch (err) {
            //                     console.log(`API traduzirFrases - ${err.message}`)
            //                     reject({ sucesso: false, erro: "Houve um erro no servidor de tradução." })
            //                 }
            //             })
            //         }

            //         if (frasesFiltradas.length > 0) {
            //             const { frases } = await traduzirFrases(frasesFiltradas)
            //             const fraseSelecionada = frases[Math.floor(Math.random() * frases.length)]
            //             const mensagemResposta = `🌟 *Nível:* ${nivel}\n🔥 *Tipo:* ${tipoEscolhaMapeado === 'truth' ? '🔮 Verdade' : '🎲 Desafio'}\n💬 *Frase:* ${fraseSelecionada.summary}`
            //             await socket.responderTexto(c, id_chat, mensagemResposta, mensagem)
            //         } else {
            //             await socket.responderTexto(c, id_chat, "Não foram encontradas frases com o nível e tipo especificados.", mensagem)
            //         }
            //     } catch (err) {
            //         throw err
            //     }
            //     break

            case 'musica':
                try {
                    if (args.length < 2) {
                        return await socket.responderTexto(c, id_chat, "Formato inválido. Use !musica [descrição]", mensagem)
                    }

                    const descricaoPrompt = texto_recebido.slice(comando.length + 1).trim()
                    await socket.responderTexto(c, id_chat, "🎶 Gerando sua música, por favor aguarde...", mensagem)

                    const { sucesso, filePath, erro } = await criarMusica(descricaoPrompt)
                    if (sucesso) {
                        const musicaBuffer = fs.readFileSync(filePath)
                        await socket.responderArquivo(c, id_chat, musicaBuffer, 'musica.mp3', '🎵 Sua música está pronta!', mensagem)
                    } else {
                        await socket.responderTexto(c, id_chat, `⚠️ *Erro ao gerar música:* ${erro}`, mensagem)
                    }
                } catch (err) {
                    consoleErro(err)
                    await socket.responderTexto(c, id_chat, "❌ Houve um erro ao processar o comando.", mensagem)
                }
                break
        }
    } catch (err) {
        await socket.responderTexto(c, id_chat, criarTexto(comandos_info.outros.erro_comando_codigo, comando), mensagem)
        err.message = `${comando} - ${err.message}`
        consoleErro(err, "DIVERSÃO")
    }

}