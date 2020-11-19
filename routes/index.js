var express = require('express');
var router = express.Router();
const multer = require("multer");
const fs = require('fs')
const { FilePond } = require("filepond");
const { v4: uuidv4 } = require('uuid');
const User = require('../User');


//get user instance function
let users = [];
let getUserInstance = uid => users.find(user => user.id === uid);
 

const storage = multer.diskStorage({
  destination: './public/videos',
  filename: function (req, file, cb) {
      file = uuidv4();
      cb(null, file + '.mp4')
  }
})

var upload = multer({storage: storage});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.post('/upload', upload.single("video"), (req, res, next) => {

  filename= req.file.filename
  console.log(filename)
  res.cookie("userFileName", filename).send('cookie sent');

  
});

router.delete('/upload',(req, res, next) => {

  try {
    fs.unlinkSync('./public/videos/' + req.cookies["userFileName"])
    //file removed
  } catch(err) {
    console.error(err)
  }

  res.clearCookie("userFileName");
  console.log(req.cookies)
  
});

router.post('/submit', (req, res, next) => {

  console.log(req.cookies)

  var spawn = require("child_process").spawn;

  var process = spawn('python',["./public/python/test.py"] );

  process.stdout.on('data',function(data){
     console.log(data.toString());
  });

  try {
    fs.unlinkSync('./public/videos/' + req.cookies["userFileName"])
    //file removed
  } catch(err) {
    console.error(err)
  }

  res.clearCookie("userFileName");

  array = [1,2,2,2,2,1,1,1,1,1,1,2,2,1,1,0,0,0,0,0,0,0,0,0,1,1,1,1,1,0,0,0,0,0]
  inCount = 4
  outCount = 2

  res.render('summary', {data: array, inNum: inCount, outNum: outCount})

})


module.exports = router;
