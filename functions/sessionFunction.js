//Import Model
const sessionModel = require('../models/sessionModel');

//Import etc
const global = require('../global.json');

exports.cek_status = function (request, callback) {
    sessionModel.find({'access_token':request.access_token,'end_at':null})
        .exec(function (err, results) {
            if(results.length == 0){//Sudah expired akses tokennya
                callback(false)
            }else if(results.length == 1){
                callback(true)
            }
        });
}



