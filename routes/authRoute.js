var express = require('express');
var router = express.Router();
const passport = require('passport');

let FRONTEND = process.env.FRONTEND

router.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.send(200);
})

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    let list = JSON.parse(req.user.guilds).map((ele) => {
        return ele.id;
    })
    res.redirect(`${FRONTEND}/add-review?guilds=${list}`)
})

router.get('/discord/test', (req, res) => {
    if (req.isAuthenticated()) {

    }
})

//update

module.exports = router;