var express = require('express');
var router = express.Router();
const multer = require("multer");


const storage = multer.diskStorage({
  destination: './public/videos',
  filename: function (req, file, cb) {
      console.log('file uploaded', file);
      cb(null, `test.mp4`);
  }
})

var upload = multer({storage: storage});

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});

router.post('/upload', function (request, response) {
  upload(request, response, function(err) {
      if(err) {
          console.log('Error Occured'); 
          return; 
      }
      console.log(request.file);
      response.end('Your file Uploaded'); 
      console.log('Video Uploaded'); 
  })
}); 

module.exports = router;
