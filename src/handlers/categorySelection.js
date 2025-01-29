// src/handlers/categoryselection.js
const { ActionRowBuilder, StringSelectMenuBuilder, EmbedBuilder } = require('discord.js');
const { Generalsettings } = require('../models/Generalsettings');
const TicketSettings = require('../models/TicketSettings');

async function createCategoryMenu(guildId) {
    const generalSettings = await Generalsettings.findOne({ guildId });
    const ticketSettings = await TicketSettings.findOne({ guildId });

    if (!generalSettings || !ticketSettings) {
        throw new Error('Sunucu ayarları eksik! Lütfen gerekli kurulumları tamamlayın.');
    }

    const row = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('kategori_secenek')
                .setPlaceholder('Bir kategori seçin')
                .addOptions([
                    {
                        label: 'IC DESTEK',
                        value: 'kategori_1',
                        emoji: '👤'
                    },
                    {
                        label: 'OOC DESTEK',
                        value: 'kategori_2',
                        emoji: '👥'
                    },
                    {
                        label: 'ŞİKAYET DESTEK',
                        value: 'kategori_3',
                        emoji: '⚠️'
                    },
                    {
                        label: 'BUG REPORT',
                        value: 'kategori_4',
                        emoji: '🐛'
                    },
                    {
                        label: 'Seçimi Sıfırla',
                        value: 'reset',
                        emoji: '🔄'
                    }
                ])
        );

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

    return { row, embed };
}

module.exports = { createCategoryMenu };