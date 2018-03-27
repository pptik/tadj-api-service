//Import Model
const prodiModel = require('../models/prodiModel');
const universitasModel = require('../models/universitasCivitasModel');

exports.daftar = function (request, callback){
    universitasModel.find({
        _id: request.universitas
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

