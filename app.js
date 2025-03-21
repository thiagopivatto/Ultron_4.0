//REQUERINDO MODULOS
import {makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion} from '@whiskeysockets/baileys'
import * as eventosSocket from './bot/baileys/eventosSocket.js'
import {BotControle} from './bot/controles/BotControle.js'
import {MensagemControle} from './bot/controles/MensagemControle.js'
import configSocket from './bot/baileys/configSocket.js'
import moment from "moment-timezone"
import NodeCache from 'node-cache'
moment.tz.setDefault('America/Sao_Paulo')


//Cache de tentativa de envios
const cacheTentativasEnvio = new NodeCache()

async function connectToWhatsApp(){
    let inicializacaoCompleta = false, eventosEsperando = []
    const { state : estadoAuth , saveCreds } = await useMultiFileAuthState('sessao')
    let {version : versaoWaWeb} = await fetchLatestBaileysVersion()
    const c = makeWASocket(configSocket(estadoAuth, cacheTentativasEnvio, versaoWaWeb))
    const bot = new BotControle()

    //Limpando mensagens armazenadas da sessão anterior
    await new MensagemControle().limparMensagensArmazenadas()
    
    //Escutando novos eventos
    c.ev.process(async(events)=>{
        //Obtendo dados do bot
        const botInfo  = await bot.obterInformacoesBot()

        //Atualização na conexão
        if(events['connection.update']){
            const update = events['connection.update']
            const { connection, lastDisconnect } = update;
            if (lastDisconnect?.error) {
                console.log(`[⚠️] Desconectado com erro: ${lastDisconnect.error}`);
            }
            let necessarioReconectar = false
            if(connection == 'open'){
                await eventosSocket.conexaoAberta(c, botInfo)
                inicializacaoCompleta = await eventosSocket.atualizacaoDadosGrupos(c, botInfo)
                await eventosSocket.realizarEventosEspera(c, eventosEsperando)
            } else if (connection == 'close'){
                necessarioReconectar = await eventosSocket.conexaoEncerrada(update, botInfo)
            }
            let tentativasReconexao = 0;

            async function reconectar() {
                const delay = Math.min(30000, 2000 * (2 ** tentativasReconexao)); // Máx: 30s
                console.log(`[🔄] Tentando reconectar em ${delay / 1000} segundos...`);
                tentativasReconexao++;
                await new Promise(res => setTimeout(res, delay));
                connectToWhatsApp();
            }

            if(necessarioReconectar) reconectar();

        }

        // Atualização nas credenciais
        if(events['creds.update']){
            await saveCreds()
        }

        // Ao receber novas mensagens
        const delay = (ms) => new Promise(res => setTimeout(res, ms));

        async function processarMensagemComDelay() {
            const m = events['messages.upsert']
            await delay(1000); // Aguarda 1s entre mensagens
            await eventosSocket.receberMensagem(c, m, botInfo);
        }
        if(events['messages.upsert']){
            const m = events['messages.upsert']
            if(inicializacaoCompleta) processarMensagemComDelay();
            else eventosEsperando.push({evento: 'messages.upsert', dados: m})
        }

        //Ao haver mudanças nos participantes de um grupo
        if(events['group-participants.update']){
            const atualizacao = events['group-participants.update']
            if(inicializacaoCompleta) await eventosSocket.atualizacaoParticipantesGrupo(c, atualizacao, botInfo)
            else eventosEsperando.push({evento: 'group-participants.update', dados: atualizacao})
        }

        //Ao ser adicionado em novos grupos
        if(events['groups.upsert']){
            const grupo = events['groups.upsert']
            if(inicializacaoCompleta) await eventosSocket.adicionadoEmGrupo(c, grupo, botInfo)
            else eventosEsperando.push({evento: 'groups.upsert', dados: grupo})
        }

        //Ao atualizar dados do grupo
        if(events['groups.update']){
            const grupos = events['groups.update']
            if (grupos.length == 1 && grupos[0].participants == undefined){
                if(inicializacaoCompleta) await eventosSocket.atualizacaoDadosGrupo(grupos[0])
                else eventosEsperando.push({evento: 'groups.update', dados: grupos})
            }
        }

    })
}

// Execução principal
connectToWhatsApp()
