//Import model
var Prodi = require('../models/prodiModel');

//Import functions
const prodiFunction = require('../functions/prodiFunction');
const sessionFunction = require('../functions/sessionFunction');

//Import etc
const global = require('../global.json');

exports.daftar = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('universitas', 'Universitas tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('universitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('universitas').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{
    //Promise cek session -> daftar jenjang
      //Promise Cek Session
      const promiseSession = new Promise(function (resolve, reject){
          sessionFunction.cek_status(req.body,function (callback) {
              if(callback){
                  console.log('berhasil session')
                  resolve(true)
              }else{
                  reject(global.pesan_gagal.session);
              }
          })
      });

      //Promise Daftar Prodi
      var daftarProdi;
      const promiseDaftarProdi= function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  prodiFunction.daftar(req.body, function(callback){
                      if(arguments[0]){
                          daftarProdi = arguments[1]
                          resolve(true);
                      }else{
                          reject(arguments[1]);
                      }
                  })
              }else{
                  reject(global.pesan_gagal.prodi_universitas)
              }
          })
      }

      //Atur Promise
      const consumePromise = function(){
          promiseSession
              .then(promiseDaftarProdi)
              .then(function () {
                  return res.json({success: true, data: {message:global.pesan_berhasil.prodi_universitas,data: daftarProdi}})
              })
              .catch(function(err) {
                  return res.json({success: false, data: [{msg:err}]})
              })
      };

      consumePromise();
  }
}

