var express = require('express');
var router = express.Router();
var app = express();
var bodyParser = require('body-parser');
var moment = require('moment');
require('express-group-routes');

var userController = require('../controllers/userController');
var institusiController = require('../controllers/institusiController');
var mahasiswaController = require('../controllers/mahasiswaController');
var mapelController = require('../controllers/mapelController');
var publicController = require('../controllers/publicController');
var jenjangController = require('../controllers/jenjangController');



router.group("/daftar_sekolah", (router) => {
  router.get('/', function(req, res, next) {
    res.redirect('/public/daftar_sekolah');
  });
  router.post('/pengguna', publicController.daftar_sekolah_pengguna);

})

router.group("/pengguna", (router) => {
  router.post('/guru/sekolah', publicController.pengguna_guru_sekolah);
})

router.group("/daftar_kelas", (router) => {
    router.post('/', publicController.daftar_kelas);
    router.post('/guru', publicController.daftar_kelas_guru);
    router.post('/tambah', publicController.tambah_kelas);
    router.post('/detail', publicController.kelas_detail);
    router.post('/ubah_nama', publicController.kelas_detail_ubah_nama);
    router.post('/ubah_mapel', publicController.kelas_detail_ubah_mapel);
    router.post('/ubah_guru', publicController.kelas_detail_ubah_guru);
})

router.group("/pengaturan", (router) => {

})


router.get('/daftar_kegiatan', function(req, res, next) {

});

router.post('/profil', userController.get_profile)


router.post('/masuk', userController.masuk);

router.group("/android", (router) => {
    // router.post('/masuk', userController.masuk_android);
    // router.post("/daftar/proses/guru", userController.daftar_proses_guru_android);
    // router.post("/daftar/proses/siswa", userController.daftar_proses_siswa_android);
});

router.post('/keluar', userController.keluar);

router.post('/cek_session', userController.cek_session);

router.group("/poin", (router) => {
    router.post("/tambah", userController.tambah_poin);
    router.post("/daftar", userController.daftar_poin);
});

router.group("/daftar/proses", (router) => {
    router.post("/dosen", userController.daftar_proses_dosen);
    router.post("/mahasiswa", userController.daftar_proses_mahasiswa);
});

router.group("/institusi", (router) => {
    router.post("/daftar", institusiController.daftar);
    router.post("/daftar_mahasiswa", institusiController.daftar_mahasiswa);
    router.post("/daftar_mahasiswa/pending", institusiController.pending_daftar_mahasiswa);
});

router.group("/jenjang", (router) => {
    router.post("/daftar", jenjangController.daftar);
    router.post("/prodi", jenjangController.prodi);
});

router.group("/mahasiswa", (router) => {
    router.post("/daftar_universitas", mahasiswaController.daftar_universitas);
});

router.group("/mapel", (router) => {
    router.get("/", mapelController.daftar_mapel);
    router.post("/materi", mapelController.daftar_materi);
});

router.group("/kirim", (router) => {
    router.post("/status", function(req, res, next) {

    });
});

module.exports = router;
