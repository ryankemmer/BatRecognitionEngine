var express = require('express');
var router = express.Router();
const multer = require("multer");
const fs = require('fs')
const { FilePond } = require("filepond");



const storage = multer.diskStorage({
  destination: './public/videos',
  filename: function (req, file, cb) {
      console.log('file uploaded', file);
      cb(null, 'vid.mp4')
  }
})

var upload = multer({storage: storage});

/* GET home page. */
router.get('/', function(req, res, next) {


  try {
    fs.unlinkSync('./public/videos/vid.mp4')
    //file removed
  } catch(err) {
    console.error(err)
  }
  res.render('index');
});

router.post('/upload', upload.single('video'), (req, res, next) => {

  const file = req.file
  console.log(file)
  
})

router.post('/submit', (req, res, next) => {

  var spawn = require("child_process").spawn;

  var process = spawn('python',["./public/python/test.py"] );

  process.stdout.on('data',function(data){
     console.log(data.toString());
  });

  array = [1,2,2,2,2,1,1,1,1,1,1,2,2,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0]

  inCount = 4

  outCount = 2

  res.render('summary', {data: array, inNum: inCount, outNum: outCount})


})


module.exports = router;
