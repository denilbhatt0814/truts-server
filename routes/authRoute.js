var express = require('express');
var router = express.Router();
const passport = require('passport');
let User = require('./../models/User');

let FRONTEND = process.env.FRONTEND

router.get('/discord', passport.authenticate('discord'), (req, res) => {
    res.send(200);
})

router.get('/discord/redirect', passport.authenticate('discord'), (req, res) => {
    res.redirect(`${FRONTEND}/add-review?uid=${req.user._id}`)
})

router.get('/user', async (req, res) => {
    let uid = req.query.uid;
    console.log(uid);
    let user = await User.findById(uid);
    res.status(200).send(user);
})

router.get('/discord/test', (req, res) => {
    if (req.isAuthenticated()) {
        console.log(req.user)
    }
    res.status(200);
})


module.exports = router;