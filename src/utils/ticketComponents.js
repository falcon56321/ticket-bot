// src/utils/ticketComponents.js
const { ActionRowBuilder, StringSelectMenuBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

function createTicketComponents() {
    // Ticket menüsü için row
    const ticketMenuRow = new ActionRowBuilder()
        .addComponents(
            new StringSelectMenuBuilder()
                .setCustomId('ticket_actions')
                .setPlaceholder('Ticket İşlemleri')
                .addOptions([
                    {
                        label: 'Ticket\'ı Kapat',
                        value: 'close_ticket',
                        emoji: '🔒'
                    },
                    {
                        label: 'Bildirim Gönder',
                        value: 'ticket_notification',
                        emoji: '📢'
                    },
                    {
                        label: 'Seçimi Sıfırla',
                        value: 'reset5',
                        emoji: '🔄'
                    }
                ])
        );

    return { ticketMenuRow };
}

module.exports = { createTicketComponents };