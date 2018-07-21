// Forked from Matthew Orland's DB driver
// used in the Starie Tech Bot Framework
//
// Modified to fit the needs of this project.

const sqlite = require("sqlite");

class DatabaseDriver {
    constructor(filename) {
        this.dbPromise = sqlite.open(filename);
    }

    async create(table, fields) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }
        await db.run(`CREATE TABLE IF NOT EXISTS \`${table}\`(${fields.join(", ")})`);
    }

    async insert(table, fields, values) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }

        await db.run(`INSERT INTO \`${table}\`(\`${fields.join("`, `")}\`) VALUES('${values.join("', '")}')`);
    }

    async delete(table, id) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }
        await db.run(`DELETE FROM \`${table}\` WHERE \`id\`="${id}"`);
    }

    async get(table, key, value) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }

        var query = await db.all(`SELECT * FROM \`${table}\` WHERE \`${key}\` = "${value}"`);

        return query[0];
    }

    async getTableSorted(table, key, desc) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }
        if (!desc) {
            return await db.all(`SELECT * FROM \`${table}\` ORDER BY \`${key}\``);
        }
        else {
            return await db.all(`SELECT * FROM \`${table}\` ORDER BY \`${key}\` DESC`);
        }
    }

    async updateTable(table, key, value, userKey, userValue) {
        var db = await this.dbPromise;
        if (!db) {
            console.error("Cannot access a non-existent database.");
        }

        await db.run(`UPDATE \`${table}\` SET \`${key}\`="${value}" WHERE \`${userKey}\` = "${userValue}"`);
    }

    async run(sql) {
        var db = await this.dbPromise;

        if (!db) {
            console.error("Cannot access a non-existent database.");
        }

        await db.run(sql);
    }

    async all(sql) {
        var db = await this.dbPromise;

        if (!db) {
            console.error("Cannot access a non-existent database.");
        }

        return await db.all(sql);
    }
}


module.exports = DatabaseDriver;