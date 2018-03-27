//Import Model
const userModelMahasiswa = require('../models/userModelMahasiswa');
const sessionModel = require('../models/sessionModel');

//Import Library
const md5 = require('md5');
const restClient = require('node-rest-client').Client;
const rClient = new restClient();

//Import etc
const global = require('../global.json');

function randomAccessToken() {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < 30; i++)
        text += possible.charAt(Math.floor(Math.random() * possible.length));

    return Date.now()+text;
}

exports.login = function (request, callback) {
    userModelMahasiswa.find({email:request.email, sandi: md5(request.sandi+global.salt_password)})
        .exec(function (err, results) {
            if(err){
                callback(false,err)
            }

            if(results.length == 0){//Pengguna tidak ditemukan
                callback(true,0)
            }else if(results.length == 1){//Pengguna ditemukan
                var dataPengguna = {data: results}
                var username = dataPengguna.data[0].profil.username
                var peran = dataPengguna.data[0].akademik.peran
                var idPengguna = dataPengguna.data[0]._id

                var generateAccessToken = randomAccessToken()

                sessionModel.find({'user_id':idPengguna,'end_at':null})
                    .exec(function (err, results) {
                        if(results.length == 0){//Pengguna belum memiliki session dengan end date null
                            // Buat baru access token di collection session
                            var inputan = new sessionModel(
                                {
                                    user_id: idPengguna,
                                    access_token: generateAccessToken,
                                    platform: 'web'
                                }
                            );

                            inputan.save(function(err){
                                if (err) {
                                    callback(false,err)
                                } else {
                                    callback(true,1,generateAccessToken,idPengguna,peran,username)
                                }
                            })
                        }else if(results.length == 1){//Pengguna sudah memiliki session dengan end date null
                            // Meng ekspire kan access token
                            var dataSession = {data: results}
                            //console.log("Pjg Kembalian: "+results.length)
                            var idSession = dataSession.data[0]._id

                            sessionModel.update({ _id: idSession }, { $set: { end_at: Date.now() }},{multi: true})
                                .exec(function (err, results) {
                                    if (err) {
                                        callback(false,err)
                                    }else{
                                        // Buat baru access token di collection session
                                        var inputan = new sessionModel(
                                            {
                                                user_id: idPengguna,
                                                access_token: generateAccessToken,
                                                platform: 'web'
                                            }
                                        );

                                        inputan.save(function(err){
                                            if (err) {
                                                callback(false,err)
                                            } else {
                                                callback(true,1,generateAccessToken,idPengguna,peran,username)
                                            }
                                        })
                                    }
                                })
                        }
                    });
            }
        })
}

exports.ambil_profil_pengguna = function (request, callback) {
    userModelMahasiswa.find({'profil.username':request.username})//inputan.username
        .exec(function (err, results) {

            if(err){
                callback(false)
            }
            if(results == 0){
                callback(true,global.pesan_gagal.ambil_profil)
            }else{
                callback(true,results)
            }
        })
}

exports.daftar_mahasiswa = function (request, callback) {

    //Dicek terlebih dahulu apakah email atau password sudah terdaftar
    userModelMahasiswa.find({$or:[{'email':request.email},{'profil.username':request.username}]})
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            } else {

                if (results.length == 1) {//Email atau username sudah terdaftar
                    callback(false,global.pesan_gagal.daftar_pengguna)
                } else if (results.length == 0) {//Email atau username bisa digunakan
                    //Query simpan ke collection pengguna
                    var inputan = new userModelMahasiswa(
                        {
                            email: request.email,
                            sandi: md5(request.sandi+global.salt_password),
                            profil:{
                                username: request.username
                            },
                            akademik:{
                                peran: 4
                            }
                        }
                    );

                    inputan.save(function (err) {
                        if (err) {
                            callback(false,err)
                        } else {
                            //Menggunakan rest client login
                            args = {
                                data: {
                                    email: request.email,
                                    sandi: request.sandi
                                },
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
                            };

                            rClient.post(global.alamat_url.self+'/masuk', args, function (data, response) {
                                if(data.success){
                                    callback(true,1,data.data.data.access_token,data.data.data.user_id,data.data.data.user_role,data.data.data.username)
                                }else{
                                    callback(false)
                                }
                            })
                        }
                    })
                }
            }
        })
}

exports.ubah_profil_pengguna = function (request, callback) {
    userModelMahasiswa.update({ _id: request.pengguna }, { $set: { 'profil.bio' : request.bio, 'profil.nama_lengkap' : request.nama_lengkap }})
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            }else{
                callback(true)
            }
        })
}

exports.ubah_sandi = function (request, callback) {

    userModelMahasiswa.find({_id :request.pengguna, sandi: md5(request.sandi_lama+global.salt_password)})
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            }else{
                if(results.length == 0){
                    callback(false,"Sandi lama yang ada masukkan salah.")
                }else{
                    userModelMahasiswa.update({ _id: request.pengguna }, { $set: { sandi : md5(request.sandi_baru+global.salt_password) }})
                        .exec(function (err, results) {
                            if (err) {
                                callback(false,err)
                            }else{
                                callback(true)
                            }
                        })
                }
            }
        })
}

exports.cek_session = function (request, callback) {
    sessionModel.find({'access_token':request.access_token,'end_at':null})
        .exec(function (err, results) {
            if(err){
                callback(false)
            }
            if(results.length == 0){//Sudah expired akses tokennya
                callback(true,0)
            }else if(results.length == 1){
                callback(true,1)
            }

        });
}