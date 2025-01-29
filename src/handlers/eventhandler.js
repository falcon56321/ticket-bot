const fs = require('fs');
const path = require('path');

const loadEvents = (client) => {
    const eventsPath = path.join(__dirname, '../events');
    const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

    for (const file of eventFiles) {
        const filePath = path.join(eventsPath, file);
        const event = require(filePath);

        // Olay ismi ve fonksiyonu
        client.on(event.name, (...args) => event.execute(client, ...args));
        console.log(`Loaded event: ${event.name}`);
    }
};

// Fonksiyonu direkt olarak export edelim
module.exports = loadEvents;
