// c:\Users\Ati\Desktop\test\src\models\Generalsettings.js
const { Schema, model } = require('mongoose');

const generalSettingsSchema = new Schema({
  guildId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  sunucuismi: String,         // String value
  sunucuiconurl: String,      // String value
  sunucubannerurl: String,    // String value
  emoji: String,              // String value
  fivemlink: String,          // String value
  sunucuip: String,           // String value
  banhammer: String,          // Role ID (String)
  yetkiliekip: String,        // Role ID (String)
  hatarenk: String,           // String (Hex Color)
  dogrurenk: String,          // String (Hex Color)
  ticketrenk: String,          // String (Hex Color)
  whitelistpermi: String,     // Role ID (String)
});

// Modeli oluştur
const Generalsettings = model('Generalsettings', generalSettingsSchema);

module.exports = { Generalsettings };