const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
require('dotenv').config();
const axios = require('axios');
const fs = require('fs');

const client = new Client({
  authStrategy: new LocalAuth(),
  puppeteer: {
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  },
});

client.on('qr', (qr) => {
  qrcode.generate(qr, { small: true });
  console.log('Scan the QR with your WhatsApp');
});

client.on('ready', () => {
  console.log('Bot is ready!');
});

client.on('message', async (msg) => {
  const text = msg.body.toLowerCase();

  if (text === '.help') {
    msg.reply(`Available Commands:
.help - Show this message
.say [text] - Echo back your message
.vo - Save view-once image or video
.image [prompt] - Generate an AI image
.block - Block this user`);
  }

  if (text.startsWith('.say ')) {
    msg.reply(msg.body.slice(5));
  }

  if (text === '.vo') {
    if (msg.hasMedia && msg.isViewOnce) {
      const media = await msg.downloadMedia();
      await client.sendMessage(msg.from, media, {
        caption: 'Here is the view-once media you sent.',
      });
    } else {
      msg.reply('Please send a view-once image or video immediately after this command.');
    }
  }

  if (text.startsWith('.image ')) {
    const prompt = msg.body.slice(7);
    try {
      const response = await axios.post(
        'https://api.openai.com/v1/images/generations',
        {
          prompt,
          n: 1,
          size: '512x512',
        },
        {
          headers: {
            Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const imageUrl = response.data.data[0].url;
      const imageResp = await axios.get(imageUrl, { responseType: 'arraybuffer' });
      const media = new MessageMedia('image/jpeg', Buffer.from(imageResp.data, 'binary').toString('base64'));
      await client.sendMessage(msg.from, media, { caption: `Generated for: ${prompt}` });
    } catch (error) {
      console.error('Image generation error:', error.response?.data || error.message);
      msg.reply('Failed to generate image.');
    }
  }

  if (text === '.block') {
    try {
      await client.blockContact(msg.from);
      msg.reply('Blocked you as requested.');
    } catch (err) {
      msg.reply('Failed to block user.');
    }
  }
});

client.initialize();
