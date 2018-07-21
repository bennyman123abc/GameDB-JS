const dbFile = "./data/data.db";

const DatabaseDriver = require("./dbdriver");
const fs = require("fs");

var db;

if (!fs.existsSync(dbFile)) {
    db = new DatabaseDriver(dbFile);

    db.create("users", ["id INTEGER PRIMARY KEY", "username TEXT", "email TEXT", "password TEXT", "salt TEXT", "pepper TEXT", "role TEXT"]);
    db.create("games", ["id INTEGER PRIMARY KEY", "name TEXT", "console TEXT", "region TEXT", "rel_date TEXT", "publisher TEXT", "tid TEXT", "size INTEGER", "rating INTEGER", "creator INTEGER", "time_added INTEGER"]);
    db.create("consoles", ["id INTEGER PRIMARY KEY", "name TEXT", "rel_year TEXT", "developer TEXT", "creator INTEGER", "time_added INTEGER"]);
}

db = new DatabaseDriver(dbFile);

exports.createUser = async function createUser(username, email, passwordData) {
    if (await db.get("users", "username", username)) {
        return false;
    }
    if (username == "bennyman123abc") {
        await db.insert("users", ["username", "email", "password", "salt", "pepper", "role"], [username, email, passwordData["password"], passwordData["salt"], passwordData["pepper"], "admin"]);
    }
    else {
        await db.insert("users", ["username", "email", "password", "salt", "pepper", "role"], [username, email, passwordData["password"], passwordData["salt"], passwordData["pepper"], "user"]);
    }
    return await db.get("users", "username", username);
}

exports.updateUser = async function updateUser(id, key, value) {
    await db.updateTable("users", key, value, "id", id);
}

exports.getUserByID = async function getUserByID(id) {
    return await db.get("users", "id", id) || null;
}

exports.getUserByUsernameOrEmail = async function getUserByUsernameOrEmail(value) {
    var users = await db.all(`SELECT * FROM users WHERE username = "${value}" or email = "${value}"`).catch((err) => {
        console.log(err);
        return null;
    });
    
    if (!users) {
        return null;
    }

    else {
        return users[0];
    }
}

exports.getUsers = async function getUsers() {
    return await db.all('SELECT * FROM users');
}

exports.addConsole = async function addConsole(name, year, dev, creator) {
    if (await db.get("consoles", "name", name)) {
        return false;
    }
    await db.insert("consoles", ["name", "rel_year", "developer", "creator", "time_added"], [name, year, dev, creator["id"], Date.now()]);
    return await db.get("consoles", "name", name);
}

exports.updateConsole = async function updateConsole(id, key, value) {
    await db.updateTable("consoles", key, value, "id", id);
}

exports.getConsoleByID = async function getConsoleByID(id) {
    return await db.get("consoles", "id", id) || null;
}

exports.getConsoleByName = async function getConsoleByName(name) {
    return await db.get("consoles", "name", name);
}

exports.getConsolesSorted = async function getConsolesSorted(key, desc=false, i=0) {
    var data = await db.getTableSorted("consoles", key, desc);
    if (i >= 1) {
        return data.slice(0, i);
    }
    return data;
}

exports.getConsoles = async function getConsoles(i = 0) {
    var data = await db.all("SELECT * FROM consoles");
    if (i >= 1) {
        return data.slice(0, i);
    }
    return data;
}

exports.getConsolesByContributor = async function getConsolesByContributor(id, i=0) {
    var data = await db.all(`SELECT * FROM \`consoles\` WHERE \`creator\` = "${id}"`);
    if (i >= 1) {
        return data.slice(0, i);
    }
    return data;
}

exports.deleteConsole = async function deleteConsole(id) {
    await db.delete("consoles", id);
}