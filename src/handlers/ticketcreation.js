// src/handlers/ticketcreation.js
const { ChannelType, PermissionFlagsBits } = require('discord.js');
const { TicketSettings } = require('../models/TicketSettings');
const { Generalsettings } = require('../models/Generalsettings');

async function createTicket(interaction, selectedCategory) {
    try {
        const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });
        const generalSettings = await Generalsettings.findOne({ guildId: interaction.guild.id });

        if (!settings || !generalSettings) {
            throw new Error('Sunucu ayarları eksik! Lütfen tüm gerekli kurulumları tamamlayın.');
        }

        // Mevcut ticket kontrolü
        const existingTicket = interaction.guild.channels.cache.find(
            channel => channel.name === `ticket-${interaction.user.username.toLowerCase()}`
        );

        if (existingTicket) {
            throw new Error('Bu sunucuda zaten açık bir ticket\'ınız bulunmaktadır.');
        }

        if (!interaction.member.roles.cache.has(settings.yetkili_rol_id)) {
            throw new Error('Bu işlem için gerekli yetkiye sahip değilsiniz!');
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

    } catch (error) {
        console.error('Ticket creation error:', error);
        throw error; // Hatayı yukarı fırlat
    }
}

module.exports = { createTicket };