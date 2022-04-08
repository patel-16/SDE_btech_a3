const express = require('express');
const app = express();
const vision = require('@google-cloud/vision');
const {Storage} = require('@google-cloud/storage');

const storage = new Storage();
const multer = require('multer');
const fs = require('fs');

app.use(express.json());
app.use(express.urlencoded({extended: true}));


const upload = multer({
    dest: 'images',
    limits: {fileSize: 1000000,},
    fileFilter(req, file, cb) {
       if (!file.originalname.match(/\.(png|jpg|jpeg)$/)){
           cb(new Error('Please upload an image.'))
       }
       cb(undefined, true)
    }
});

var asyncres = "";

bucketName = 'sde-assignment-3-darsh';

async function uploadFile(filePath, destFileName) {
    await storage.bucket(bucketName).upload(filePath, {
      destination: destFileName,
    });

    console.log(`${filePath} uploaded to ${bucketName}`);
    fs.unlinkSync(filePath);
    
}

async function quickstart(image_path, detection_type) {
  
    // Creates a client
    const client = new vision.ImageAnnotatorClient();
    
    // Performs detection on the image file
    if(detection_type=="logo"){
        // client.logoDetection();
        const [result] = await client.logoDetection(image_path);
        const logos = result.logoAnnotations;
        console.log('Logos:');
        logos.forEach(logo => asyncres+= ""+logo.description+'\n' );
    }
    else if(detection_type=="face"){
        // client.faceDetection();
        const [result] = await client.faceDetection(image_path);
        const faces = result.faceAnnotations;
        asyncres+= 'Faces:'+'\n';
        faces.forEach((face, i) => {
            asyncres+=`  Face #${i + 1}:` +'\n';
            asyncres+=`    Joy: ${face.joyLikelihood}`+'\n';
            asyncres+= `    Anger: ${face.angerLikelihood}`+'\n' ;
            asyncres+= `    Sorrow: ${face.sorrowLikelihood}`+'\n' ;
            asyncres+= `    Surprise: ${face.surpriseLikelihood}`+'\n' ;
        // faces.forEach(face => console.log(face.description));
        });
    }

    console.log(asyncres);
    
}

// quickstart();

app.get("/", function (req, res){
    res.send("Hello from App, send post request with image at '/logoDetect' or '/faceDetect'");
});

app.post("/logoDetect", upload.single('image'), function (req, res){

    const imageName = req.file.originalname;

    console.log(req.file.filename);
    if (imageName.match(/\.(jpg)$/)){
        //  console.log("in")
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".jpg", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = ""
        console.log("images/"+req.file.filename+".jpg");
        uploadFile("images/"+req.file.filename+".jpg", req.file.filename+".jpg").catch(console.error);
        quickstart("images/"+req.file.filename+".jpg", "logo");
        
    }
    else if (imageName.match(/\.(jpeg)$/)){
        // console.log("in")
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".jpeg", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = "";
        uploadFile("images/"+req.file.filename+".jpeg" , req.file.filename+".jpeg").catch(console.error);
        
        // uploadFile(filePath, destFileName).catch(console.error);

        quickstart("images/"+req.file.filename+".jpeg", "logo");
        
        
    }
    else if (imageName.match(/\.(png)$/)){
        // console.log("in")
        
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".png", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = "";
        uploadFile("images/"+req.file.filename+".png", req.file.filename+".png").catch(console.error);
        quickstart("images/"+req.file.filename+".png", "logo");
        
    }
    else{
        res.send("Image Recieved but unknown format\n");    
    }
    setTimeout(() => {
        res.send(asyncres+'\n');    
    }, 4000);
    
    
});


app.post("/faceDetect", upload.single('image'), function (req, res){
    const imageName = req.file.originalname;

    console.log(req.file.filename);
    if (imageName.match(/\.(jpg)$/)){
        //  console.log("in")
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".jpg", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = ""
        console.log("images/"+req.file.filename+".jpg");
        uploadFile("images/"+req.file.filename+".jpg", req.file.filename+".jpg").catch(console.error);
        quickstart("images/"+req.file.filename+".jpg", "face");
        
    }
    else if (imageName.match(/\.(jpeg)$/)){
        // console.log("in")
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".jpeg", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = ""
        uploadFile("images/"+req.file.filename+".jpeg",req.file.filename+".jpeg" ).catch(console.error);
        
        quickstart("images/"+req.file.filename+".jpeg", "face");
        
        
    }
    else if (imageName.match(/\.(png)$/)){
        // console.log("in")
        
        fs.rename("images/"+req.file.filename, "images/"+req.file.filename+".png", function(err) {
            if ( err ) console.log('ERROR: ' + err);
        });

        asyncres = "";
        uploadFile("images/"+req.file.filename+".png", req.file.filename+".png").catch(console.error);
        
        quickstart("images/"+req.file.filename+".png", "face");
        
    }
    else{
        res.send("Image Recieved but unknown format\n");    
    }
    setTimeout(() => {
        res.send(asyncres+'\n');    
    }, 4000);
    
});

app.listen(3000, function(){
    console.log("server is up");
});
