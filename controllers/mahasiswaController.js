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

exports.tambah_institusi_pendidikan = function(req,res){

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('pengguna', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('institusi', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('jenjang', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('prodi', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('nim', 'Id pengguna tidak boleh kosong').notEmpty();
  req.checkBody('foto_ktm', 'Id pengguna tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('pengguna').escape();
  req.sanitize('institusi').escape();
  req.sanitize('jenjang').escape();
  req.sanitize('prodi').escape();
  req.sanitize('nim').escape();
  req.sanitize('foto_ktm').escape();

  req.sanitize('access_token').trim();
  req.sanitize('pengguna').escape();
  req.sanitize('institusi').trim();
  req.sanitize('jenjang').trim();
  req.sanitize('prodi').trim();
  req.sanitize('nim').trim();
  req.sanitize('foto_ktm').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{

    //Cek session
    args = {
      	data: {
          access_token: req.body.access_token},
      	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

    rClient.post(base_api_url+'/cek_session', args, function (data, response) {


        if(data.success == true){//session berlaku

          //Proses:
          //1. Dicek dahulu apakah institusi, prodi, jenjang sudah ada dalam array
          //2. Apabila sudah maka gagal menambahkan
          //3. Apabila belum berhasil menambahkan
          Pengguna.find({ _id:req.body.pengguna , 'akademik.universitas_prodi': {$elemMatch:{universitas:req.body.institusi,prodi:req.body.prodi,jenjang:req.body.jenjang}} }).exec(function (err, results) {

            var count = results.length
            if(count > 0){//institusi, prodi, jenjang sudah ada dalam array

              return res.json({success: false, data: {message:'Gagal menambahkan Institusi pendidikan, karena sudah terdaftar sebelumnya.'}})

            }else if(count == 0){//institusi, prodi, jenjang belum ada dalam array

              Pengguna.update(
                              { _id: req.body.pengguna },
                              { $push: { 'akademik.universitas_prodi': {universitas: req.body.institusi, jenjang: req.body.jenjang, prodi: req.body.prodi, nim_nip: req.body.nim, foto_ktm_ktp: req.body.foto_ktm, status: 0} } }
                          ).exec(function (err, results) {
                            if(err){
                             return res.json({success: false, data: {message:err}})
                           }else{
                             return res.json({success: true, data: {message:'Institusi Pendidikan Anda berhasil ditambahkan, silahkan menunggu untuk dikonfirmasi oleh Institusi Pendidikan.'}})
                           }
                          })

            }

          })



        }else{

          return res.json({success: false, data: {message:data.data.message}})

        }

    })


  }

}
