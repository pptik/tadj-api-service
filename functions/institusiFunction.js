//Import Model
const userModelMahasiswa = require('../models/userModelMahasiswa');
const userModelUniversitas = require('../models/userModelMahasiswa');
const userModelUniversitasReal = require('../models/userModelUniversitas');

//Import Library
const restClient = require('node-rest-client').Client;
var mongoose = require('mongoose');
const ObjectId = mongoose.Types.ObjectId;

//Import etc
const global = require('../global.json');

exports.daftar_universitas = function (request, callback){
    userModelUniversitas.find({'akademik.peran':2})
        .select(
            {
                'profil.nama_lengkap':1
            }
        )
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            }else{
                callback(true,results)
            }
        });
}

exports.konfirmasi_mahasiswa = function (request, callback){

    //Ubah status konfirmasi di coll PENGGUNA SEBAGAI UNIVERSITAS
    userModelUniversitasReal.update(
        {'civitas.mahasiswa._id':request.civitas_mahasiswa},
        { $set: { 'civitas.mahasiswa.$.status_konfirmasi': 1 } }
    ).exec(function (err, results) {
        if(err){
            console.log('ERRORNYA: '+JSON.stringify(err))
            callback(false);
        }else{
            console.log("[CIVITAS MAHASISWA]: "+request.civitas_mahasiswa)
            //Mendapatkan data pengguna, jenjang, prodi dan universitas MAHASISWA


            userModelUniversitasReal.aggregate([
                {$match:{'civitas.mahasiswa._id':ObjectId(request.civitas_mahasiswa)}},
                {$unwind: '$civitas.mahasiswa'},
                {$match:{'civitas.mahasiswa._id':ObjectId(request.civitas_mahasiswa)}},
                {$project:{'civitas.mahasiswa':1}}]
            ).exec(function (err, results) {
                if(err){
                    console.log('ERRORNYA: '+JSON.stringify(err))
                    callback(false);
                }else{
                    console.log("[KEMBALIAN AMBIL DATA PENGGUNA SISWA] "+JSON.stringify(results))
                    var pengguna = results[0].civitas.mahasiswa.pengguna
                    var universitas = results[0]._id
                    var prodi = results[0].civitas.mahasiswa.prodi
                    var jenjang = results[0].civitas.mahasiswa.jenjang

                    //console.log("[UNIV] "+universitas)
                    //console.log("[PENGGUNA] "+pengguna)
                    //console.log("[PRODI] "+prodi)
                    //console.log("[JENJANG] "+jenjang)
                    //Mendapatkan id universitas_prodi MAHASISWA
                    userModelMahasiswa.aggregate(
                        {$match:{
                                _id:ObjectId(results[0].civitas.mahasiswa.pengguna),
                                'akademik.universitas_prodi.universitas':ObjectId(results[0]._id),
                                'akademik.universitas_prodi.jenjang':ObjectId(results[0].civitas.mahasiswa.jenjang),
                                'akademik.universitas_prodi.prodi':ObjectId(results[0].civitas.mahasiswa.prodi)
                            }},
                        {$unwind: '$akademik.universitas_prodi'},
                        {$match:{
                                _id:ObjectId(results[0].civitas.mahasiswa.pengguna),
                                'akademik.universitas_prodi.universitas':ObjectId(universitas),
                                'akademik.universitas_prodi.jenjang':ObjectId(results[0].civitas.mahasiswa.jenjang),
                                'akademik.universitas_prodi.prodi':ObjectId(results[0].civitas.mahasiswa.prodi)
                            }},
                        {$project:{'akademik.universitas_prodi':1}}
                    ).exec(function (err, results) {
                        if(err){
                            console.log('ERRORNYA: '+JSON.stringify(err))
                            callback(false)
                        }else{
                            console.log("[UNIVERSITAS PRODI MAHASISWA] "+JSON.stringify(results))
                            var universitas_prodi = results[0].akademik.universitas_prodi._id
                            //Ubah status konfirmasi di coll PENGGUNA SEBAGAI MAHASISWA
                            userModelMahasiswa.update(
                                {'akademik.universitas_prodi._id':ObjectId(universitas_prodi)},
                                { $set: { 'akademik.universitas_prodi.$.status_konfirmasi': 1 } }
                            ).exec(function (err, results) {
                                if(err){
                                    console.log('ERRORNYA: '+JSON.stringify(err))
                                    callback(false);
                                }else{
                                    console.log("BERHASIL UPDATE UNIVERSITAS PRODI dan CIVITAS MAHASISWA")
                                    callback(true);
                                }
                            })
                        }
                    })
                }
            })



        }
    })
}

exports.daftar_mahasiswa_dalam_universitas = function (request, callback){
    userModelUniversitasReal.find({_id: request.universitas})
        .populate('civitas.mahasiswa.pengguna')
        .populate('civitas.mahasiswa.jenjang')
        .populate('civitas.mahasiswa.prodi')
        .select(
            {
                'civitas.mahasiswa':1
            }
        )
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            }else{
                callback(true,results)
            }
        });
}

