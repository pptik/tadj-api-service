//Import model
var Mapel = require('../models/mapelModel');
var Session = require('../models/sessionModel');
var Pengguna = require('../models/userModelMahasiswa');
var PenggunaUniversitas = require('../models/userModelUniversitas');
var jenjangModel = require('../models/jenjangModel');
var Prodi = require('../models/prodiModel');

//Import library
var async = require('async');
var moment = require('moment');
var restClient = require('node-rest-client').Client;
var rClient = new restClient();
var base_api_url = 'http://localhost:3001';

//Import functions
const jenjangFunction = require('../functions/jenjangFunction');
const sessionFunction = require('../functions/sessionFunction');

//Import etc
const global = require('../global.json');

exports.daftar = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('universitas', 'Id universitas tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('universitas').escape();

  req.sanitize('access_token').trim();
  req.sanitize('universitas').escape();

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

      //Promise Daftar Jenjang
      var daftarJenjang;
      const promiseDaftarJenjang = function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  jenjangFunction.daftar_jenjang(req.body, function(callback){
                      if(arguments[0]){
                          daftarJenjang = arguments[1]
                          resolve(true);
                      }else{
                          reject(arguments[1]);
                      }
                  })
              }else{
                  reject(global.pesan_gagal.jenjang_universitas)
              }
          })
      }

      //Atur Promise
      const consumePromise = function(){
          promiseSession
              .then(promiseDaftarJenjang)
              .then(function () {
                  return res.json({success: true, data: {message:global.pesan_berhasil.jenjang_universitas,data: daftarJenjang}})
              })
              .catch(function(err) {
                  return res.json({success: false, data: [{msg:err}]})
              })
      };

      consumePromise();
  }
}

exports.prodi = function(req,res) {

  //Inisial validasi
  req.checkBody('access_token', 'Akses token tidak boleh kosong').notEmpty();
  req.checkBody('jenjang', 'Id jenjang tidak boleh kosong').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('access_token').escape();
  req.sanitize('jenjang').escape();

  req.sanitize('access_token').trim();
  req.sanitize('jenjang').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{
      //Promise cek session -> daftar prodi
      //Promise Cek Session
      const promiseSession = new Promise(function (resolve, reject){
          sessionFunction.cek_status(req.body,function (callback) {
              if(callback){
                  resolve(true)
              }else{
                  reject(global.pesan_gagal.session);
              }
          })
      });

      //Promise Daftar Prodi
      var daftarProdi;
      const promiseDaftarProdi = function(session){
          return new Promise(function(resolve, reject){
              if(session){
                  jenjangFunction.daftar_prodi(req.body, function(callback){
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
