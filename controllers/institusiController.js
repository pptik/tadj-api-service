//Import model
var Mapel = require('../models/mapelModel');
var Session = require('../models/sessionModel');
var Pengguna = require('../models/userModel');

//Import library
var async = require('async');
var moment = require('moment');


exports.daftar_mahasiswa = function(req,res) {

  Pengguna.find({akademik:{peran:4}})
   .exec(function (err, results) {

     if (err) {
       return res.json({success: false, data: err})
     }else{
       return res.json({success: true, data: results})
     }

   });

}
