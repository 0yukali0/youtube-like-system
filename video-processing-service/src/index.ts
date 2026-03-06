import express from "express";
import ffmpeg from "fluent-ffmpeg";

const app = express();
app.use(express.json());
const port = process.env.PORT || 3000;

app.post("/process-video", (req, res) => {
    const inputFilePath = req.body.inputFilePath;
    const outputFilePath = req.body.outputFilePath;
    if (!inputFilePath || !outputFilePath ) {
        return res.status(400).send('Bad Request: Missing file path');
    }
    ffmpeg(inputFilePath)
        .outputOptions('-vf', 'scale=-2:360')
        .on('end', function() {
            console.log('Processing finished sucessfully');
            res.status(200).send('Processing finished successfully');
        })
        .on('error', function(err: any) {
            console.log('An error occurred:' + err.message);
            res.status(500).send('An error occurred:' + err.message);
        })
        .save(outputFilePath);
});

app.listen(port, function() {
    console.log(`Video processing service is listening at http:localhost:${port}`);
});