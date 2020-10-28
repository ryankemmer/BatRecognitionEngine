var express = require('express');
var router = express.Router();
const multer = require("multer");
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
  res.render('index');
});

router.post('/upload', upload.single('video'), (req, res, next) => {

  const file = req.file
  console.log(file)
  
})

router.post('/submit', (req, res, next) => {

  var spawn = require("child_process").spawn;

  var process = spawn('python',["./hello.py", ] );


})


module.exports = router;
