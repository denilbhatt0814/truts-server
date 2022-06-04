
// const addReview = async (req, res) => {
//     let data = req.query.data;
//     data = JSON.parse(Buffer.from(data, 'base64').toString('ascii'));
//     if (req.isAuthenticated()) {
//         try {

//             let guild_list = JSON.parse(req.user.guilds).map((ele) => {
//                 return ele.id;
//             });

//             let dao_name = data.dao_name;
//             let guild_id = data.guild_id;

//             if (guild_list.includes(data.guild_id)) {
//                 let review_exist = await Review.findOne({
//                     user_discord_id: req.user.dicordId,
//                     public_address: data.public_address
//                 })
//                 //duplicate review check
//                 if (review_exist) {
//                     return res.redirect(`${FRONTEND}/redirect/duplicate_review`);
//                 }
//                 let review = new Review({ ...data, user_discord_id: req.user.dicordId });
//                 let db_res = await review.save();
//                 let count = await Review.count({ dao_name, guild_id });
//                 let dao = await Dao.findOne({ dao_name, guild_id });
//                 dao.review_count = count;
//                 console.log(dao)
//                 await dao.save();
//                 if (db_res) {
//                     res.redirect(`${FRONTEND}/redirect/success`);
//                 }
//                 else {
//                     res.redirect(`${FRONTEND}/redirect/failed`);
//                 }
//             }
//             else {
//                 res.send("Auth error");
//             }
//         }
//         catch (er) {
//             console.log(er);
//             res.redirect(`${FRONTEND}/redirect/failed`);
//         }
//     }
//     else {
//         res.send("Auth error");
//     }
// }