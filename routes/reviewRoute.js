var express = require('express');
var router = express.Router();
const passport = require('passport');


//models
var Review = require('../models/Review');
var Dao = require('../models/Dao')

const FRONTEND = process.env.FRONTEND



const addReview = async (req, res) => {
    let data = req.query.data;
    data = JSON.parse(data);
    if (req.isAuthenticated()) {
        try {

            let guild_list = JSON.parse(req.user.guilds).map((ele) => {
                return ele.id;
            });

            if (guild_list.includes(data.guild_id)) {
                let review = new Review({ ...data, user_discord_id: req.user.dicordId });
                let db_res = await review.save();
                if (db_res) {
                    res.redirect(`${FRONTEND}/redirect/success`);
                }
                else {
                    res.redirect(`${FRONTEND}/redirect/failed`);
                }
            }
            else {
                res.send("Auth error");
            }
        }
        catch (er) {
            console.log(er);
            res.redirect(`${FRONTEND}/redirect/failed`);
        }
    }
    else {
        res.send("Auth error");
    }
}

// let reviewSample = {
//     "rating": `${((Math.floor(Math.random() * 3)) + 6)}`,
//     "review_desc": "",
//     "resonate_vibes_rate": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "onboarding_exp": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "opinions_matter": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "great_org_structure": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "friend_recommend": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "great_incentives": `${((Math.floor(Math.random() * 50)) + 101)}`,
//     "user_discord_id": `${((Math.floor(Math.random() * 10000)) + 90000)}`,
//     "dao_name": "",
//     "guild_id": "",
//     "public_address": `${((Math.floor(Math.random() * 100000000000)) + 900000000000)}`
// }

// const addSampleReviews = async (req, res) => {
//     let dao_list = await Dao.find();

//     for (let i = 0; i < dao_list.length; i++) {
//         let {
//             rating,
//             review_desc,
//             resonate_vibes_rate,
//             onboarding_exp,
//             opinions_matter,
//             great_org_structure,
//             friend_recommend,
//             great_incentives,
//             user_discord_id,
//             dao_name,
//             guild_id,
//             public_address
//         } = reviewSample;

//         let min = 70
//         let max = 100

//         rating = `${Math.floor(Math.random() * (5 - 3 + 1)) + 3}`;
//         review_desc = para[Math.floor(Math.random() * (15 - 0 + 1)) + 0];
//         resonate_vibes_rate = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         onboarding_exp = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         opinions_matter = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         great_org_structure = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         friend_recommend = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         great_incentives = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         user_discord_id = `${Math.floor(Math.random() * (max - min + 1)) + min}`;
//         dao_name = dao_list[i].dao_name;
//         guild_id = dao_list[i].guild_id;
//         public_address = `${((Math.floor(Math.random() * 100000000000)) + 900000000000)} `

//         let newReview = new Review({
//             rating,
//             review_desc,
//             resonate_vibes_rate,
//             onboarding_exp,
//             opinions_matter,
//             great_org_structure,
//             friend_recommend,
//             great_incentives,
//             user_discord_id,
//             dao_name,
//             guild_id,
//             public_address
//         })

//         await newReview.save();

//     }

// }

router.get('/add-review', addReview);
// router.get('/add-sample', addSampleReviews);

module.exports = router;