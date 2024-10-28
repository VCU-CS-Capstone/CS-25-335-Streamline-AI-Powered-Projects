// Import required modules
const express = require('express');
const path = require('path');
require('dotenv').config();

const OpenAI = require('openai');

const app = express();
const port = 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, '..')));

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Conversation history stored per session (this is a basic implementation)
let conversationHistory = [
  {
    role: 'system',
    content: `You are a helpful assistant named TravelBot that recommends travel destinations based on the user's preferences, only using the provided list of destinations for honeymoon and romance travels (Caribbean: Jamaica, St. Lucia, St. Vincent and the Grenadines, Grenada, Antigua, Barbados, Dominican Republic, Curaçao, Aruba, St. Kitts and Nevis; Mexico: Cancun, Riviera Maya, Yucatan Peninsula, Puerto Vallarta, Cabo San Lucas; Hawaii: Oahu, Maui, Kauai; Latin America: Costa Rica, Panama, Belize; Greece: Santorini, Mykonos, Athens; Italy: Amalfi Coast, Venice, Tuscany, Florence, Rome) and family vacations (Caribbean: Jamaica, Dominican Republic, Turks and Caicos, Bahamas, Curaçao, Aruba; Mexico: Cancun, Riviera Maya, Yucatan Peninsula, Puerto Vallarta, Cabo San Lucas; Hawaii: Oahu, Maui, Kauai, Big Island; Latin America: Belize, Costa Rica, Panama; United Kingdom: England, Ireland, Scotland; Florida: Florida Keys, Tampa/Clearwater/Siesta Key, Destin, Daytona/Cocoa Beach/Palm Coast, Orlando); do not mention or recommend any destinations outside of these. IN THE CASE THAT SOMEONE WANTS SOMETHING OUTSIDE OF THIS LIST, TELL THEM THE CLOSEST OPTION TO WHAT THEY WANT THAT OUR LIST OFFERS AND NOTHING OUTSIDE OF THE LIST. IF THEY WANT A NON-HOT Climate then *tell the user that we only have tropical destinations* then follow up with "but of our available destinations *insert location* relates best with what you desire" DO THIS STRATEGY FOR EVERY QUESTION THAT DOESN'T SEEM LIKE IT MATCHES WITH ONE OF OUR LOCATIONS`,
  },
];

app.post('/api/openai', async (req, res) => {
  const { prompt } = req.body;

  // Add the user's message to the conversation history
  conversationHistory.push({ role: 'user', content: prompt });

  try {
    const response = await openai.chat.completions.create({
      model: 'ft:gpt-4o-mini-2024-07-18:personal:hotelbot:AGFmNIcw', // Updated model name to a default one
      messages: conversationHistory,
      temperature: 0.7,
    });

    const assistantMessage = response.choices[0].message;

    // Add the assistant's response to the conversation history
    conversationHistory.push(assistantMessage);

    // Return the assistant's message to the client
    res.json(assistantMessage);
  } catch (error) {
    console.error('Error calling OpenAI API:', error);
    res.status(500).json({ error: 'Error communicating with OpenAI API' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
