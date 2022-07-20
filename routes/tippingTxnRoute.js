var express = require("express");
var router = express.Router();

// Models
var TippingTxn = require("../models/TippingTxn");

// controller
const addTippingTxn = async (req, res) => {
  let {
    review_id,
    dao_name,
    chain,
    tip_token_name,
    tip_token_address,
    from_address,
    to_address,
    value_inTokens,
    value_inUSD,
    tx_hash,
  } = req.body;

  let TxnData = new TippingTxn({
    review_id,
    dao_name,
    chain,
    tip_token_name,
    tip_token_address,
    from_address,
    to_address,
    value_inTokens,
    value_inUSD,
    tx_hash,
  });

  try {
    let dbres = await TxnData.save();
    // Item created succesfuly
    if (dbres) {
      res.status(201).send({ result: TxnData });
    }
  } catch (error) {
    console.log(error);
    // Unable to save to DB
    res.status(500).send({ msg: "Internal server error" });
  }
};

// --------- ROUTES --------
router.post("/tipping-txn", addTippingTxn);

module.exports = router;
