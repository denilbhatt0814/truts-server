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
  let { uid, slug } = req.body.validation;
  let user_val = await userValidationMiddleWare(uid, slug);

  if (!user_val.isMember || user_val.isDuplicate) {
    return res.status(403).send({ validation: "failed" })
  }

  console.log(req.body.review);
  let review = new Review(req.body.review);
  let db_res = await review.save();
  if (db_res) {
    return res.status(200).send({ r_id: db_res._id })
  }

  return res.status(500).send()
}

const authReview = async (req, res) => {
  if (req.isAuthenticated()) {

    let { r_id } = req.query;
    let review = await Review.findById(r_id);
    if (review) {
      review.user_discord_id = req.user.dicordId
      review.authorized = true;
    }

    let save_review = await review.save();
    if (save_review) {

      let count = await Review.count({
        dao_name: save_review.dao_name,
        guild_id: save_review.guild_id,
      });
      let dao = await Dao.findOne({
        dao_name: save_review.dao_name,
        guild_id: save_review.guild_id,
      });

      dao.review_count = count;

      // Getting average rating:
      let rating = save_review.rating;
      dao.average_rating = parseFloat(
        (
          (dao.average_rating * (count - 1) + parseInt(rating)) /
          count
        ).toFixed(1)
      );

      let update_stats = await dao.save()

      if (update_stats) {
        axios.post(`${process.env.INTERNAL_DISCORD_BOT}/added-review`, {
          submitter_public_address: save_review.public_address,
          dao_name: save_review.dao_name,
          rating: save_review.rating,
          rid: save_review._id,
        });
        return res.redirect(`${process.env.FRONTEND}/add-review/status?type=success`)
      }
    }
  }
  return res.redirect(`${process.env.FRONTEND}/add-review/status?type=error`)
}

const rateReview = async (req, res) => {
  let { review_id, address, rating } = req.body;

  let rate_review = await RateReview.findOne({
    review_id,
    wallet_address: address
  });

  let types = { NEW: "new", SWITCH: "switch", DELETE: "delete" }
  let type;

  if (!rate_review) {
    // new rating
    let newRating = new RateReview({
      review_id: review_id,
      wallet_address: address,
      rating: rating
    })

    let save_rating = await newRating.save();
    if (save_rating) {
      type = types.NEW
    }
  }
  else {
    if (rating == rate_review.rating) {
      // delete rating 
      rate_review.review_id = ''
      type = types.DELETE
    }
    else {
      //swtich rating
      rate_review.rating = !rate_review.rating 
      type = types.SWITCH
    }
    await rate_review.save();
  }

  let true_rating = await RateReview.count({ review_id, rating: true });
  let false_rating = await RateReview.count({ review_id, rating: false });

  console.log(type, true_rating, false_rating);

  let review = await Review.findById(review_id);

  review.thumbs_down = false_rating;
  review.thumbs_up = true_rating;

  let save_review = await review.save();

  if (save_review) {
    return res.status(200).send({ rating, type });
  }

  return res.status(500).send({ msg: "server error", er });
}

//review-v2/
router.post('/rate-review', rateReview);
router.get('/auth-review', authReview);
router.post('/add-review', addReview);
router.get('/user-validation', userValidation)

module.exports = router;


