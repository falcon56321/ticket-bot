const fs = require('fs');
const path = require('path');

module.exports = {
    executeCommands: (client, commands) => {
        // Komutların bulunduğu dizini belirt
        const commandsPath = path.join(__dirname, '..', 'commands');
        const commandFolders = fs.readdirSync(commandsPath);

        let loadedCommandCount = 0;

        commandFolders.forEach(file => {
            const filePath = path.join(commandsPath, file);
            const stat = fs.lstatSync(filePath);

            if (stat.isDirectory()) {
                const commandFiles = fs.readdirSync(filePath).filter(file => file.endsWith('.js'));

                commandFiles.forEach(commandFile => {
                    const command = require(path.join(filePath, commandFile));

                    // Her iki metodu da kontrol et
                    if (command.data && (command.execute || command.run)) {
                        // Komutları koleksiyona ekle
                        client.commands.set(command.data.name, command);
                        commands.push(command.data.toJSON());
                        loadedCommandCount++;
                        console.log(`✅ Komut Yüklendi: ${command.data.name}`); // Komut ismini yazdır
                    }
                });
            } else if (stat.isFile() && file.endsWith('.js')) {
                const command = require(filePath);

                if (command.data && (command.execute || command.run)) {
                    client.commands.set(command.data.name, command);
                    commands.push(command.data.toJSON());
                    loadedCommandCount++;
                    console.log(`✅ Komut Yüklendi: ${command.data.name}`); // Komut ismini yazdır
                }
            }
        });

        console.log(`\n🤖 Toplam Yüklenen Komutlar: ${loadedCommandCount}\n`);

        return loadedCommandCount;
    }
};
