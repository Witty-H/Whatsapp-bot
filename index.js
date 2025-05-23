const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');

const client = new Client({
    authStrategy: new LocalAuth()
});

client.on('qr', qr => {
    console.log('Scan this QR code:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Bot is ready!');
});

client.on('message', async msg => {
    if (!msg.body.startsWith('!')) return; // Commands start with !

    const args = msg.body.slice(1).trim().split(/ +/);
    const command = args.shift().toLowerCase();

    switch(command) {
        case 'hi':
            await msg.reply('Hello! I\'m your advanced bot.');
            break;

        case 'download':
            if (msg.hasMedia) {
                const media = await msg.downloadMedia();
                // Save media to local (or do something)
                await msg.reply('Media downloaded! (Check your server storage)');
            } else {
                await msg.reply('No media found in your message.');
            }
            break;

        case 'viewonce':
            if (msg.hasMedia && msg._data.type === 'view_once') {
                const media = await msg.downloadMedia();
                await msg.reply('View-once media downloaded!');
            } else {
                await msg.reply('This is not a view-once media.');
            }
            break;

        case 'block':
            if (args.length === 0) {
                await msg.reply('Please provide a number to block (e.g., !block 1234567890).');
                break;
            }
            try {
                const number = args[0] + '@c.us';
                await client.contactBlock(number);
                await msg.reply(`Blocked ${args[0]}`);
            } catch (e) {
                await msg.reply('Failed to block the user.');
            }
            break;

        case 'unblock':
            if (args.length === 0) {
                await msg.reply('Please provide a number to unblock (e.g., !unblock 1234567890).');
                break;
            }
            try {
                const number = args[0] + '@c.us';
                await client.contactUnblock(number);
                await msg.reply(`Unblocked ${args[0]}`);
            } catch (e) {
                await msg.reply('Failed to unblock the user.');
            }
            break;

        case 'ping':
            await msg.reply('Pong!');
            break;

        case 'joke':
            // You can replace with API call to joke API
            await msg.reply('Why don’t scientists trust atoms? Because they make up everything!');
            break;

        case 'generatepic':
            await msg.reply('Image generation coming soon! (API integration needed)');
            break;

        default:
            await msg.reply('Unknown command. Try !hi, !download, !block, !joke, !ping');
    }
});

client.initialize();