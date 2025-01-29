const { SlashCommandBuilder, ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const TicketSettings = require('../models/TicketSettings');
const { Generalsettings } = require('../models/Generalsettings');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ticket')
        .setDescription('Ticket oluşturmak için kategori seçin.'),

    async execute(interaction) {
        if (!interaction.guildId) {
            await interaction.reply({
                content: 'Bu komut yalnızca sunucularda kullanılabilir!',
                ephemeral: true
            });
            return;
        }

        try {
            const generalSettings = await Generalsettings.findOne({ guildId: interaction.guildId });
            if (!generalSettings) {
                await interaction.reply({
                    content: 'Sunucu ayarları yapılmamış! Lütfen bot yöneticisine başvurun.',
                    ephemeral: true
                });
                return;
            }

            // Kategori seçim menüsü
            const row = new ActionRowBuilder()
                .addComponents(
                    new StringSelectMenuBuilder()
                        .setCustomId('kategori_secenek')
                        .setPlaceholder('Bir kategori seçin')
                        .addOptions([
                            {
                                label: 'IC DESTEK',
                                value: 'kategori_1',
                                emoji: '👤',
                                description: 'Oyun içi destek için bu kategoriyi seçin'
                            },
                            {
                                label: 'OOC DESTEK',
                                value: 'kategori_2',
                                emoji: '👥',
                                description: 'Oyun dışı destek için bu kategoriyi seçin'
                            },
                            {
                                label: 'ŞİKAYET DESTEK',
                                value: 'kategori_3',
                                emoji: '⚠️',
                                description: 'Şikayet bildirmek için bu kategoriyi seçin'
                            },
                            {
                                label: 'BUG REPORT',
                                value: 'kategori_4',
                                emoji: '🐛',
                                description: 'Bug bildirmek için bu kategoriyi seçin'
                            },
                            {
                                label: 'Seçimi Sıfırla',
                                value: 'reset',
                                emoji: '🔄',
                                description: 'Kategori seçimini sıfırla'
                            }
                        ])
                );

            // Embed mesajı
            const embed = new EmbedBuilder()
                .setDescription('Destek talebi oluşturmak için aşağıdaki menüden kategori seçin.')
                .setColor(generalSettings.ticketrenk || '#0099FF');

            if (generalSettings.sunucubannerurl) {
                embed.setImage(generalSettings.sunucubannerurl);
            }

            if (generalSettings.sunucuismi && generalSettings.sunucuiconurl) {
                embed.setAuthor({
                    name: generalSettings.sunucuismi,
                    iconURL: generalSettings.sunucuiconurl
                });
            }

            await interaction.reply({
                embeds: [embed],
                components: [row],
                ephemeral: false
            });
        } catch (error) {
            console.error('Ticket komutu hatası:', error);
            await interaction.reply({
                content: 'Bir hata oluştu! Lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            });
        }
    }
};