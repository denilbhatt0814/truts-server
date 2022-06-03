const passport = require('passport');
const { Strategy } = require('passport-discord');
const User = require('../models/User');

passport.serializeUser((user, cb) => {
    return cb(null, user.id);
})

passport.deserializeUser(async (id, cb) => {
    try {
        const user = await User.findById(id);
        return user ? cb(null, user) : cb(null, null);
    } catch (er) {
        console.log(er);
        return cb(err, null);
    }
})


passport.use(
    new Strategy(
        {
            clientID: process.env.DISCORD_APPLICATION_ID,
            clientSecret: process.env.DISCORD_SECRET,
            callbackURL: `${process.env.BACKEND}/auth/discord/redirect`,
            scope: ['identify', 'guilds', 'guilds.members.read']
        },
        async (accessToken, refreshToken, profile, cb) => {
            try {
                console.log(profile);
                const existingUser = await User.findOneAndUpdate(
                    { dicordId: profile.id },
                    { accessToken, refreshToken, guilds: JSON.stringify(profile.guilds), profile_img: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}` },
                    { new: true }
                )
                // console.log(profile);
                if (existingUser) { return cb(null, existingUser); }

                const newUser = new User({
                    dicordId: profile.id, accessToken, refreshToken, guilds: JSON.stringify(profile.guilds),
                    profile_img: `https://cdn.discordapp.com/avatars/${profile.id}/${profile.avatar}`
                });
                let savedUser = await newUser.save();
                return cb(null, savedUser);
            }
            catch (er) {
                console.log(er);
                return cb(null, undefined);
            }
        }
    )
)
