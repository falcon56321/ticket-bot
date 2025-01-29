const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const TicketSettings = require('../models/TicketSettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ticketkur')
    .setDescription('Ticket ayarlarını kurar.')
    .addChannelOption(option => option.setName('kategori').setDescription('Ticket kategorisi').setRequired(true))
    .addRoleOption(option => option.setName('yetkili_rol').setDescription('Yetkili ekip rolü').setRequired(true))
    .addChannelOption(option => option.setName('ticket_log').setDescription('Ticket log kanalı').setRequired(true))
    .addChannelOption(option => option.setName('kapanacak_kategori').setDescription('Ticket kapanacak kategori').setRequired(true))
    // Yeni eklenen komut seçenekleri
    .addChannelOption(option => option.setName('ustyonetim_kategori').setDescription('Üst yönetim ticket kategorisi').setRequired(true))
    .addChannelOption(option => option.setName('ustyonetim_kapanacak_kategori').setDescription('Üst yönetim ticket kapanacak kategori').setRequired(true)),

  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'Bu komut yalnızca sunucularda kullanılabilir!',
        ephemeral: true
      });
      return;
    }

    const guildId = interaction.guildId;
    const kategori = interaction.options.getChannel('kategori');
    const yetkiliRol = interaction.options.getRole('yetkili_rol');
    const ticketLog = interaction.options.getChannel('ticket_log');
    const kapanacakKategori = interaction.options.getChannel('kapanacak_kategori');
    // Yeni eklenen kategori seçenekleri
    const ustYonetimKategori = interaction.options.getChannel('ustyonetim_kategori');
    const ustYonetimKapanacakKategori = interaction.options.getChannel('ustyonetim_kapanacak_kategori');
    
    try {
      const settings = await TicketSettings.findOneAndUpdate(
        { guildId },
        {
          guildId,
          kategori_id: kategori.id,
          yetkili_rol_id: yetkiliRol.id,
          ticket_log_id: ticketLog.id,
          ticket_kapanacak_kategori_id: kapanacakKategori.id,
          // Yeni eklenen alanlar
          ustyonetim_kategori_id: ustYonetimKategori.id,
          ustyonetim_kapanacak_kategori_id: ustYonetimKapanacakKategori.id
        },
        { 
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      );

      const settingsEmbed = new EmbedBuilder()
        .setColor(0x00FF00)
        .setTitle('Ticket Sistem Ayarları')
        .addFields(
          { name: 'Kategori', value: `<#${kategori.id}>`, inline: true },
          { name: 'Yetkili Rolü', value: `<@&${yetkiliRol.id}>`, inline: true },
          { name: 'Ticket Log Kanalı', value: `<#${ticketLog.id}>`, inline: true },
          { name: 'Kapanacak Kategori', value: `<#${kapanacakKategori.id}>`, inline: true },
          // Yeni eklenen alanlar için embed bilgileri
          { name: 'Üst Yönetim Kategori', value: `<#${ustYonetimKategori.id}>`, inline: true },
          { name: 'Üst Yönetim Kapanacak Kategori', value: `<#${ustYonetimKapanacakKategori.id}>`, inline: true }
        )
        .setFooter({ text: 'Ticket Sistem Ayarları' })
        .setTimestamp();

      await interaction.reply({ embeds: [settingsEmbed] });

    } catch (error) {
      console.error('Ticket ayarları kaydedilirken hata oluştu:', error);
      await interaction.reply({
        content: 'Ticket ayarları kaydedilirken bir hata oluştu!',
        ephemeral: true
      });
    }
  },
};