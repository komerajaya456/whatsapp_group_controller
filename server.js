const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const fs = require('fs');


// Initialize the WhatsApp client


// const client = new Client({
//     // No authStrategy specified, meaning no session persistence
// });

const client = new Client({
    authStrategy: new LocalAuth()  // This saves session data in .wwebjs_auth
});


// Generate QR Code for WhatsApp
client.on('qr', (qr) => {
    console.log('Scan the QR code below to log in:');
    qrcode.generate(qr, { small: true });
});


// Map to track WhatsApp users requesting movies
const requestMap = {};


// Load existing data from data.json if it exists
let messageData = {};
const dataFilePath = './data.json';

if (fs.existsSync(dataFilePath)) {
    try {
        const rawData = fs.readFileSync(dataFilePath, 'utf8');
        messageData = JSON.parse(rawData);
    } catch (error) {
        console.error('Error reading data.json:', error);
    }
}

// WhatsApp Bot Ready
client.on('ready', () => {
    console.log('WhatsApp bot is ready!');
    logMessage('WhatsApp bot is ready!');
});

// Handle WhatsApp Messages
client.on('message', async (message) => {
   

    const senderPhone = message.from.split('@')[0]; // Extract phone number
    const senderName = message._data.notifyName || senderPhone; // Use group-specific name if available
    const messageBody = message.body;

    // Reply to the user
        message.reply(`${senderName} BID : ${messageBody}`);
        console.log(`Message from ${senderName} : ${messageBody}`);

    // Save the message to the messageData object
    if (!messageData[senderName]) {
        messageData[senderName] = {
            name: senderName,
            messages: []
        };
    }

    // Add the message to the user's message history
    messageData[senderName].messages.push(messageBody);

    // Save the updated data to data.json
    try {
        fs.writeFileSync(dataFilePath, JSON.stringify(messageData, null, 2));
        console.log('Message saved to data.json');
    } catch (error) {
        console.error('Error writing to data.json:', error);
    }
});



client.on('auth_failure', (msg) => {
    console.error('Authentication failed:', msg);
});

// Handle client errors
client.on('error', (error) => {
    console.error('Error:', error);
});

// Initialize the client
client.initialize();