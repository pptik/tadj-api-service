//Import models
var User = require('../models/userModelMahasiswa');//user guru
//var UniversitasCivitas = require('../models/UniversitasCivitas');
var Poin = require('../models/poinModel');
var Session = require('../models/sessionModel');
var Class = require('../models/classModel');

//Import libraries
var async = require('async');
var moment = require('moment');
var md5 = require('md5')
var restClient = require('node-rest-client').Client;
var rClient = new restClient();
var base_api_general_url = 'http://apigeneral.vidyanusa.id';
var nodemailer = require('nodemailer');

//Import functions
const userFunction = require('../functions/userFunction');
const sessionFunction = require('../functions/sessionFunction');

//Import etc
const global = require('../global.json');

function randomAccessToken() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 30; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

exports.masuk = function(req,res) {

  //Inisial validasi
  req.checkBody('email', 'Mohon isi field Email').notEmpty();
  req.checkBody('sandi', 'Mohon isi field Sandi').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('email').escape();
  req.sanitize('email').trim();
  req.sanitize('sandi').escape();
  req.sanitize('sandi').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  //Eksekusi validasi
  if(errors){//Terjadinya kesalahan
      return res.json({success: false, data: errors})
  }else{
    //Promise Login
    var dataKembalianLogin;
    const promiseLogin = new Promise(function (resolve, reject){
        userFunction.login(req.body,function (callback) {
            if(arguments[0]){//Bila tidak terjadi error
                if(arguments[1] == 1){//Bila akun ditemukan
                    dataKembalianLogin = {access_token: arguments[2],user_id: arguments[3], user_role: arguments[4], username: arguments[5]}
                    resolve(true)
                }else if(arguments[1] == 0){//Bila akun tidak ditemukan
                    reject('Akun tidak ditemukan');
                }
            }else{
                reject('Terjadi kesalahan pada sistem');
            }
        })
    });

      //Atur Promise
      const consumePromise = function(){
          promiseLogin
              .then(function () {
                  return res.json({success: true, data: {message:'Login berhasil', data:dataKembalianLogin}})
              })
              .catch(function(error) {
                  return res.json({success: false, data: {message:error}})
              })
      };

      consumePromise();
  }
}

exports.masuk_android = function(req,res) {

  //Inisial validasi
  req.checkBody('email', 'Mohon isi field Email').notEmpty();
  req.checkBody('sandi', 'Mohon isi field Sandi').notEmpty();

  //Dibersihkan dari Special Character
  req.sanitize('email').escape();
  req.sanitize('email').trim();
  req.sanitize('sandi').escape();
  req.sanitize('sandi').trim();

  //Menjalankan validasi
  var errors = req.validationErrors();

  //Membuat objek inputan sudah di validasi dan dibersihkan
  var inputan = new User(
    { email: req.body.email, sandi: req.body.sandi}
  );

  User.find({'email':inputan.email,'sandi':md5(inputan.sandi+global.salt_password)})
   .exec(function (err, results) {

     if (err) {
       return res.json({success: false, data: err})
     }else{

       if(results.length == 1){//Akun ditemukan
          var dataPengguna = {data: results}
          var username = dataPengguna.data[0].profil.username
          var peran = dataPengguna.data[0].peran
          var idPengguna = dataPengguna.data[0]._id

          var generateAccessToken = randomAccessToken()

          //Mengatur kembalian
          async.series({
              one: function(callback) {
                //Mencek apakah sudah ada access token untuk pengguna yang masuk
                Session.find({'user_id':idPengguna,'end_at':null})
                 .exec(function (err, results) {
                   var dataSession

                   if(results.length == 0){//Pengguna belum memiliki session dengan end date null
                     // Buat baru access token di collection session
                     var inputan = new Session(
                       {
                         user_id: idPengguna,
                         access_token: generateAccessToken,
                         platform: 'android'
                       }
                     );

                     inputan.save(function(err){
                       if (err) {
                         //return res.json({success: false, data: err})
                       } else {
                         //accessToken = generateAccessToken
                       }
                     })

                   }else if(results.length == 1){//Pengguna sudah memiliki session dengan end date null
                     // Meng ekspire kan access token
                     var dataSession = {data: results}
                     //console.log("Pjg Kembalian: "+results.length)
                     var idSession = dataSession.data[0]._id

                     Session.update({ _id: idSession }, { $set: { end_at: Date.now() }})
                      .exec(function (err, results) {
                          if (err) {

                          }else{
                            // Buat baru access token di collection session
                            var inputan = new Session(
                              {
                                user_id: idPengguna,
                                access_token: generateAccessToken,
                                platform: 'android'
                              }
                            );

                            inputan.save(function(err){
                              if (err) {
                                //return res.json({success: false, data: err})
                              } else {
                                //accessToken = generateAccessToken
                              }
                            })
                          }
                      })
                   }
                 });

                callback(null, 1);
              },
              two: function(callback){
                return res.json({success: true, data: {access_token: generateAccessToken, id_pengguna: idPengguna, username: username, peran: peran}})

                callback(null, 2);
              }
          }, function(err, results) {
              // results is now equal to: {one: 1, two: 2}
          })


       }else if(results.length == 0){//Akun tidak ditemukan
          return res.json({success: false, data: {message: 'Maaf email atau sandi anda salah.'}})
       }else{
          return res.json({success: false})
       }


     }

   });

}





exports.daftar_proses_mahasiswa = function(req,res) {

  //Inisial validasi
    //req.checkBody('email', 'Mohon isi field Email').notEmpty();
    req.checkBody('username', 'Mohon isi field Username').notEmpty();
    req.checkBody('sandi', 'Mohon isi field Sandi').notEmpty();

    //Dibersihkan dari Special Character
    //req.sanitize('email').escape();
    req.sanitize('username').escape();
    req.sanitize('sandi').escape();

    //req.sanitize('email').trim();
    req.sanitize('username').trim();
    req.sanitize('sandi').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else{//Input ke collection
        //Promise Daftar Siswa
        var kembalianDaftarPengguna;
        const promiseDaftarSiswa = new Promise(function (resolve, reject){
            userFunction.daftar_mahasiswa(req.body,function (callback) {
                if(arguments[0]){
                    kembalianDaftarPengguna = {access_token: arguments[2],user_id: arguments[3], user_role: arguments[4], username: arguments[5]};
                    resolve(true)
                }else{
                    reject(global.pesan_gagal.daftar_pengguna);
                }
            })
        });

        //Atur Promise
        const consumePromise = function(){
            promiseDaftarSiswa
                .then(function () {

                    //Proses kirim email
                    var transporter = nodemailer.createTransport({
                        service: 'gmail',
                        auth: {
                            user: global.akun_email_bc.user,
                            pass: global.akun_email_bc.pass
                        }
                    });

                    var mailOptions = {
                        from: global.akun_email_bc.user,
                        to: req.body.email,
                        subject: 'Tugas Akhir Dalam Jaringan: Pendaftaran berhasil sebagai mahasiswa',
                        text: "Selamat anda berhasil melakukan pendaftaran akun mahasiswa di TADJ dengan email ini dan sandi anda: "+req.body.sandi+" . Mohon untuk tidak membalas email ini. Terimakasih."
                    };

                    transporter.sendMail(mailOptions, function(error, info){
                        console.log('Masuk transporter');
                        if (error) {
                            console.log("Terjadi kesalah ketika mengirim ke email: "+error);

                        } else {
                            console.log('Email sent: ' + info.response);
                        }
                    });

                    return res.json({success: true, data: {message:global.pesan_berhasil.daftar_pengguna, data:kembalianDaftarPengguna}})
                })
                .catch(function(error) {
                    return res.json({success: false, data: [{msg:error}]})
                })
        };

        consumePromise();
    }
}

exports.daftar_proses_dosen = function(req,res) {

  //Inisial validasi
    req.checkBody('email', 'Mohon isi field Email').notEmpty();
    req.checkBody('username', 'Mohon isi field Username').notEmpty();
    req.checkBody('sandi', 'Mohon isi field Sandi').notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('email').escape();
    req.sanitize('username').escape();
    req.sanitize('sandi').escape();

    req.sanitize('email').trim();
    req.sanitize('username').trim();
    req.sanitize('sandi').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Membuat objek inputan sudah di validasi dan dibersihkan
    var inputan = new User(
      {
        email: req.body.email,
        sandi: md5(req.body.sandi+global.salt_password),
        profil:{
          username: req.body.username
        },
        akademik:{
          peran: 3
        }
      }
    );

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan

        return res.json({success: false, data: errors})

    }else{//Input ke collection

      //Dicek terlebih dahulu apakah email atau password sudah terdaftar
      //User.find({'email':req.body.email,'username':md5(inputan.sandi+global.salt_password)})
      User.find({$or:[{'email':req.body.email},{'profil.username':req.body.username}]})
       .exec(function (err, results) {

         if (err) {
           return res.json({success: false, data: err})
         }else{

           if(results.length == 1){//Email atau username sudah terdaftar
             return res.json({success: false, data:[{msg:'Email atau username sudah terdaftar'}]})
             //return res.json({success: false, data: {message: 'Maaf email atau sandi anda salah.'}})
           }else if(results.length == 0){//Email atau username bisa digunakan
             //Query simpan ke collection pengguna
             inputan.save(function(err){
               if (err) {
                 return res.json({success: false, data: err})
               } else {

                 //Menggunakan kembali fungsi login
                 User.find({'email':req.body.email,'sandi':md5(req.body.sandi+global.salt_password)})
                  .exec(function (err, results) {

                    if (err) {
                      return res.json({success: false, data: err})
                    }else{

                      if(results.length == 1){//Akun ditemukan

                         var dataPengguna = {data: results}

                         var username = dataPengguna.data[0].profil.username
                         var peran = dataPengguna.data[0].akademik.peran
                         var idPengguna = dataPengguna.data[0]._id

                         var generateAccessToken = randomAccessToken()

                         //Mengatur kembalian
                         async.series({
                             one: function(callback) {
                               //Mencek apakah sudah ada access token untuk pengguna yang masuk
                               Session.find({'user_id':idPengguna,'end_at':null})
                                .exec(function (err, results) {
                                  var dataSession

                                  if(results.length == 0){//Pengguna belum memiliki session dengan end date null
                                    // Buat baru access token di collection session
                                    var inputan = new Session(
                                      {
                                        user_id: idPengguna,
                                        access_token: generateAccessToken,
                                        platform: 'web'
                                      }
                                    );

                                    inputan.save(function(err){
                                      if (err) {
                                        //return res.json({success: false, data: err})
                                      } else {
                                        //accessToken = generateAccessToken
                                      }
                                    })

                                  }else if(results.length == 1){//Pengguna sudah memiliki session dengan end date null
                                    // Meng ekspire kan access token
                                    var dataSession = {data: results}
                                    //console.log("Pjg Kembalian: "+results.length)
                                    var idSession = dataSession.data[0]._id

                                    Session.update({ _id: idSession }, { $set: { end_at: Date.now() }})
                                     .exec(function (err, results) {
                                         if (err) {

                                         }else{
                                           // Buat baru access token di collection session
                                           var inputan = new Session(
                                             {
                                               user_id: idPengguna,
                                               access_token: generateAccessToken,
                                               platform: 'web'
                                             }
                                           );

                                           inputan.save(function(err){
                                             if (err) {
                                               //return res.json({success: false, data: err})
                                             } else {
                                               //accessToken = generateAccessToken
                                             }
                                           })
                                         }
                                     })
                                  }
                                });

                               callback(null, 1);
                             },
                             two: function(callback){
                               return res.json({success: true, data: {access_token: generateAccessToken, id_pengguna: idPengguna, username: username, peran: peran}})

                               callback(null, 2);
                             }
                         }, function(err, results) {
                             // results is now equal to: {one: 1, two: 2}
                         })


                      }else if(results.length == 0){//Akun tidak ditemukan
                         return res.json({success: false, data: {message: 'Maaf email atau sandi anda salah.'}})
                      }else{
                         return res.json({success: false})
                      }
                    }
                  });

                 //return res.json({success: true, data: {username: inputan.username}})
               }
             })

           }
         }

       });

    }

}

exports.daftar_proses_guru_android = function(req,res) {

  //Inisial validasi
    req.checkBody('email', 'Mohon isi field Email').notEmpty();
    req.checkBody('username', 'Mohon isi field Username').notEmpty();
    req.checkBody('nama_lengkap', 'Mohon isi field Nama Lengkap').notEmpty();
    req.checkBody('jenis_kelamin', 'Mohon pilih Jenis Kelamin').notEmpty();
    req.checkBody('sandi', 'Mohon isi field Sandi').notEmpty();
    req.checkBody('sekolah', 'Mohon pilih field Sekolah').notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('email').escape();
    req.sanitize('username').escape();
    req.sanitize('nama_lengkap').escape();
    req.sanitize('jenis_kelamin').escape();
    req.sanitize('sandi').escape();
    req.sanitize('sekolah').escape();

    req.sanitize('email').trim();
    req.sanitize('username').trim();
    req.sanitize('nama_lengkap').trim();
    req.sanitize('jenis_kelamin').trim();
    req.sanitize('sandi').trim();
    req.sanitize('sekolah').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Membuat objek inputan sudah di validasi dan dibersihkan
    var inputan = new User(
      {
        email: req.body.email,
        sandi: md5(req.body.sandi+global.salt_password),
        peran: 4,
        sekolah: req.body.sekolah,
        profil: {
          username: req.body.username,
          nama_lengkap: req.body.nama_lengkap,
          jenis_kelamin: req.body.jenis_kelamin,
          profil_picture: '',
          bio: ''
        }
      }
    );

    //Eksekusi validasi
  if(errors){//Terjadinya kesalahan

      return res.json({success: false, data: errors})

  }else{//Input ke collection

    //Dicek terlebih dahulu apakah email atau password sudah terdaftar
    //User.find({'email':req.body.email,'username':md5(inputan.sandi+global.salt_password)})
    User.find({$or:[{'email':req.body.email},{'profil.username':req.body.username}]})
     .exec(function (err, results) {

       if (err) {
         return res.json({success: false, data: err})
       }else{

         if(results.length == 1){//Email atau username sudah terdaftar
           return res.json({success: false, data:[{message:'Email atau username sudah terdaftar'}]})
         }else if(results.length == 0){//Email atau username bisa digunakan
           //Query simpan ke collection pengguna
           inputan.save(function(err){
             if (err) {
               return res.json({success: false, data: err})
             } else {

               //Menggunakan kembali fungsi login
               User.find({'email':req.body.email,'sandi':md5(req.body.sandi+global.salt_password)})
                .exec(function (err, results) {

                  if (err) {
                    return res.json({success: false, data: err})
                  }else{

                    if(results.length == 1){//Akun ditemukan
                       var dataPengguna = {data: results}
                       var username = dataPengguna.data[0].profil.username
                       var peran = dataPengguna.data[0].peran
                       var idPengguna = dataPengguna.data[0]._id

                       var generateAccessToken = randomAccessToken()

                       //Mengatur kembalian
                       async.series({
                           one: function(callback) {
                             //Mencek apakah sudah ada access token untuk pengguna yang masuk
                             Session.find({'user_id':idPengguna,'end_at':null})
                              .exec(function (err, results) {
                                var dataSession

                                if(results.length == 0){//Pengguna belum memiliki session dengan end date null
                                  // Buat baru access token di collection session
                                  var inputan = new Session(
                                    {
                                      user_id: idPengguna,
                                      access_token: generateAccessToken,
                                      platform: 'android'
                                    }
                                  );

                                  inputan.save(function(err){
                                    if (err) {
                                      //return res.json({success: false, data: err})
                                    } else {
                                      //accessToken = generateAccessToken
                                    }
                                  })

                                }else if(results.length == 1){//Pengguna sudah memiliki session dengan end date null
                                  // Meng ekspire kan access token
                                  var dataSession = {data: results}
                                  //console.log("Pjg Kembalian: "+results.length)
                                  var idSession = dataSession.data[0]._id

                                  Session.update({ _id: idSession }, { $set: { end_at: Date.now() }})
                                   .exec(function (err, results) {
                                       if (err) {

                                       }else{
                                         // Buat baru access token di collection session
                                         var inputan = new Session(
                                           {
                                             user_id: idPengguna,
                                             access_token: generateAccessToken,
                                             platform: 'android'
                                           }
                                         );

                                         inputan.save(function(err){
                                           if (err) {
                                             //return res.json({success: false, data: err})
                                           } else {
                                             //accessToken = generateAccessToken
                                           }
                                         })
                                       }
                                   })
                                }
                              });

                             callback(null, 1);
                           },
                           two: function(callback){
                             return res.json({success: true, data: {access_token: generateAccessToken, id_pengguna: idPengguna, username: username, peran: peran}})

                             callback(null, 2);
                           }
                       }, function(err, results) {
                           // results is now equal to: {one: 1, two: 2}
                       })


                    }else if(results.length == 0){//Akun tidak ditemukan
                       return res.json({success: false, data: {message: 'Maaf email atau sandi anda salah.'}})
                    }else{
                       return res.json({success: false})
                    }
                  }
                });

               //return res.json({success: true, data: {username: inputan.username}})
             }
           })

         }
       }

     });

  }

}

exports.get_profile = function(req,res) {

    //Inisial validasi
    req.checkBody('username', 'Mohon isi field Username').notEmpty();
    req.checkBody('access_token', 'Mohon isi field Akses Token').notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('username').escape();
    req.sanitize('username').trim();
    req.sanitize('access_token').escape();
    req.sanitize('access_token').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else {
        //Promise Cek Session->Ambil Data Profil
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

        //Promise Ambil Data Profil
        var kembalianAmbilDataProfil;
        const promiseAmbilDataProfil = function(session){
            return new Promise(function(resolve, reject){
                if(session){
                    userFunction.ambil_profil_pengguna(req.body, function(callback){
                        if(arguments[0]){
                            kembalianAmbilDataProfil = arguments[1];
                            resolve(true);
                        }else{
                            reject(global.pesan_gagal.ambil_profil);
                        }
                    })
                }else{
                    reject(global.pesan_gagal.ambil_profil)
                }
            })
        }

        //Atur Promise
        const consumePromise = function(){
            promiseSession
                .then(promiseAmbilDataProfil)
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.ambil_profil, data:kembalianAmbilDataProfil}})
                })
                .catch(function(error) {
                    return res.json({success: false, data: {message:error}})
                })
        };

        consumePromise();
    }
}

exports.ubah_profile = function(req,res) {

    //Inisial validasi
    req.checkBody('pengguna', 'Mohon isi field Pengguna').notEmpty();
    req.checkBody('nama_lengkap', 'Mohon isi field Nama Lengkap').notEmpty();
    req.checkBody('bio', 'Mohon isi field Bio').notEmpty();
    req.checkBody('access_token', 'Mohon isi field Akses Token').notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('pengguna').escape();
    req.sanitize('pengguna').trim();
    req.sanitize('nama_lengkap').escape();
    req.sanitize('nama_lengkap').trim();
    req.sanitize('bio').escape();
    req.sanitize('bio').trim();
    req.sanitize('access_token').escape();
    req.sanitize('access_token').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else {
        //Promise Cek Session->Ubah Profil
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

        //Promise Ubah Profil
        const promiseUbahDataProfil = function(session){
            return new Promise(function(resolve, reject){
                if(session){
                    userFunction.ubah_profil_pengguna(req.body, function(callback){
                        if(callback){
                            resolve(true);
                        }else{
                            reject(global.pesan_gagal.ubah_profil);
                        }
                    })
                }else{
                    reject(global.pesan_gagal.ubah_profil)
                }
            })
        }

        //Atur Promise
        const consumePromise = function(){
            promiseSession
                .then(promiseUbahDataProfil)
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.ubah_profil}})
                })
                .catch(function(error) {
                    return res.json({success: false, data: {message:error}})
                })
        };

        consumePromise();
    }
}

exports.ubah_sandi = function(req,res) {

    //Inisial validasi
    req.checkBody('access_token', 'Mohon isi field Akses Token').notEmpty();
    req.checkBody('pengguna', 'Mohon isi field Pengguna').notEmpty();
    req.checkBody('sandi_lama', 'Mohon isi field Sandi Lama').notEmpty();
    req.checkBody('sandi_baru', 'Mohon isi field Sandi Baru').notEmpty();


    //Dibersihkan dari Special Character
    req.sanitize('access_token').escape();
    req.sanitize('access_token').trim();
    req.sanitize('pengguna').escape();
    req.sanitize('pengguna').trim();
    req.sanitize('sandi_lama').escape();
    req.sanitize('sandi_lama').trim();
    req.sanitize('sandi_baru').escape();
    req.sanitize('sandi_baru').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else {
        //Promise Cek Session->Ubah Sandi
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

        //Promise Ubah Sandi
        var pesanKembalian;
        const promiseUbahDataProfil = function(session){
            return new Promise(function(resolve, reject){
                if(session){
                    userFunction.ubah_sandi(req.body, function(callback){
                        if(callback){
                            //Proses kirim email
                            var transporter = nodemailer.createTransport({
                                service: 'gmail',
                                auth: {
                                    user: global.akun_email_bc.user,
                                    pass: global.akun_email_bc.pass
                                }
                            });

                            var mailOptions = {
                                from: global.akun_email_bc.user,
                                to: req.body.email,
                                subject: 'Tugas Akhir Dalam Jaringan: Reset sandi akun',
                                text: "Selamat anda berhasil melakukan reset sandi akun TADJ, sandi anda sekarang adalah: "+req.body.sandi_baru+" . Mohon untuk tidak membalas email ini. Terimakasih."
                            };

                            transporter.sendMail(mailOptions, function(error, info){
                                console.log('Masuk transporter');
                                if (error) {
                                    console.log("Terjadi kesalah ketika mengirim ke email: "+error);

                                } else {
                                    console.log('Email sent: ' + info.response);
                                }
                            });

                            resolve(true);
                        }else{
                            pesanKembalian = arguments[1]
                            reject(global.pesan_gagal.ubah_sandi);
                        }
                    })
                }else{
                    reject(global.pesan_gagal.ubah_sandi)
                }
            })
        }

        //Atur Promise
        const consumePromise = function(){
            promiseSession
                .then(promiseUbahDataProfil)
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.ubah_sandi}})
                })
                .catch(function() {
                    return res.json({success: false, data: [{msg:pesanKembalian}]})
                })
        };

        consumePromise();
    }
}

exports.keluar = function(req,res) {
  if(req.body.access_token == null){
    return res.json({success:false,message:'Parameter akses token tidak boleh kosong'})
  }else{
    Session.update({ access_token: req.body.access_token }, { $set: { end_at: Date.now() }})
     .exec(function (err, results) {
         if (err) {
           return res.json({success:false})
         }else{
           return res.json({success:true})
         }
     })
  }


}

exports.tambah_poin = function(req, res) {
  args = {
    	data: {
        access_token: req.body.access_token},
    	headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
    };

  //Cek session terlebih dahulu sebelum menambahkan poin
  rClient.post(base_api_general_url+'/cek_session', args, function (data, response) {

      if(data.success == true){//session berlaku

        //Inisial validasi
        req.checkBody('id_pengguna', 'Id pengguna tidak boleh kosong').notEmpty();
        req.checkBody('jumlah_poin', 'Jumlah poin tidak boleh kosong').notEmpty();
        req.checkBody('keterangan', 'keterangan tidak boleh kosong').notEmpty();

        //Dibersihkan dari Special Character
        req.sanitize('id_pengguna').escape();
        req.sanitize('jumlah_poin').escape();
        req.sanitize('keterangan').escape();

        req.sanitize('id_pengguna').trim();
        req.sanitize('jumlah_poin').trim();
        req.sanitize('keterangan').trim();

        //Menjalankan validasi
        var errors = req.validationErrors();

        if(errors){//Terjadinya kesalahan
            return res.json({success: false, data: errors})
        }else{

          var inputan = new Poin(
            {
              id_pengguna: req.body.id_pengguna,
              jumlah_poin: req.body.jumlah_poin,
              keterangan: req.body.keterangan
            }
          );

          inputan.save(function(err){
            if (err) {
              return res.json({success: false, data: {message:err}})
            } else {
              return res.json({success: true, data: {message:'Poin berhasil ditambahkan.'}})
            }
          })

        }


      }else{//session tidak berlaku
        //console.log('Session Tidak Berlaku:'+JSON.stringify())
        return res.json({success: false, data: {message:'Token tidak berlaku'}})

      }

  });

}

exports.daftar_poin = function(req, res) {

  if(req.body.id_pengguna == null || req.body.id_pengguna == ''){
    return res.json({success: false, data: {message:'Param id pengguna tidak boleh kosong.'}})
  }else{

    Poin.find({'id_pengguna':req.body.id_pengguna})
     .sort([['created_at', 'descending']])
     .exec(function (err, results) {
       return res.json({success: true, data: results})
     })

  }

}

exports.cek_session = function(req, res) {
    //Inisial validasi
    req.checkBody('access_token', 'Mohon isi field Akses Token').notEmpty();

    //Dibersihkan dari Special Character
    req.sanitize('access_token').escape();
    req.sanitize('access_token').trim();

    //Menjalankan validasi
    var errors = req.validationErrors();

    //Eksekusi validasi
    if(errors){//Terjadinya kesalahan
        return res.json({success: false, data: errors})
    }else {
        //Promise Cek Session
        var statusSession
        var deskripsiSession
        const promiseCekSession = new Promise(function (resolve, reject){
            userFunction.cek_session(req.body,function (callback) {
                if(arguments[0]){//Bila tidak terjadi error
                    if(arguments[1] == 0){
                        statusSession = arguments[1]
                        deskripsiSession = "Tidak Berlaku"
                    }else if(arguments[1] == 1){
                        statusSession = arguments[1]
                        deskripsiSession = "Berlaku"
                    }
                    resolve(true)
                }else{
                    reject('Terjadi kesalahan pada sistem');
                }
            })
        });

        //Atur Promise
        const consumePromise = function(){
            promiseCekSession
                .then(function () {
                    return res.json({success: true, data: {message:global.pesan_berhasil.session, data:{status: statusSession, deskripsi: deskripsiSession}}})
                })
                .catch(function(error) {
                    return res.json({success: false, data: [{msg:global.pesan_gagal.session}]})
                })
        };

        consumePromise();
    }
}
