// src/handlers/ticketcreation.js
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const TicketSettings = require('../models/TicketSettings');
const { Generalsettings } = require('../models/Generalsettings');

async function createTicket(interaction, selectedCategory) {
    const settings = await TicketSettings.findOne({ guildId: interaction.guildId });
    const generalSettings = await Generalsettings.findOne({ guildId: interaction.guildId });

    if (!settings || !generalSettings) {
        throw new Error('Sistem ayarları bulunamadı!');
    }

    // Mevcut ticket kontrolü
    const existingTicket = interaction.guild.channels.cache.find(
        channel => channel.name === `ticket-${interaction.user.username.toLowerCase()}`
    );

    if (existingTicket) {
        throw new Error('Zaten açık bir ticket\'ınız bulunmaktadır.');
    }

    // Kategori ID'sini belirleme
    let categoryId = settings.kategori_id;
    switch (selectedCategory) {
        case 'kategori_1':
            categoryId = settings.kategori_1_id || settings.kategori_id;
            break;
        case 'kategori_2':
            categoryId = settings.kategori_2_id || settings.kategori_id;
            break;
        case 'kategori_3':
            categoryId = settings.kategori_3_id || settings.kategori_id;
            break;
        case 'kategori_4':
            categoryId = settings.kategori_4_id || settings.kategori_id;
            break;
    }

    // Ticket kanalı oluşturma
    const channel = await interaction.guild.channels.create({
        name: `ticket-${interaction.user.username.toLowerCase()}`,
        type: ChannelType.GuildText,
        parent: categoryId,
        permissionOverwrites: [
            {
                id: interaction.guild.id,
                deny: [PermissionFlagsBits.ViewChannel]
            },
            {
                id: interaction.user.id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ReadMessageHistory
                ]
            },
            {
                id: settings.yetkili_rol_id,
                allow: [
                    PermissionFlagsBits.ViewChannel,
                    PermissionFlagsBits.SendMessages,
                    PermissionFlagsBits.AttachFiles,
                    PermissionFlagsBits.ReadMessageHistory,
                    PermissionFlagsBits.ManageChannels
                ]
            }
        ]
    });

    return channel;
}

module.exports = { createTicket };