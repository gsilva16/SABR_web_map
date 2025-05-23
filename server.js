const express = require('express');
const fileUpload = require('express-fileupload');
const {spawn} = require('child_process');
const router = express.Router();
const zip = require('express-zip');
const path = require('path');
const app = express();
const port = 8000;
const PROCESSEDFILEPATH = '.\\processed_files\\';
// let fileNameWithoutExt;
app.use(express.static('public'));
console.log(__dirname);
app.get('/',(req, res)=>{
    res.status(200).send()
});

app.get('/single', (req,res)=>{

    res.download(PROCESSEDFILEPATH+fileNameWithoutExt+'_processed.zip',(err)=>{
        if(err){
            console.log(err);
        }
    });
    const python = spawn('python',['.\\scripts\\delete_downloaded_file.py',PROCESSEDFILEPATH+fileNameWithoutExt+'_processed.zip']);
    python.stdout.on('data', function (data) {
        console.log(`Pipe data from python script ${data}`);
        dataToSend = data.toString();
        processedShapefileName = data.toString();
        console.log(dataToSend);
       });
    python.on('close',(code)=>{
        console.log(`child process close all stdio with code ${code}`);
        res.send(dataToSend);
    });
});

app.post('/upload',fileUpload({createParentPath: true}), (req, res)=>{
    const files = req.files;
    // console.log('uploaded ',files);

    Object.keys(files).forEach(key =>{
        const filepath = path.join(__dirname,'files',files[key].name);
        files[key].mv(filepath,(err)=>{
            if (err) return res.status(500).json({status:"error",message:err});
        });

        let fileNameWithExt = files[key].name;
        fileNameWithoutExt = fileNameWithExt.replace(/\.[^/.]+$/, "");
        console.log('fileNameWithExt ',fileNameWithExt);
        console.log('filenamewithoutext ',fileNameWithoutExt);
        console.log(filepath);
        const python = spawn('python',['.\\scripts\\processShapefile.py',fileNameWithExt,filepath,fileNameWithoutExt]);
        python.stdout.on('data', function (data) {
            console.log(`Pipe data from python script ${data}`);
            dataToSend = data.toString();
            processedShapefileName = data.toString();
            console.log(dataToSend);
           });
        python.on('close',(code)=>{
            console.log(`process shapefile close with code ${code}`);
            // res.send(dataToSend);
            return res.json({status:'success',message:Object.keys(files).toString(),processed_file:fileNameWithoutExt});
        });
    });
    
});
app.listen(port,()=> console.log(`Server has started on port: ${port}`));