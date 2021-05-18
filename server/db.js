// __  __                           ____                            _____ _                
// |  \/  | ___  _ __   __ _  ___   | __ )  ___  _ __   __ _  ___   |_   _(_)_ __ ___   ___ 
// | |\/| |/ _ \| '_ \ / _` |/ _ \  |  _ \ / _ \| '_ \ / _` |/ _ \    | | | | '_ ` _ \ / _ \
// | |  | | (_) | | | | (_| | (_) | | |_) | (_) | | | | (_| | (_) |   | | | | | | | | |  __/
// |_|  |_|\___/|_| |_|\__, |\___/  |____/ \___/|_| |_|\__, |\___/    |_| |_|_| |_| |_|\___|
//                     |___/                           |___/                                

const mongoose = require('mongoose');

let serverConnection = null; // Only exists in module and is static.

async function connectToDatabase() {

    return newConnection;
}


// You do this so you don't need to manage reconnecting outside the module.
// Modules can hold states, so you can have some logic within them.
// This function is defined as a lambda so it has access to the modules scope (it's bound to the module and can write to module variables).
const connect = async () => {
    if (serverConnection === null) {
        serverConnection = await connectToDatabase();
    }
    return serverConnection;
};

module.exports = connect;