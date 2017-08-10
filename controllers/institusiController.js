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


exports.daftar_mahasiswa = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('idUniversitas', 'Id universitas tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('idUniversitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('idUniversitas').trim();

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
          var idUniversitas = req.body.idUniversitas
          console.log('id univ:'+idUniversitas)

            Pengguna.find({
              $and:
                [
                  {'akademik.peran':4},
                  {'akademik.universitas_prodi.universitas':idUniversitas}

                ]
            })
           .select(
                    {
                      'email':1,
                      'profil.nama_lengkap':1,
                      'akademik.universitas_prodi.nim_nip':1,
                      'akademik.universitas_prodi.universitas':1

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

exports.pending_daftar_mahasiswa = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('idUniversitas', 'Id universitas tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('idUniversitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('idUniversitas').trim();

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
          var idUniversitas = req.body.idUniversitas
          console.log('id univ:'+idUniversitas)

            Pengguna.find()
           .elemMatch('akademik.universitas_prodi',{'universitas':idUniversitas,'status_konfirmasi':0})
           .select({})
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
