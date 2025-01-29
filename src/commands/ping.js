const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('ping')
        .setDescription('Replies with Pong!'),
    run: async (interaction) => {
        // Eğer özel mesajda çağrılırsa
        if (!interaction.guildId) {
            await interaction.reply({
                content: 'Bu komut yalnızca sunucularda kullanılabilir!', 
                ephemeral: true 
            });
            return;
        }

        await interaction.reply('Pong!');
    }
};