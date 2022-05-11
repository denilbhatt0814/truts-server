var Dao = require("../models/Dao");
var Review = require("../models/Review");

var image_map = require('./dao-coverImg-data.json');
var twitter_map = require('./twitter_followers.json');
var dao_data = require('./data.json');
var discord_data = require('./discord_data.json');


let sample = {
    "dao_category": "",
    "question_list": { "q1": "Do you resonate with the vibes in the DAO community?", "q2": "Do you believe your opinions matter in the DAO community?", "q3": "Would you recommed this DAO/community to your friend?", "q4": "How would you rate the DAO’s onboarding experience?", "q5": "Do you think that DAO has great organizational structure?", "q6": "Do you think there are great incentives for DAO members?" }, "question_list_rating": { "q1": 50, "q2": 50, "q3": 50, "q4": 50, "q5": 50, "q6": 50 }, "dao_name": "APE DAO", "dao_mission": "The APE DAO began by fractionalizing (token partitioning) 50 valued NFTs into APED erc-20 tokens, which provide holders with governance over their NFTs. General governance is now token-based, with a shift toward community rule on the horizon.",
    "description": "",
    "slug": "ape_dao",
    "guild_id": "919638313512611840",
    "average_rating": 4,
    "dao_cover": "https://daoverse-bucket.s3.ap-south-1.amazonaws.com/ape_dao_cover_2d77a4sl2ryl4qx",
    "dao_logo": "https://daoverse-bucket.s3.ap-south-1.amazonaws.com/ape_dao_logo_2d77a4sl2ryl4qx", "discord_link": "https://discord.gg/Nkp68AS8PU", "twitter_link": "https://twitter.com/Twitter", "website_link": "http://example.com/",
    "additional_link": "",
    "verified_status": false,
    "additional_details": "",
    "mirror_link": "",
    "review_count": 0
}

let stringMan = (a) => {
    var b = a.split('/');
    // ["asdasd", "dasd", "rttewrtert"]
    b.pop();
    // ["dasd", "rttewrtert"]
    var d = [...b, '1500x500'].join('/');

    return d;
}

//console.log(stringMan("https://pbs.twimg.com/profile_banners/1335365473932898307/1607709053/600x200"));

let uploadData = async () => {


    for (let i = 0; i < dao_data.length; i++) {

        try {
            console.log(stringMan(image_map[`${dao_data[i].dao_name}`].img_url));
            let cover = stringMan(image_map[`${dao_data[i].dao_name}`].img_url);
            let logo = image_map[`${dao_data[i].dao_name}`].img_url;
            let t_link = twitter_map[i].twitter_link
            let followers = twitter_map[i].twitter_followers
            let newDao = new Dao({
                "dao_name": dao_data[i].dao_name,
                "dao_category": dao_data[i].dao_category,
                "description": dao_data[i].description,
                "dao_mission": dao_data[i].dao_mission,
                "slug": dao_data[i].dao_name.trim().toLocaleLowerCase().replace(" ", "_"),
                "guild_id": "919638313512611840",
                "average_rating": 4,
                "dao_cover": cover,
                "dao_logo": logo,
                "discord_link": "https://discord.gg",
                "twitter_link": t_link,
                "website_link": dao_data[i].website_link,
                "additional_link": "",
                "verified_status": false,
                "additional_details": "",
                "mirror_link": "",
                "review_count": 0,
                "twitter_followers": followers
            })
            await newDao.save();
            console.log("c", i);
        }
        catch (er) {
            console.log(dao_data[i].dao_name)
            console.log(er);
        }

    }
}

const updateDiscordData = async () => {

    for (let i = 0; i < discord_data.length; i++) {

        try {
            let dao = await Dao.findOne({ dao_name: discord_data[i].dao_name.trim() });

            if (dao) {
                if (discord_data[i]?.discord_members > 0) {
                    dao.discord_members = parseInt(discord_data[i]?.discord_members);
                }
                if (discord_data[i]?.discord_link.length > 0) {
                    dao.discord_link = discord_data[i]?.discord_link;
                }
                if (discord_data[i]?.discord_invite.length > 0) {
                    dao.discord_link = discord_data[i]?.discord_invite;
                }

                await dao.save()
                console.log("c-> ", discord_data[i].dao_name.trim());
            }
        }
        catch (er) {
            console.log(er)
        }
    }
}

module.exports = updateDiscordData;