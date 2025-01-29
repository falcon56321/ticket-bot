const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const { Generalsettings } = require('../models/Generalsettings');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('genelkurulum')
    .setDescription('Sunucu genel kurulum ayarlarını yapar.')
    .addStringOption(option =>
      option.setName('sunucuismi')
        .setDescription('Sunucu ismi')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sunucuiconurl')
        .setDescription('Sunucu icon URL\'si')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sunucubannerurl')
        .setDescription('Sunucu banner URL\'si')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('emoji')
        .setDescription('Discord emoji')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('fivemlink')
        .setDescription('FiveM sunucu linki')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('sunucuip')
        .setDescription('Sunucu IP adresi')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('banhammer')
        .setDescription('Ban Hammer rolü')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('yetkiliekip')
        .setDescription('Yetkili ekip rolü')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('hatarenk')
        .setDescription('Hata renk kodu (hex formatında)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('dogrurenk')
        .setDescription('Doğru renk kodu (hex formatında)')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('ticketrenk')
        .setDescription('Ticket renk kodu (hex formatında)')
        .setRequired(true))
    .addRoleOption(option =>
      option.setName('whitelistpermi')
        .setDescription('Whitelist rolü')
        .setRequired(true)),

  async execute(interaction) {
    if (!interaction.guildId) {
      await interaction.reply({
        content: 'Bu komut yalnızca sunucularda kullanılabilir!',
        ephemeral: true
      });
      return;
    }

    const guildId = interaction.guildId;
    const sunucuismi = interaction.options.getString('sunucuismi');
    const sunucuiconurl = interaction.options.getString('sunucuiconurl');
    const sunucubannerurl = interaction.options.getString('sunucubannerurl');
    const emoji = interaction.options.getString('emoji');
    const fivemlink = interaction.options.getString('fivemlink');
    const sunucuip = interaction.options.getString('sunucuip');
    const banhammer = interaction.options.getRole('banhammer');
    const yetkiliekip = interaction.options.getRole('yetkiliekip');
    const hatarenk = interaction.options.getString('hatarenk');
    const dogrurenk = interaction.options.getString('dogrurenk');
    const ticketrenk = interaction.options.getString('ticketrenk');
    const whitelistpermi = interaction.options.getRole('whitelistpermi');

    // Hex renk kodu geçerliliğini kontrol et
    const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
    if (!hexColorRegex.test(hatarenk) || !hexColorRegex.test(dogrurenk) || !hexColorRegex.test(ticketrenk)) {
      const errorEmbed = new EmbedBuilder()
        .setColor('#FF0000') // Red for error
        .setTitle('Geçersiz Renk Kodu!')
        .setDescription('Renk kodları geçersiz formatta! Lütfen doğru bir hex renk kodu (örneğin: #FFFFFF) girin.')
        .setFooter({ text: 'Ati Development' })
        .setTimestamp();

      await interaction.reply({ embeds: [errorEmbed], ephemeral: true });
      return;
    }

    try {
      // Veritabanında mevcut ayarları bul ve güncelle
      const settings = await Generalsettings.findOneAndUpdate(
        { guildId }, // Sunucu ID'sine göre bul
        {
          sunucuismi,
          sunucuiconurl,
          sunucubannerurl,
          emoji,
          fivemlink,
          sunucuip,
          banhammer: banhammer.id,
          yetkiliekip: yetkiliekip.id,
          hatarenk,
          dogrurenk,
          ticketrenk,
          whitelistpermi: whitelistpermi.id,
        },
        { 
          upsert: true, // Eğer kayıt yoksa oluştur
          new: true     // Güncellenmiş dokümanı döndür
        }
      );

      // Başarı embed mesajı: Yeni veri ya da güncellenmiş veri
      const successEmbed = new EmbedBuilder()
        .setColor(dogrurenk)
        .setTitle(settings ? 'Sunucu Genel Kurulum Güncellendi!' : 'Sunucu Genel Kurulum Başarılı!')
        .setDescription(settings ? 'Sunucu genel kurulum ayarları başarıyla güncellendi.' : 'Sunucu genel kurulum ayarları başarıyla yapıldı.')
        .addFields(
          { name: 'Sunucu İsmi', value: sunucuismi, inline: true },
          { name: 'Sunucu Icon URL', value: sunucuiconurl, inline: true },
          { name: 'Sunucu Banner URL', value: sunucubannerurl, inline: true },
          { name: 'Emoji', value: emoji, inline: true },
          { name: 'FiveM Link', value: fivemlink, inline: true },
          { name: 'Sunucu IP', value: sunucuip, inline: true },
          { name: 'Ban Hammer Rolü', value: `<@&${banhammer.id}>`, inline: true },
          { name: 'Yetkili Ekip Rolü', value: `<@&${yetkiliekip.id}>`, inline: true },
          { name: 'Hata Renk Kodu', value: hatarenk, inline: true },
          { name: 'Doğru Renk Kodu', value: dogrurenk, inline: true },
          { name: 'Ticket Renk Kodu', value: ticketrenk, inline: true },
          { name: 'Whitelist İzin Rolü', value: `<@&${whitelistpermi.id}>`, inline: true },
        )
        .setFooter({ text: 'Ati Development' })
        .setTimestamp();

      await interaction.reply({ embeds: [successEmbed] });

    } catch (error) {
      console.error('Sunucu genel kurulum ayarları kaydedilirken hata oluştu:', error);
      await interaction.reply({
        content: 'Sunucu genel kurulum ayarları kaydedilirken bir hata oluştu!',
        ephemeral: true
      });
    }
  },
};
