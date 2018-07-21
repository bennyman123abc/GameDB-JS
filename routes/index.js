var express = require('express');
var router = express.Router();
var dataDriver = require("../drivers/datadriver");

router.get('/', async function(req, res, next) {
    // var consoles = await dataDriver.getConsoles(5);
    res.render('index', { message: req.query["message"], user: req.session.user, consoles: await dataDriver.getConsolesSorted("time_added", true, 5) });
});

router.get('/consoles', async function(req, res, next) {
    // console.log(await dataDriver.getConsoles());
    res.render('db/consoles', { user: req.session.user, consoles: await dataDriver.getConsoles() });
});

// /games

router.get('/admin', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    res.render("admin/panel", { user: req.session.user, userCount: Object.keys(await dataDriver.getUsers()).length, consoleCount: Object.keys(await dataDriver.getConsoles()).length });
});

router.get('/admin/users', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    res.render("admin/users", { user: req.session.user, users: await dataDriver.getUsers() });
});

router.get('/admin/users/edit/:id', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }


});

router.get('/admin/consoles/edit/:id', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    var console = await dataDriver.getConsoleByID(req.params["id"]);

    if (!console) {
        createError(req, res, { status: 404, stack: `Console by the ID of '${req.params["id"]}' does not exist.` });
        return;
    }

    res.render('admin/editConsole', { user: req.session.user, console: console });
});

router.post('/admin/consoles/edit/:id', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    var c = await dataDriver.getConsoleByID(req.params["id"]);
    var fields = ["name", "rel_year", "developer"];

    fields.forEach(async function(field) {

        if (req.body[field] == null || "" || undefined) {
            res.redirect(`/admin/consoles/edit/${c["id"]}`)
        }

        if (c[field] != req.body[field]) {
            await dataDriver.updateConsole(c["id"], field, req.body[field]);
        }
    });

    res.redirect("/consoles");

});

router.get('/admin/consoles/delete/:id', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    var console = await dataDriver.getConsoleByID(req.params["id"]);

    if (!console) {
        createError(req, res, { status: 404, stack: `Console by the ID of '${req.params["id"]}' does not exist.` });
        return;
    }

    await dataDriver.deleteConsole(console["id"]);
    res.redirect("/consoles");

});

router.get('/admin/consoles/add', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    res.render('admin/addConsole', { user: req.session.user, error: req.query["error"] });

});

router.post('/admin/consoles/add', async function(req, res, next) {
    if (!verifyAdmin(req, res)) {
        return;
    }

    var console = await dataDriver.addConsole(req.body.name, parseInt(req.body.year), req.body.developer, req.session.user);

    if (console == false) {
        res.redirect("/admin/consoles/add/?error=A console with that name already exists.");
        res.end();
        return
    }

    if (console == null) {
        createError(req, res, { status: 500, stack: "Console came up as null.\nThis is probably an SQLite error. Check console for further details." });
        return;
    }

    res.redirect("/admin/consoles/add/?message=Console added successfully!");
});

function verifyAdmin(req, res) {
    if (!req.session.user) {
        res.redirect("/auth/login/?error=You must be logged in to do that.");
        res.end();
        return false;
    }

    else if (req.session.user["role"] != "admin") {
        createError(req, res, { status: 401, stack: "You do not have permission to access this page.\nIf you believe this is a mistake, please contact an administrator." })
        return false;
    }

    return true;
}

function createError(req, res, error) {
    var errorMessages = {
        404: "Resource Not Found",
        401: "User Unauthorized",
        500: "Internal Server Error"
    }

    res.status(error.status);
    res.render("error", { user: req.session.user, error: error, emessage: errorMessages[error.status] });
    res.end();
}

module.exports = router;
