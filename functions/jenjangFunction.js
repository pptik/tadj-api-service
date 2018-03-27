//Import Model
const userModelUniversitas = require('../models/userModelUniversitas');
const jenjangModel = require('../models/jenjangModel');
const prodiModel = require('../models/prodiModel');

//Import Library
const restClient = require('node-rest-client').Client;

//Import etc
const global = require('../global.json');

exports.daftar_jenjang = function (request, callback){
    userModelUniversitas.find({
        '_id': request.universitas,
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
            callback(false,err)
        }else{
            console.log('U: '+request.universitas)
            console.log('H: '+JSON.stringify(results))
            callback(true,results)
        }
    });
}

exports.daftar_prodi = function (request, callback) {
    console.log('Masuk fungsi daftar prodi  ')
    jenjangModel.find({'_id':request.jenjang})
        .populate({
            path: 'prodi',model:prodiModel
        })
        .select({'prodi':1})
        .exec(function (err, results) {
            if (err) {
                callback(false,err)
            }else{
                callback(true,results)
            }
        });
}
