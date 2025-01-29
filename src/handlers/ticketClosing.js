const { EmbedBuilder } = require('discord.js');
const discordTranscripts = require('discord-html-transcripts');
const moment = require('moment');
const path = require('path');
const fs = require('fs').promises;
const TicketSettings = require('../models/TicketSettings');
const { Generalsettings } = require('../models/Generalsettings');

// Template ve stil dosyalarının yolları
const TEMPLATE_PATH = path.join(__dirname, '../templates/transcript.html');
const STYLES_PATH = path.join(__dirname, '../styles/transcript.css');
const SCRIPTS_PATH = path.join(__dirname, '../scripts/transcript.js');

async function loadTemplateFiles() {
    try {
        const [template, styles, scripts] = await Promise.all([
            fs.readFile(TEMPLATE_PATH, 'utf8'),
            fs.readFile(STYLES_PATH, 'utf8'),
            fs.readFile(SCRIPTS_PATH, 'utf8')
        ]);
        return { template, styles, scripts };
    } catch (error) {
        console.error('Template dosyaları yüklenirken hata:', error);
        throw error;
    }
}

async function getTicketOwner(channel) {
    try {
        const username = channel.name.split('-')[1];
        if (!username) return 'Bilinmeyen Kullanıcı';

        const member = await channel.guild.members.cache.find(
            m => m.user.username.toLowerCase() === username.toLowerCase()
        );

        return member ? member.user.tag : username;
    } catch (error) {
        console.error('Ticket sahibi bulunurken hata:', error);
        return 'Bilinmeyen Kullanıcı';
    }
}

async function generateTranscriptHtml(channel, closedBy) {
    try {
        const { template, styles, scripts } = await loadTemplateFiles();
        const ticketOwner = await getTicketOwner(channel);

        const transcriptContent = await discordTranscripts.createTranscript(channel, {
            limit: -1,
            returnType: 'string',
            filename: `${channel.name}.html`,
            minify: false,
            saveImages: true,
            poweredBy: false
        });

        let html = template
            .replace('</head>', `<style>${styles}</style></head>`)
            .replace('</body>', `<script>${scripts}</script></body>`);

        html = html
            .replace(/{{ticketName}}/g, channel.name)
            .replace('{{createdAt}}', moment().format('DD/MM/YYYY HH:mm'))
            .replace('{{ticketOwner}}', ticketOwner)
            .replace('{{serverName}}', channel.guild.name)
            .replace('{{closedBy}}', closedBy.tag)
            .replace('{{content}}', transcriptContent);

        return html;
    } catch (error) {
        console.error('Transcript oluşturma hatası:', error);
        throw error;
    }
}

async function closeTicket(interaction) {
    try {
        if (!interaction.guild) {
            throw new Error('Bu komut sadece sunucularda kullanılabilir!');
        }

        const settings = await TicketSettings.findOne({ guildId: interaction.guild.id });
        const generalSettings = await Generalsettings.findOne({ guildId: interaction.guild.id });

        if (!settings || !generalSettings) {
            throw new Error('Sistem ayarları bulunamadı!');
        }

        if (!interaction.member.roles.cache.has(settings.yetkili_rol_id)) {
            if (!interaction.replied && !interaction.deferred) {
                await interaction.reply({
                    content: 'Bu işlemi gerçekleştirmek için yetkiniz yok!',
                    ephemeral: true
                });
            }
            return;
        }

        const channel = interaction.channel;
        const closingEmbed = new EmbedBuilder()
            .setColor(generalSettings.hatarenk || '#FF0000')
            .setTitle('Ticket Kapatılıyor')
            .setDescription('Bu ticket 5 saniye içinde kapanacaktır.')
            .setTimestamp()
            .setFooter({ text: 'Ati Development' });

        // Check if the interaction has been handled
        if (!interaction.replied && !interaction.deferred) {
            await interaction.reply({
                embeds: [closingEmbed],
                ephemeral: true
            });
        } else {
            await interaction.editReply({
                embeds: [closingEmbed],
                ephemeral: true
            });
        }

        const closedBy = interaction.user;

        return new Promise((resolve, reject) => {
            setTimeout(async () => {
                try {
                    const uniqueFileName = `${channel.name}-${moment().format('YYYY-MM-DD-HH-mm')}.html`;
                    const ticketsDir = path.join(process.cwd(), 'src', 'tickets');

                    await fs.mkdir(ticketsDir, { recursive: true });
                    const transcriptHtml = await generateTranscriptHtml(channel, closedBy);
                    const filePath = path.join(ticketsDir, uniqueFileName);
                    await fs.writeFile(filePath, transcriptHtml);

                    const logChannel = interaction.guild.channels.cache.get(settings.ticket_log_id);
                    if (logChannel) {
                        const baseURL = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
                        
                        const logEmbed = new EmbedBuilder()
                            .setColor(generalSettings.hatarenk || '#FF0000')
                            .setTitle('Ticket Kapatıldı')
                            .setDescription(`
                                **Ticket:** ${channel.name}
                                **Kapatan Yetkili:** ${closedBy.tag}
                                **Tarih:** ${moment().format('DD/MM/YYYY HH:mm')}
                            `)
                            .addFields([{
                                name: 'Transcript',
                                value: `[Ticket Detaylarını Görüntüle](${baseURL}/view/${uniqueFileName})`
                            }])
                            .setTimestamp()
                            .setFooter({ text: 'Ati Development' });

                        await logChannel.send({ embeds: [logEmbed] });
                    }
                    
                    await channel.delete();
                    resolve();
                } catch (error) {
                    console.error('Ticket kapatma hatası:', error);
                    reject(error);
                }
            }, 5000);
        });
    } catch (error) {
        console.error('Ticket kapatma ana hatası:', error);
        throw error;
    }
}

module.exports = { closeTicket };