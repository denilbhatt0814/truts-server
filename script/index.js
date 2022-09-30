var express = require("express");
var Dao = require(`../models/Dao`);
var token_data = require('./daos.json');
var tokenObj = require('./TokenObj.json');
var nearDaos = require('./notFound.json');
var fs = require('fs');

// module.exports = async () => {
//     let daos = await Dao.find();
//     console.log(daos.length, token_data.length);

//     // let chain_array = [];

//     // token_data.forEach(element => {
//     //     chain_array = [...chain_array, ...element.platforms];
//     // })

//     // let uniqueChains = new Set(chain_array);
//     // console.log(uniqueChains);
//     // // let uniqueChainArray = new Set()

//     let notFoundArray = [];

//     daos.forEach((ele, idx) => {
//         try{
//             console.log(tokenObj[ele.dao_name]);
//             daos[idx].chain = tokenObj[ele.dao_name].platforms
//             daos[idx].save();
//         }
//         catch(er){

//         }

//     })
//     console.log(notFoundArray.length)
//     // fs.writeFile('notFound.json', JSON.stringify(notFoundArray), function (err) {
//     //     if (err) throw err;
//     //     console.log('Saved!');
//     // });

// };

module.exports = async () => {
    let daos = await Dao.find();
    let notFoundArray = [];
    let chaininfo = {};

    daos.forEach((ds) => {
        ds.chain.forEach((ele) => {
            chaininfo[ele] = 0;
        })
    })


    daos.forEach((ds) => {
        ds.chain.forEach((ele) => {
            chaininfo[ele] = chaininfo[ele] + 1;
        })
    })

    console.log(chaininfo)
}
