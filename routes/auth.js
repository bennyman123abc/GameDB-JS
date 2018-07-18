var express = require('express');
var router = express.Router();
var dataDriver = require('../drivers/datadriver');
var crypto = require('crypto');
var createError = require('http-errors');

router.get('/', function(_, res, _) {
    res.redirect("/auth/login");
})

router.get('/login', function(req, res, next) {
    if (!req.session.user) {
        res.render('auth/login', {error: req.query["error"]});
    }
    else {
        res.redirect('/');
    }
});

router.post('/login', async function(req, res, next) {
    var user = await dataDriver.getUserByUsernameOrEmail(req.body.username);

    if (user == null) {
        res.redirect(`/auth/login?error=User, ${req.body.username}, was not found.`);
        res.end();
        return;
    }

    if (await verifyLoginPassword(user, req.body.password)) {
        req.session.user = user;
        res.redirect("/?message=login");
        res.end();
        return;
    }

    else {
        res.redirect('/auth/login?error=Invalid credentials.');
        res.end();
        return;
    }
});

router.get('/register', function(req, res, next){
    if (req.session.user) {
        res.redirect("/")
    }
    else {
        res.render('auth/register', { "error": req.query["error"] });
    }
});

router.post('/register', async function(req, res, next) {
    if (req.body.password != req.body.confirm_password) {
        res.redirect("/auth/register?error=Passwords do not match!");
        next();
    }

    var user = await dataDriver.createUser(req.body.username, req.body.email, generatePasswordHash(req.body.password));

    if (user == false) {
        res.redirect("/auth/register?error=User with that username or email already exists.");
        next();
    }

    req.session.user = user;
    res.redirect('/');
})

router.get("/logout", async function(req, res, next) {
    req.session.destroy();
    res.redirect('/?message=logout');
});

router.get("/user/me", async function(req, res, next) {
    if (req.session.user) {
        res.redirect(`/auth/user/${req.session.user["id"]}`)
    }
    else {
        res.redirect("/auth/login/?error=You must be logged in to do that.")
    }
});

router.get("/user/:id", async function(req, res, next) {
    var viewUser = await dataDriver.getUserByID(req.params["id"]);

    if (viewUser == null) {
        next(createError(404));
    }

    res.render("auth/user", { user: req.session.user, viewUser: viewUser, consoles: [] });
});

router.get("/debug/users", async function(req, res, next){
    res.send(await dataDriver.getUsers());
});

router.get("/debug/user", async function(req, res, next) {
    res.send(await dataDriver.getUserByUsernameOrEmail("bennyman123abc"))
});

function generateSalt() {
    return crypto.createHash("sha512").update(crypto.randomBytes(128).toString()).digest('hex');
}

function generatePasswordHash(password) {
    var salt = generateSalt();
    var pepper = generateSalt();
    var passHash = crypto.createHash("sha512").update(pepper + password + salt).digest('hex');

    return {'salt': salt, 'pepper': pepper, 'password': passHash};
}

function getPasswordHash(password, salt, pepper) {
    return crypto.createHash("sha512").update(pepper + password + salt).digest("hex");
}

async function verifyLoginPassword(user, ipassword) {
    var salt = user['salt'];
    var pepper = user['pepper'];
    var password = user['password'];

    if (password == getPasswordHash(ipassword, salt, pepper)) {
        return true;
    }
    return false;
}

module.exports = router;