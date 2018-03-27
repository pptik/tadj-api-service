//Import Model
const userModelUniversitas = require('../models/userModelMahasiswa');

exports.tambah_kelompok = function (request, callback){
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

