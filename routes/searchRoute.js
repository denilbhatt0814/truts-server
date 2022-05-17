var express = require("express");
var router = express.Router();
var stringSimilarity = require("string-similarity");

//models
var Dao = require("../models/Dao");

// searchDao makes search in DB for dao with respect
// to dao_name and returns a list of daos after sorting
// as per simillarity
const searchDao = async (req, res) => {
  let text = req.params.text;
  if (text.length > 1) {
    // When more then 1 letter is entered
    const regex = new RegExp(text, "i");
    try {
      // Querying DB and projection only the required
      // returns only 10 DAOs right now
      let daos = await Dao.find(
        {
          $or: [
            {
              dao_name: {
                $regex: regex,
              },
            },
          ],
        },
        {
          dao_name: 1,
          dao_mission: 1,
          slug: 1,
          dao_logo: 1,
          review_count: 1,
          _id: 0,
        }
      ).limit(10);

      // Sorting Daos as per similarity [From John's Frontend implementaion]
      let List = daos.map((ele, idx) => {
        let rank = Math.max(
          stringSimilarity.compareTwoStrings(text, ele.dao_name.toLowerCase()),
          stringSimilarity.compareTwoStrings(text, ele.dao_name)
        );
        return [rank, idx];
      });

      let ranklist = List.sort((a, b) => {
        return a[0] - b[0];
      }).reverse();

      let searchlist = ranklist.map((ele) => {
        return daos[ele[1]];
      });

      return res.status(200).send(searchlist);
    } catch (err) {
      return res.status(500).send({
        msg: "internal server error",
      });
    }
  } else {
    // When only first letter is entered
    var char = text[0];
    try {
      // Querying the DB with only 1st letter
      let daos = await Dao.find(
        {
          dao_name: { $regex: "^" + char, $options: "i" },
        },
        {
          dao_name: 1,
          dao_mission: 1,
          slug: 1,
          dao_logo: 1,
          review_count: 1,
          _id: 0,
        }
      ).limit(10);

      return res.status(200).send(daos);
    } catch (err) {
      return res.status(500).send({
        msg: "internal server error",
      });
    }
  }
};

router.get("/:text", searchDao);

module.exports = router;
