var express = require("express");
var router = express.Router();
const passport = require("passport");
const axios = require("axios");
// const msgFunction = require('../discordBot/index')

//models
var Review = require("../models/Review");
var Dao = require("../models/Dao");
var RateReview = require("../models/RateReview");
var User = require("../models/User");

const FRONTEND = process.env.FRONTEND;

const isDuplicateReview = async (user_discord_id, guild_id) => {
  let review = await Review.findOne({ user_discord_id, guild_id });
  if (review) {
    return true
  }
  else {
    return false
  }
}

const userValidationMiddleWare = async (uid, slug) => {
  let dao_res = await Promise.all([User.findById(uid), Dao.findOne({ slug: slug })]);
  let [user, dao] = dao_res;

  //member of the DAO
  let guilds = JSON.parse(user.guilds).map(ele => ele.id);
  const isMember = guilds.includes(dao.guild_id);

  //Duplicate review check
  let isDuplicate = await isDuplicateReview(user.dicordId, dao.guild_id);
  console.log({ isMember, isDuplicate, dao_name: dao.dao_name, guild_id: dao.guild_id })

  return ({
    isMember, isDuplicate, dao_name: dao.dao_name, guild_id: dao.guild_id,
    user_discord_id: user.dicordId
  })
}


const userValidation = async (req, res) => {
  let { uid, slug } = req.query;
  let val_res = await userValidationMiddleWare(uid, slug)
  res.status(200).send(
    val_res
  )
}

const addReview = async (req, res) => {
  console.log(req.isAuthenticated())
  if (req.isAuthenticated()) {
    let { uid, slug } = req.body.validation;
    let user_val = await userValidationMiddleWare(uid, slug);
    if (!user_val.isMember || user_val.isDuplicate) {
      return res.status(403).send({ validation: "failed" })
    }

    console.log(req.body.review);
    let review = new Review(req.body.review);
    let db_res = await review.save();

    // update review count
    let count = await Review.count({
      dao_name: req.body.review.dao_name,
      guild_id: req.body.review.guild_id,
    });
    let dao = await Dao.findOne({
      dao_name: req.body.review.dao_name,
      guild_id: req.body.review.guild_id,
    });

    dao.review_count = count;

    // Getting average rating:
    let rating = db_res.rating;
    dao.average_rating = parseFloat(
      (
        (dao.average_rating * (count - 1) + parseInt(rating)) /
        count
      ).toFixed(1)
    );

    let update_stats = await dao.save()

    if (db_res && update_stats) {

      axios.post(`${process.env.INTERNAL_DISCORD_BOT}/added-review`, {
        submitter_public_address: db_res.public_address,
        dao_name: db_res.dao_name,
        rating: db_res.rating,
        rid: db_res._id,
      });

      return res.status(200).send({ db_res })
    }
    return res.status(500).send()
  }
  else {
    return res.status(500).send()
  }
}

router.post('/add-review', addReview);
router.get('/user-validation', userValidation)

module.exports = router;
