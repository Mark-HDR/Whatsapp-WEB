import { fileTypeFromBuffer } from 'file-type';
import wweb from 'whatsapp-web.js'
const { MessageMedia } = wweb
import fetch from 'node-fetch'
import etc from "../etc.js";

let handler = async (m, { conn, text, usedPrefix, command }) => {
    let quotedMessage = m.hasQuotedMsg ? await m.getQuotedMessage() : m
    let teks = m.hasQuotedMsg ? quotedMessage.body : text
    if (teks === "") return m.reply(`Input message:\n${usedPrefix + command} hello world`);
    let avatar = await conn.getProfilePicUrl(quotedMessage.author || quotedMessage.from)
    let username = quotedMessage._data.notifyName
    const quote = await generateQuote(teks, avatar, username)
    m.reply(new MessageMedia((await fileTypeFromBuffer(quote)).mime, quote.toString("base64")), false, { sendMediaAsSticker: true, stickerName: etc.author, stickerAuthor: etc.author, stickerCategories: ['😅'] })
}

handler.help = ['quotemaker'].map(v => v + ' <message>')
handler.tags = ['tools']
handler.command = /^(quote(maker|stic?ker)|(q(uick)?c(hats?)?))$/i

export default handler;

async function generateQuote(text, avatar, username) {
    const data = {
      "format": "png",
      /*
      TODO
      "media": [{}],
      "mediaType": "sticker",
      */
      "messages": [
      {
          "avatar": avatar ? true : false,
          "from": {
            "name": username,
            "photo": {
              "url": avatar
          }
      },
      "text": text,
      "replyMessage": {} //TODO
  }
  ]
  };
  let res = await fetch('https://bot.lyo.su/quote/generate', { method: 'post', body: JSON.stringify(data), headers: {'Content-Type': 'application/json'} })
  const json = await res.json()
  return Buffer.from(json.result.image, 'base64')
}