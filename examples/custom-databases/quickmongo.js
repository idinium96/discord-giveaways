const Discord = require('discord.js'),
    client = new Discord.Client(),
    settings = {
        prefix: 'g!',
        token: 'Your Discord Bot Token'
    };

// Load quickmongo
const { Database } = require('quickmongo');
const db = new Database('mongodb://localhost/giveaways');
db.on('ready', async () => {
    if ((await db.get('giveaways')) === null) await db.set('giveaways', []);
});

const { GiveawaysManager } = require('discord-giveaways');
class GiveawayManagerWithOwnDatabase extends GiveawaysManager {
    // This function is called when the manager needs to get all the giveaways stored in the database.
    async getAllGiveaways() {
        // Get all the giveaway in the database
        return await db.get('giveaways');
    }

    // This function is called when a giveaway needs to be saved in the database (when a giveaway is created or when a giveaway is edited).
    async saveGiveaway(messageID, giveawayData) {
        // Add the new one
        await db.push('giveaways', giveawayData);
        // Don't forget to return something!
        return true;
    }

    // This function is called when a giveaway needs to be edited in the database.
    async editGiveaway(messageID, giveawayData) {
        // Gets all the current giveaways
        const giveaways = await db.get('giveaways');
        // Remove the old giveaway from the current giveaways ID
        const newGiveawaysArray = giveaways.filter((giveaway) => giveaway.messageID !== messageID);
        // Push the new giveaway to the array
        newGiveawaysArray.push(giveawayData);
        // Save the updated array
        await db.set('giveaways', newGiveawaysArray);
        // Don't forget to return something!
        return true;
    }

    // This function is called when a giveaway needs to be deleted from the database.
    async deleteGiveaway(messageID) {
        // Gets all the current giveaways
        const data = await db.get('giveaways');
        // Remove the giveaway from the array
        const newGiveawaysArray = data.filter((giveaway) => giveaway.messageID !== messageID);
        // Save the updated array
        await db.set('giveaways', newGiveawaysArray);
        // Don't forget to return something!
        return true;
    }
}

// Create a new instance of your new class
const manager = new GiveawayManagerWithOwnDatabase(client, {
    updateCountdownEvery: 10000,
    default: {
        botsCanWin: false,
        exemptPermissions: ['MANAGE_MESSAGES', 'ADMINISTRATOR'],
        embedColor: '#FF0000',
        embedColorEnd: '#000000',
        reaction: '🎉'
    }
});
// We now have a giveawaysManager property to access the manager everywhere!
client.giveawaysManager = manager;

client.on('ready', () => {
    console.log('I\'m ready!');
});

client.login(settings.token);
