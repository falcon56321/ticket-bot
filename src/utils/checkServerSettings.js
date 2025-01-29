async function checkServerSettings(guildId) {
    const [generalSettings, ticketSettings] = await Promise.all([
        Generalsettings.findOne({ guildId }),
        TicketSettings.findOne({ guildId })
    ]);

    const missingSettings = [];
    
    if (!generalSettings) missingSettings.push('Genel ayarlar');
    if (!ticketSettings) missingSettings.push('Ticket ayarları');

    return {
        isComplete: missingSettings.length === 0,
        missingSettings,
        generalSettings,
        ticketSettings
    };
}