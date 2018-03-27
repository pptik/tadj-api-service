//Import Model
const userModelMahasiswa = require('../models/userModelMahasiswa');
const userModelUniversitas = require('../models/userModelUniversitas');
const prodiModel = require('../models/prodiModel');
const jenjangModel = require('../models/jenjangModel');

//Import Library
const restClient = require('node-rest-client').Client;

//Import etc
const global = require('../global.json');

exports.daftar_universitas = function (request, callback){

    userModelMahasiswa.find({
        $and:
            [
                {'akademik.peran':4},
                {'_id':request.pengguna}
            ]
    })
    .populate({
        path: 'akademik.universitas_prodi.universitas',model:userModelUniversitas,select: 'profil'
    })
    .populate({
        path: 'akademik.universitas_prodi.prodi',model:prodiModel,select: 'nama'
    })
    .populate({
        path: 'akademik.universitas_prodi.jenjang',model:jenjangModel,select: 'nama'
    })
    .select({'akademik.universitas_prodi':1})
    .exec(function (err, results) {
        if (err) {
            callback(false,err)
        }else{
            callback(true,results)
        }
    });
}

exports.menambahkan_institusi_prodi_jenjang = function (request, callback) {
    userModelUniversitas.find({'_id':request.institusi, 'civitas.mahasiswa': {$elemMatch:{pengguna:request.pengguna,prodi:request.prodi,jenjang:request.jenjang}} }).exec(function (err, results) {
        var count = results.length
        if(count > 0){//mahasiswa sudah terdaftar
            callback(false,global.pesan_gagal.menambahkan_universitas)
        }else if(count == 0){//mahasiswa belum terdaftar
            userModelUniversitas.findOneAndUpdate(
                { _id: request.institusi },
                { $push:{'civitas.mahasiswa':{pengguna: request.pengguna,prodi: request.prodi, jenjang: request.jenjang, nim_nip: request.nim}}}
            ).exec(function (err,results) {
                if(err){
                    callback(false,err)
                }else{
                    var civitas_mahasiswa;

                    //Ambil id civitas akademik yang baru dimasukin
                    //Opsi 1
                    userModelUniversitas.find(
                        {_id:request.institusi, 'civitas.mahasiswa': {$elemMatch:{pengguna:request.pengguna,prodi:request.prodi,jenjang:request.jenjang}}},
                        {'civitas.mahasiswa.$':1}
                        )
                    .exec(function (err, results) {
                        console.log("AMBILIDCIVITAS: "+JSON.stringify(results[0].civitas.mahasiswa[0]._id))
                        civitas_mahasiswa = results[0].civitas.mahasiswa[0]._id

                        //Update ke mahasiswa berupa id akademik dari user universitas
                        userModelMahasiswa.update(
                            { _id: request.pengguna },
                            { $push: { 'akademik.universitas_prodi': {prodi:request.prodi,jenjang:request.jenjang,nim_nip:request.nim,universitas:request.institusi} } }
                        ).exec(function (err, results) {
                            if(err){
                                callback(false,err)
                            }else{
                                callback(true,global.pesan_berhasil.menambahkan_universitas)
                            }
                        })
                    });

                    //Opsi 2
                    /*userModelUniversitas.aggregate([
                        {$match: {'_id': request.institusi}},
                        {$project: {
                                shapes: {$filter: {
                                        input: '$civitas.mahasiswa',
                                        as: 'cm',
                                        cond: [{$and: [
                                                        {$eq: ['$$civitas.mahasiswa.pengguna', request.pengguna]},
                                                        {$eq: ['$$civitas.mahasiswa.prodi', request.prodi]},
                                                        {$eq: ['$$civitas.mahasiswa.jenjang', request.jenjang]}
                                                      ]
                                               }]
                                    }}
                            }}
                    ])
                    .exec(function (err, results) {
                        console.log("Kembalian CIVITAS: "+JSON.stringify(results));
                        callback(true,global.pesan_berhasil.menambahkan_universitas)
                    });*/

                }
            })
        }

    })
}