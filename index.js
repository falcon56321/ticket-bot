const fs = require('fs');
const path = require('path');
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const dotenv = require('dotenv');
const express = require('express');
const connectDB = require('./src/database');

dotenv.config();
connectDB();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.DirectMessages,
    ]
});

// Express app setup
const app = express();
const PORT = process.env.PORT || 3000;

// Body parser middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static file serving setup
app.use('/tickets', express.static(path.join(__dirname, 'src', 'tickets')));
app.use('/styles', express.static(path.join(__dirname, 'src', 'styles')));
app.use('/scripts', express.static(path.join(__dirname, 'src', 'scripts')));

// CORS middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    next();
});

// Root endpoint
app.get('/', (req, res) => {
    res.send({
        status: 'online',
        message: 'Discord Ticket System API is running',
        version: '1.0.0'
    });
});

// Transcript view endpoint
app.get('/view/:transcriptId', async (req, res) => {
    const transcriptPath = path.join(__dirname, 'src', 'tickets', `${req.params.transcriptId}`);
    
    try {
        if (fs.existsSync(transcriptPath)) {
            res.sendFile(transcriptPath);
        } else {
            res.status(404).send({
                error: 'Transcript not found',
                message: 'The requested transcript does not exist'
            });
        }
    } catch (error) {
        console.error('Transcript view error:', error);
        res.status(500).send({
            error: 'Server error',
            message: 'An error occurred while retrieving the transcript'
        });
    }
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.status(200).send({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime()
    });
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Application error:', err.stack);
    res.status(500).send({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!'
    });
});

// 404 handling
app.use((req, res) => {
    res.status(404).send({
        error: 'Not Found',
        message: 'The requested resource does not exist'
    });
});

// Start Express server
app.listen(PORT, () => {
    console.log(`
🚀 Server is running on http://localhost:${PORT}
📁 Tickets directory: ${path.join(__dirname, 'src', 'tickets')}
📁 Styles directory: ${path.join(__dirname, 'src', 'styles')}
📁 Scripts directory: ${path.join(__dirname, 'src', 'scripts')}
    `);
});

// Discord bot collections
client.commands = new Collection();
const commands = [];

// Event Handler
client.on('interactionCreate', async (interaction) => {
    try {
        if (interaction.isChatInputCommand()) {
            const command = client.commands.get(interaction.commandName);
            if (!command) return;

            await command.execute(interaction);
        } 
        else if (interaction.isStringSelectMenu()) {
            const interactionHandler = require('./src/events/interactionCreate');
            await interactionHandler.execute(interaction);
        }
    } catch (error) {
        console.error('Interaction handling error:', error);
        try {
            const errorResponse = {
                content: 'Bir hata oluştu! Lütfen daha sonra tekrar deneyin.',
                ephemeral: true
            };

            if (!interaction.replied) {
                await interaction.reply(errorResponse);
            } else {
                await interaction.followUp(errorResponse);
            }
        } catch (e) {
            console.error('Error sending error message:', e);
        }
    }
});

// Initialize function
async function initialize() {
    try {
        // Create necessary directories if they don't exist
        const directories = ['tickets', 'styles', 'scripts'].map(dir => 
            path.join(__dirname, 'src', dir)
        );

        await Promise.all(directories.map(dir => 
            fs.promises.mkdir(dir, { recursive: true })
        ));

        // Load handlers
        const handlersPath = path.join(__dirname, 'src', 'handlers');
        const handlerFiles = fs.readdirSync(handlersPath).filter(file => file.endsWith('.js'));

        for (const file of handlerFiles) {
            const handler = require(path.join(handlersPath, file));
            if (file === 'commandHandler.js') {
                handler.executeCommands(client, commands);
            } else if (file === 'eventHandler.js') {
                handler(client);
            }
        }

        // Register slash commands
        const { execute: registerCommands } = require('./src/events/slashRegister');
        await registerCommands();

        // Login to Discord
        await client.login(process.env.TOKEN);
        
        console.log(`
✨ Discord Bot initialized successfully!
🤖 Logged in as: ${client.user.tag}
🔧 Command count: ${commands.length}
        `);
    } catch (error) {
        console.error('Initialization error:', error);
        process.exit(1);
    }
}

// Handle process errors
process.on('unhandledRejection', (error) => {
    console.error('Unhandled promise rejection:', error);
});

process.on('uncaughtException', (error) => {
    console.error('Uncaught exception:', error);
    process.exit(1);
});

// Start the application
initialize().catch(error => {
    console.error('Failed to initialize:', error);
    process.exit(1);
});