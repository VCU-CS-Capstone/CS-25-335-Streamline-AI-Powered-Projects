const express = require('express');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });

const OpenAI = require('openai');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

console.log('Starting server...');
console.log('Env path:', path.join(__dirname, '..', '.env'));
console.log('API Key:', process.env.OPENAI_API_KEY ? 'Loaded (hidden for security)' : 'Not loaded');

// Configure OpenAI for v3.3.0
const configuration = new OpenAI.Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAI.OpenAIApi(configuration);

let conversationHistory = [
  {
    role: 'system',
    content: `You are TravelBot, a travel‑recommendation assistant.

    **Allowed Destinations (Honeymoon & Romance)**
    - Caribbean: Jamaica, St. Lucia, St. Vincent and the Grenadines, Grenada, Antigua, Barbados, Dominican Republic, Curaçao, Aruba, St. Kitts and Nevis
    - Mexico: Cancun, Riviera Maya, Yucatan Peninsula, Puerto Vallarta, Cabo San Lucas
    - Hawaii: Oahu, Maui, Kauai
    - Latin America: Costa Rica, Panama, Belize
    - Greece: Santorini, Mykonos, Athens
    - Italy: Amalfi Coast, Venice, Tuscany, Florence, Rome

    **Allowed Destinations (Family)**
    - Caribbean: Jamaica, Dominican Republic, Turks and Caicos, Bahamas, Curaçao, Aruba
    - Mexico: Cancun, Riviera Maya, Yucatan Peninsula, Puerto Vallarta, Cabo San Lucas
    - Hawaii: Oahu, Maui, Kauai, Big Island
    - Latin America: Belize, Costa Rica, Panama
    - United Kingdom: England, Ireland, Scotland
    - Florida: Florida Keys, Tampa/Clearwater/Siesta Key, Destin, Daytona/Cocoa Beach/Palm Coast, Orlando

    **Rules**
    1. Never mention destinations outside this list.
    2. If the user asks for something off‑list, suggest the closest match *from the list only*.
    3. When the user is ready to book or knows what they want, finish by pointing them to https://www.sandals.com/?referral=138577 (Just the link without any embedding)

    Follow these rules verbatim.`
  },
];

app.post('/api/openai', async (req, res) => {
  console.log('Received request to /api/openai');
  console.log('Request body:', req.body);

  const { prompt } = req.body;

  if (!prompt) {
    console.log('No prompt provided in request');
    return res.status(400).json({ error: 'No prompt provided' });
  }

  conversationHistory.push({ role: 'user', content: prompt });

  try {
    console.log('Calling OpenAI API with messages:', conversationHistory);
    const response = await openai.createChatCompletion({
      model: 'ft:gpt-4o-mini-2024-07-18:personal:paradiseportfolios:BESKsn4l',
      messages: conversationHistory,
      temperature: 0.7,
    });

    console.log('OpenAI API response received:', response.data.choices[0].message);
    const assistantMessage = response.data.choices[0].message;
    conversationHistory.push(assistantMessage);

    console.log('Sending response to client:', { content: assistantMessage.content });
    res.json({ content: assistantMessage.content });
  } catch (error) {
    console.error('Error calling OpenAI API:', error.message);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
});

app.get('/test', (req, res) => {
  console.log('Received request to /test');
  res.send('Server is working!');
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
