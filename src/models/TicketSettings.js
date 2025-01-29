const mongoose = require('mongoose');

const TicketSettingsSchema = new mongoose.Schema({
  guildId: { 
    type: String, 
    required: true, 
    unique: true 
  },
  kategori_id: String,
  yetkili_rol_id: String,
  ticket_log_id: String,
  ticket_kapanacak_kategori_id: String,
  ustyonetim_kategori_id: String,
  ustyonetim_kapanacak_kategori_id: String,
});

module.exports = mongoose.model('TicketSettings', TicketSettingsSchema);