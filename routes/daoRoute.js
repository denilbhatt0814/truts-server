var express = require("express");
var router = express.Router();
var uploadFile = require("../s3");
var uniqid = require("uniqid");
const axios = require("axios");

//models
var Dao = require("../models/Dao");
var Review = require("../models/Review");
var User = require("../models/User");

//var uploadData = require('../newData');

const test = async (req, res) => {
  //uploadData();
  res.send("hello");
};

const testPost = (req, res) => {
  //   console.log(req.body);
  res.send("Test controller!");
};

const createNewDao = async (req, res) => {
  let {
    dao_name,
    dao_category,
    dao_mission,
    description,
    slug,
    guild_id,
    average_rating,
    dao_cover,
    dao_logo,
    discord_link,
    twitter_link,
    website_link,
    additional_link,
    verified_status,
    additional_details,
    question_list,
    question_list_rating,
    mirror_link,
  } = req.body;

  //save b64 images
  let dao_cover_b64 = dao_cover;
  let dao_logo_b64 = dao_logo;

  //Generate img_id for DaoImage db entry
  let img_id = uniqid();
  dao_name = dao_name.trim();
  slug = dao_name.toLocaleLowerCase().replace(" ", "_");
  dao_cover = `${process.env.AWS_S3_ENDPOINT}/${slug}_cover_${img_id}`;
  dao_logo = `${process.env.AWS_S3_ENDPOINT}/${slug}_logo_${img_id}`;

  let DaoData = new Dao({
    dao_name,
    dao_category,
    dao_mission,
    description,
    slug,
    guild_id,
    average_rating,
    dao_cover,
    dao_logo,
    discord_link,
    twitter_link,
    website_link,
    additional_link,
    verified_status,
    additional_details,
    question_list,
    question_list_rating,
    mirror_link,
  });

  try {
    let dbres = await DaoData.save();

    if (dbres) {
      let res_cover = await uploadFile(
        dao_cover_b64,
        `${slug}_cover_${img_id}`
      );
      let res_logo = await uploadFile(dao_logo_b64, `${slug}_logo_${img_id}`);

      //   console.log(res_cover);

      if (res_cover && res_logo) {
        res.send({ status: true });
      } else {
        res.send({ status: false, error: "failed" });
      }
    } else {
      res.send({ status: false, error: "failed" });
    }
  } catch (error) {
    console.log(error);
    res.send({ status: false, error: error });
  }
};

const createNewDaoV2 = async (req, res) => {
  let {
    dao_name,
    dao_category,
    dao_mission,
    description,
    slug,
    guild_id,
    average_rating,
    dao_cover,
    dao_logo,
    discord_link,
    twitter_link,
    website_link,
    additional_link,
    verified_status,
    additional_details,
    question_list,
    question_list_rating,
    mirror_link,
  } = req.body;

  // // Fetch for twitter details
  // try {
  //   // Only if twitter link exists
  //   if (twitter_link != "") {
  //     // getting twitter link with screen name
  //     const twitter_api_url =
  //       "https://api.twitter.com/1.1/users/show.json?screen_name=" +
  //       twitter_link.split("/").slice(-1);
  //     const twitter_resp = await axios.get(twitter_api_url, {
  //       method: "GET",
  //       headers: {
  //         Authorization: "Bearer " + process.env.TWITTER_API_KEY,
  //       },
  //     });
  //     const data = twitter_resp.data;
  //     // console.log(twitter_resp.data);

  //     // Parsing response from twitter
  //     var twtr_followers = data.followers_count;
  //     var cover_img = data.profile_banner_url + "/1500x500";
  //     var logo_img = data.profile_image_url.replace("_normal", "_400x400");
  //   }
  // } catch (err) {
  //   console.log(err);
  //   console.log("err: issue with twitter APIs");
  // }

  // // Fetch for discord details
  // try {
  //   // Only if discord link exists
  //   if (discord_link != "") {
  //     // getting twitter link with screen name
  //     const discord_api_url =
  //       "https://discord.com/api/v9/invites/" +
  //       discord_link.split("/").slice(-1);
  //     const discord_resp = await axios.get(discord_api_url, {
  //       method: "GET",
  //     });
  //     const dc_data = discord_resp.data;
  //     // console.log(discord_resp.data);

  //     // Parsing response from discord
  //     var guildId = dc_data.guild.id;
  //   }
  // } catch (err) {
  //   console.log(err);
  //   console.log("err: issue with discord APIs");
  // }

  dao_name = dao_name.trim();
  slug = dao_name.toLocaleLowerCase().replaceAll(" ", "_");
  twitter_followers = "";
  dao_cover = "";
  dao_logo = "";
  guild_id = guild_id || "919638313512611840";
  verified_status = false;

  let DaoData = new Dao({
    dao_name,
    dao_category,
    dao_mission,
    description,
    slug,
    guild_id,
    average_rating,
    dao_cover,
    dao_logo,
    discord_link,
    twitter_link,
    twitter_followers,
    website_link,
    additional_link,
    verified_status,
    additional_details,
    question_list,
    question_list_rating,
    mirror_link,
  });

  try {
    let dbres = await DaoData.save();
    // Item created succesfuly
    res.status(201).send(DaoData);
  } catch (error) {
    console.log(error);
    // Unable to save to DB
    res.status(500).send({ msg: "Internal server error" });
  }
};

const getAllDaos = async (req, res) => {
  let daos = res.paginatedResults;
  return res.status(200).send(daos);
};

const getDaoBySlug = async (req, res) => {
  let slug = req.query.slug;
  //console.log(slug);
  let daos = await Dao.findOne({ slug });
  if (daos) {
    var reviews = await Review.find({
      guild_id: daos.guild_id,
      dao_name: daos.dao_name,
    });

    reviews = await Promise.all(
      reviews.map(async (review, idx) => {
        if (!review.user_discord_id) {
          return null;
        }

        const dicordId = review.user_discord_id;
        let user = await User.findOne({ dicordId });
        img_url = user.profile_img;
        // In case img isn't available: Default Avatar
        if (img_url.slice(-4) === "null") {
          img_url = "https://www.truts.xyz/hero-bg.jpg";
        }

        img = review = { ...{ ...review }._doc, profile_img: img_url };
        return review;
      })
    );

    reviews = reviews.filter((ele) => {
      return ele;
    });

    return res
      .status(200)
      .send({ status: true, data: { ...{ ...daos }._doc, reviews } });
  } else {
    res.status(404).send({ status: false });
  }
};

const getDaoByGuildId = async (req, res) => {
  let guild_id = req.query.guild_id;
  // console.log(guild_id);
  let daos = await Dao.findOne({ guild_id });
  if (daos) {
    return res.send({ status: true, data: daos });
  } else {
    res.send({ status: false });
  }
};

const getDaoById = async (req, res) => {
  let id = req.query.id;
  // console.log(id);
  let daos = await Dao.findById(id);

  if (daos) {
    return res.status(200).send(daos);
  } else {
    res.send({ status: false });
  }
};

// getDaoByCategory is a get path that
// takes categories from URL query and searches for
// realted in DB, finally returning the matches
const getDaoByCategory = async (req, res) => {
  let daos = res.paginatedResults;
  return res.status(200).send(daos);
};

const redirectById = async (req, res) => {
  let id = req.query.id;
  let url = req.query.url;
  // console.log(id);
  let daos = await Dao.findById(id);

  //   console.log(id);

  if (daos) {
    return res.send({
      url: `${url.replace("/redirect/success", "")}/dao/${daos.slug}`,
    });
  } else {
    return res.redirect(`${url}`);
  }
};

const getLeaderboard = async (req, res) => {
  // Number of top DAOs
  let count = req.query.count ? req.query.count : "10";

  try {
    // verifying if query has a Number
    if (isNaN(count)) {
      throw "NOT_A_NUMBER";
    }
    count = Number(count); // converting to int (from query)
  } catch (err) {
    // Incase query isn't a int
    return res.status(400).json({
      msg: "error parsing request",
    });
  }

  try {
    // Fetching top daos by sorting from DB based on ReviewCount
    let daos = await Dao.find(
      {},
      {
        dao_name: 1,
        slug: 1,
        review_count: 1,
        average_rating: 1,
        website_link: 1,
        twitter_link: 1,
        discord_link: 1,
        _id: 0,
      }
    )
      .limit(count)
      .sort({ review_count: -1 });

    res.status(200).send(daos);
  } catch (err) {
    res.status(500);
  }
};

// ----------- MIDDLEWARES ----------

// paginatedResults is a middleware that will
// get data in pieces/show it using pagination
// Need to pass the Data model that is to be paginated
const paginatedResults = (models) => {
  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }
  return async (req, res, next) => {
    const page = parseInt(req.query.page);
    const limit = parseInt(req.query.limit);
    const category = req.query.category;
    let query = {};

    //if category is requested      //accounting for various cases
    query = category
      ? {
        verified_status: true,
        $or: [
          { dao_category: category },
          { dao_category: category.toLocaleLowerCase },
          { dao_category: capitalizeFirstLetter(category) },
        ],
      }
      : { verified_status: true };

    // Index of data to fetch/send
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    const results = {};

    // If not first page will send the
    // pointer to last page
    if (startIndex > 0) {
      results.previous = {
        page: page - 1,
        limit: limit,
      };
    }

    // Incase more data available to share
    // will point to next page
    if (endIndex < (await models.countDocuments(query))) {
      results.next = {
        page: page + 1,
        limit: limit,
      };
    }

    try {
      // Querying DB to get data in Paginated form
      results.results = await models
        .find(query, { question_list: 0, question_list_rating: 0 })
        .sort({ review_count: -1 })
        .limit(limit)
        .skip(startIndex);

      // adding data to res object
      res.paginatedResults = results;

      // Exiting middleware
      next();
    } catch (err) {
      res.status(500).json({ msg: "Internal server error" });
    }
  };
};

// ----------- ROUTES --------------
router.get("/redirect", redirectById);

// get similar daos
router.get("/similar", paginatedResults(Dao), getDaoByCategory);

// create new daos
router.post("/create-new-dao", createNewDao);
router.post("/create-new-dao-v2", createNewDaoV2);

//get list of daos
router.get("/get-dao-list", paginatedResults(Dao), getAllDaos);

//get dao by slug
router.get("/get-dao-by-slug", getDaoBySlug);

//get dao by slug
router.get("/get-dao-by-guild", getDaoByGuildId);

//get dao by id
router.get("/get-dao-by-id", getDaoById);

// leaderboard
router.get("/leaderboard", getLeaderboard);

//tests

router.get("/test", test);
router.post("/test", testPost);

module.exports = router;
