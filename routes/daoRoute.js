var express = require('express');
var router = express.Router();
var uploadFile = require('../s3')

//models
var Dao = require('../models/Dao');
var Review = require('../models/Review');

const test = (req, res) => {
    console.log(req);
    res.send('Test controller!');
}

const testPost = (req, res) => {
    console.log(req.body);
    res.send('Test controller!');
}

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
        mirror_link
    } = req.body;

    //save b64 images
    let dao_cover_b64 = dao_cover;
    let dao_logo_b64 = dao_logo;

    //Generate img_id for DaoImage db entry
    let img_id = Math.floor(100000 + Math.random() * 900000);
    dao_cover = `${process.env.AWS_S3_ENDPOINT}/cover_${img_id}`;
    dao_logo = `${process.env.AWS_S3_ENDPOINT}/logo_${img_id}`;
    slug = dao_name.toLocaleLowerCase().replace(' ', '_');
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
        mirror_link
    })

    try {
        let dbres = await DaoData.save();

        if (dbres) {

            let res_cover = uploadFile(dao_cover_b64, `cover_${img_id}`);
            let res_logo = uploadFile(dao_logo_b64, `logo_${img_id}`);

            if (res_cover && res_logo) {
                res.send({ status: true })
            }
            else {
                res.send({ status: false, error: "failed" })
            }

        } else {
            res.send({ status: false, error: "failed" })
        }

    } catch (error) {
        console.log(error)
        res.send({ status: false, error: error })
    }

}

const getAllDaos = async (req, res) => {
    let daos = await Dao.find();
    return res.send(daos);
}

const getDaoBySlug = async (req, res) => {
    let slug = req.query.slug;
    //console.log(slug);
    let daos = await Dao.findOne({ slug });
    if (daos) {
        let reviews = await Review.find({
            guild_id: daos.guild_id,
            dao_name: daos.dao_name
        });
       // console.log(reviews);
        return res.send({ status: true, data: { ...{ ...daos }._doc, reviews } });
    }
    else {
        res.send({ status: false });
    }
}

const getDaoByGuildId = async (req, res) => {
    let guild_id = req.query.guild_id;
   // console.log(guild_id);
    let daos = await Dao.findOne({ guild_id });
    if (daos) {
        return res.send({ status: true, data: daos });
    }
    else {
        res.send({ status: false });
    }
}

const getDaoById = async (req, res) => {
    let id = req.query.id;
   // console.log(id);
    let daos = await Dao.findById(id);

    if (daos) {
        return res.send({ status: true, data: daos });
    }
    else {
        res.send({ status: false });
    }
}

router.get('/test', test);
router.post('/test', testPost);


//Routes

//create new daos
router.post('/create-new-dao', createNewDao);

//get list of daos
router.get('/get-dao-list', getAllDaos);

//get dao by slug
router.get('/get-dao-by-slug', getDaoBySlug);

//get dao by slug
router.get('/get-dao-by-guild', getDaoByGuildId);

//get dao by id
router.get('/get-dao-by-id', getDaoById);

module.exports = router;