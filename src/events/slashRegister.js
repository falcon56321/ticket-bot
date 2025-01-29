const { REST, Routes } = require('discord.js');
const dotenv = require('dotenv');
const fs = require('fs');
const path = require('path');

dotenv.config();

const commands = [];
const commandsPath = path.resolve(__dirname, '../commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

commandFiles.forEach(file => {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);

    if ('data' in command && ('execute' in command || 'run' in command)) {
        commands.push(command.data.toJSON());
    }
});

const rest = new REST({ version: '10' }).setToken(process.env.TOKEN);

async function execute() {
    try {
        // Global komut kaydetme
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );
    } catch (error) {
        console.error('Error registering commands:', error);
    }
}

module.exports = { execute };
