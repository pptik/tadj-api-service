//Import model
var Mapel = require('../models/mapelModel');
var Session = require('../models/sessionModel');
var Pengguna = require('../models/userModel');
var PenggunaUniversitas = require('../models/userModelUniversitas');
var Jenjang = require('../models/jenjangModel');
var Prodi = require('../models/prodiModel');

//Import library
var async = require('async');
var moment = require('moment');
var restClient = require('node-rest-client').Client;
var rClient = new restClient();
var base_api_url = 'http://localhost:3001';


exports.daftar = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('id_universitas', 'Id universitas tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('id_universitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('id_universitas').escape();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{

    args = {
      	data: {
          access_token: req.body.access_token},
      	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    rClient.post(base_api_url+'/cek_session', args, function (data, response) {
        //Kelas.find({ _id:idKelas , pengajar: {$elemMatch:{mapel:idMapel,guru:idGuru}} }).exec(function (err, results) {

        if(data.success == true){//session berlaku

            PenggunaUniversitas.find({
              '_id': req.body.id_universitas,
              'akademik.peran' : 2
            })
            .populate('akademik.jenjang')
           .select(
                    {
                      'akademik.jenjang':1
                    }
                  )
           .exec(function (err, results) {

             if (err) {
               return res.json({success: false, data: err})
             }else{

               return res.json({success: true, data: results})

             }

           });

        }else{//session tidak berlaku
          return res.json({success: false, data: {message:'Token tidak berlaku'}})
        }

    })

  }
}

exports.prodi = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();

  req.sanitize('access_token').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{

    args = {
      	data: {
          access_token: req.body.access_token},
      	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    rClient.post(base_api_url+'/cek_session', args, function (data, response) {

        var idJenjang = req.body.id_jenjang
        if(data.success == true){//session berlaku

            Jenjang.find({'_id':idJenjang})
            .populate({
              path: 'prodi',model:Prodi
            })
            .select({'prodi':1})
           .exec(function (err, results) {

             if (err) {
               return res.json({success: false, data: err})
             }else{

               return res.json({success: true, data: results})

             }

           });

        }else{//session tidak berlaku
          return res.json({success: false, data: {message:'Token tidak berlaku'}})
        }

    })

  }
}
