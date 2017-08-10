//Import model
var Mapel = require('../models/mapelModel');
var Session = require('../models/sessionModel');
var Pengguna = require('../models/userModel');

//Import library
var async = require('async');
var moment = require('moment');
var restClient = require('node-rest-client').Client;
var rClient = new restClient();
var base_api_url = 'http://localhost:3001';


exports.daftar_universitas = function(req,res) {

  //Inisial validasi
  req.checkBody('accessToken', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('idPengguna', 'Id pengguna tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('accessToken').escape();
  req.sanitize('idPengguna').escape();

  req.sanitize('accessToken').trim();
  req.sanitize('idPengguna').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{

    args = {
      	data: {
          access_token: req.body.accessToken},
      	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    rClient.post(base_api_url+'/cek_session', args, function (data, response) {
        //Kelas.find({ _id:idKelas , pengajar: {$elemMatch:{mapel:idMapel,guru:idGuru}} }).exec(function (err, results) {

        if(data.success == true){//session berlaku
          var idPengguna = req.body.idPengguna


            Pengguna.find({
              $and:
                [
                  {'akademik.peran':4},
                  {'_id':idPengguna}

                ]
            })
           .exec(function (err, results) {

             if (err) {
               return res.json({success: false, data: err})
             }else{
               
               return res.json({success: true, data: results})
             }

           });

        }else{//session tidak berlaku
          return res.json({success: false, data: {message:data.data.message}})
        }

    })

  }
}
