const express = require('express');
const app = express();
app.get('/',(req,res)=>res.send('ROSA-MD EN LIGNE 👑'));
app.listen(process.env.PORT||3000);

const { default: makeWASocket, useMultiFileAuthState, delay } = require('@whiskeysockets/baileys');
const P = require('pino');
const fs = require('fs');
const path = require('path');

async function startRosa(){
  if(!fs.existsSync('./session')) fs.mkdirSync('./session', {recursive:true});
  if(process.env.SESSION_ID){
    try{
      const data = Buffer.from(process.env.SESSION_ID, 'base64').toString();
      fs.writeFileSync('./session/creds.json', data);
      console.log('✅ SESSION_ID OK');
    }catch(e){ console.log('❌ SESSION_ID BAD'); }
  } else { console.log('❌ Ajoute SESSION_ID dans Render Environment'); }

  const { state, saveCreds } = await useMultiFileAuthState('./session');
  const sock = makeWASocket({ auth: state, logger: P({level:'silent'}), browser: ["ROSA-MD","Safari","1.0"] });
  sock.ev.on('creds.update', saveCreds);
  sock.ev.on('connection.update', (u)=>{
    if(u.connection==='open') console.log('✅ ROSA-MD CONNECTEE!');
    if(u.connection==='close') setTimeout(startRosa,3000);
  });
  sock.ev.on('messages.upsert', async (m)=>{
    const msg = m.messages[0];
    if(!msg.message || msg.key.fromMe) return;
    const text = (msg.message.conversation || msg.message.extendedTextMessage?.text || '').toLowerCase();
    const from = msg.key.remoteJid;
    if(text=='.menu' || text=='.rosa'){
      await sock.sendMessage(from,{text:`*👑 ROSA-MD 👑*\n\n.rosa /.menu - Affiche menu\n.ping - Vitesse bot\n\nGénérateur: https://rosa-web-5k8n.onrender.com`});
    }
    if(text=='.ping'){ await sock.sendMessage(from,{text:'Pong! ⚡ ROSA-MD en ligne!'}); }
  });
}
startRosa();
