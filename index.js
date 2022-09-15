require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser')
const axios = require('axios');
const nodeCron = require('node-cron');

const { TOKEN, SERVER_URL } = process.env;

const TELEGRAM_API = `https://api.telegram.org/bot${TOKEN}`;
const URI = `/webhook/${TOKEN}`;
const WEBHOOK_URL = SERVER_URL + URI;

const app = express()
app.use(bodyParser.json())
let existCronTask;

const init = async () => {
    const res = await axios.get(`${TELEGRAM_API}/setWebhook?url=${WEBHOOK_URL}`);
    console.log(res.data);
}

app.post(URI, async (req, res) => {
    console.log(req.body);

    const chatId = req.body.message.chat.id;
    const text = req.body.message.text;
    if (text === '/start' && !existCronTask) {
        existCronTask = nodeCron.schedule('5 * * * * *', async () => {
            // This job will run every minute
            await axios.post(`${TELEGRAM_API}/sendMessage`, {
                chat_id: chatId,
                text: text
            });
            console.log(new Date().toLocaleTimeString());
        });
    }

    return res.send();
})

app.listen(process.env.PORT || 5000, async () => {
    await init();
    console.log('app running on port', process.env.PORT || 5000);
})