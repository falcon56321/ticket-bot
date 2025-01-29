const { EmbedBuilder } = require('discord.js');
const { createTicket } = require('../handlers/ticketActions');
const { createCategoryMenu } = require('../handlers/categorySelection');
const { createTicketComponents } = require('../utils/ticketComponents');
const { closeTicket } = require('../handlers/ticketClosing');
const { Generalsettings } = require('../models/Generalsettings');

module.exports = {
    name: 'interactionCreate',
    async execute(interaction) {
        if (!interaction.guild) {
            try {
                await interaction.reply({
                    content: 'Bu komut sadece sunucularda kullanılabilir!',
                    ephemeral: true
                });
            } catch (error) {
                console.error('Guild check error:', error);
            }
            return;
        }
        
        if (!interaction.isStringSelectMenu()) return;
        if (interaction.customId !== 'kategori_secenek' && interaction.customId !== 'ticket_actions') return;

        // Create a flag to track if we've handled the interaction
        let hasInteractionBeenHandled = false;

        try {
            // Ticket actions logic
            if (interaction.customId === 'ticket_actions') {
                if (interaction.values[0] === 'close_ticket') {
                    // Don't defer here, let closeTicket handle the initial response
                    try {
                        await closeTicket(interaction);
                        hasInteractionBeenHandled = true;
                    } catch (error) {
                        console.error('Ticket kapatma hatası:', error);
                        if (!interaction.replied && !interaction.deferred) {
                            await interaction.reply({
                                content: 'Ticket kapatılırken bir hata oluştu!',
                                ephemeral: true
                            });
                            hasInteractionBeenHandled = true;
                        }
                    }
                    return;
                } else if (interaction.values[0] === 'reset5') {
                    await interaction.deferReply({ ephemeral: true });
                    hasInteractionBeenHandled = true;
                    try {
                        const { ticketMenuRow } = createTicketComponents();
                        await interaction.message.edit({ components: [ticketMenuRow] });
                        await interaction.editReply({
                            content: 'Menü sıfırlandı!',
                            ephemeral: true
                        });
                    } catch (error) {
                        console.error('Menü sıfırlama hatası:', error);
                        // Error handling...
                    }
                    return;
                }
            }

            // Category selection logic
            if (interaction.customId === 'kategori_secenek') {
                if (!hasInteractionBeenHandled) {
                    await interaction.deferReply({ ephemeral: true });
                    hasInteractionBeenHandled = true;
                }
                
                const selectedCategory = interaction.values[0];

                if (selectedCategory === 'reset') {
                    const { row, embed } = await createCategoryMenu(interaction.guildId);
                    await interaction.message.edit({
                        embeds: [embed],
                        components: [row]
                    });
                    await interaction.editReply({
                        content: 'Kategori seçimi sıfırlandı!',
                        ephemeral: true
                    });
                    return;
                }

                const validCategories = ['kategori_1', 'kategori_2', 'kategori_3', 'kategori_4'];
                if (!validCategories.includes(selectedCategory)) {
                    await interaction.editReply({
                        content: 'Geçersiz kategori seçimi!',
                        ephemeral: true
                    });
                    return;
                }

                try {
                    const channel = await createTicket(interaction, selectedCategory);
                    if (!channel) throw new Error('Ticket oluşturulamadı');

                    const { ticketMenuRow } = createTicketComponents();
                    const generalSettings = await Generalsettings.findOne({ guildId: interaction.guild.id });
                    
                    if (!generalSettings) {
                        await interaction.editReply({
                            content: 'Sunucu ayarları yapılmamış! Lütfen önce /genelkurulum komutunu kullanın.',
                            ephemeral: true
                        });
                        return;
                    }

                    const welcomeEmbed = new EmbedBuilder()
                        .setColor(generalSettings?.dogrurenk || '#0099ff')
                        .setTitle('Ticket Oluşturuldu')
                        .setDescription(`
                            Merhaba ${interaction.user}!
                            Ticket'ınız başarıyla oluşturuldu.
                            Lütfen sorununuzu detaylı bir şekilde açıklayın.
                        `)
                        .setTimestamp()
                        .setFooter({ text: 'Ati Development' });

                    if (generalSettings?.sunucuismi && generalSettings?.sunucuiconurl) {
                        welcomeEmbed.setAuthor({
                            name: generalSettings.sunucuismi,
                            iconURL: generalSettings.sunucuiconurl
                        });
                    }

                    await channel.send({
                        embeds: [welcomeEmbed],
                        components: [ticketMenuRow]
                    });

                    await interaction.editReply({
                        content: `Ticket oluşturuldu: ${channel}`,
                        ephemeral: true
                    });

                } catch (error) {
                    console.error('Ticket oluşturma hatası:', error);
                    await interaction.editReply({
                        content: 'Ticket oluşturulurken bir hata oluştu!',
                        ephemeral: true
                    });
                }
            }
        } catch (error) {
            console.error('Genel hata:', error);
            if (!hasInteractionBeenHandled) {
                try {
                    await interaction.reply({
                        content: 'Bir hata oluştu! Lütfen daha sonra tekrar deneyin.',
                        ephemeral: true
                    });
                } catch (e) {
                    console.error('Error sending error message:', e);
                }
            }
        }
    }
};