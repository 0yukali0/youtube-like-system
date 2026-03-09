import {Storage} from "@google-cloud/storage";
import fs from "fs";
import ffmpeg from "fluent-ffmpeg";
import { resolve } from "dns";
import { rejects } from "assert/strict";
import { fileURLToPath } from "url";
import { DownloadResponse } from "@google-cloud/storage";

const storage = new Storage()

const rawVideoBucketName = "yt-raw-videos";
const processedVideoBucketName = "yt-processed-videos";

const localRawVideoPath = "./raw-videos";
const localProcessedVideoPath = "./processed-videos";

export function setupDirectories() {
    encsureDirectoryExistence(localRawVideoPath);
    encsureDirectoryExistence(localProcessedVideoPath);
}

/*
* Create directories for processed, raw videos.
* @param {string} dirPath: the directory path to check
*/
function encsureDirectoryExistence(dirPath: string) {
    if (fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true})
    }

    console.log('Directory created at ${dirPath}')
}

/**
 * @param rawVideoName - The name of the file to convert from {@link localRawVideoPath}.
 * @param processedVideoName - The name of the file to convert to {@link localProcessedVideoPath}.
 * @returns A promise that resolves when the video has been converted.
 */
export function convertVideo(rawVedioName: string, preocessedVideoName: string) {
    return new Promise<void>((resolve, reject) => {
        ffmpeg(`${rawVideoBucketName}/${rawVedioName}`)
        .outputOptions("-vf", "scale=-1:360")
        .on('end', function() {
            console.log('Processing finished sucessfully');
            resolve()
        })
        .on('error', function (err: any) {
            console.log("An error occured" + err.message);
            reject(err)
        })
        .save(`${localProcessedVideoPath}/${preocessedVideoName}`);
    });
}

/**
 * @param fileName - The name of the file to download from the 
 * {@link rawVideoBucketName} bucket into the {@link localRawVideoPath} folder.
 * @returns A promise that resolves when the file has been downloaded.
 */
export async function downloadRawVideo(fileName: string) {
    await storage.bucket(rawVideoBucketName)
        .file(fileName)
        .download({
            destination: `${localRawVideoPath}/${fileName}`,
        });
    console.log(`gs://${rawVideoBucketName}/${fileName} downloaded to ${localRawVideoPath}/${fileName}`)
}

/**
 * @param fileName - The name of the file to upload from the 
 * {@link localProcessedVideoPath} folder into the {@link processedVideoBucketName}.
 * @returns A promise that resolves when the file has been uploaded.
 */
export async function uploadProcessedVideo(fileName: string) {
    const bucket = storage.bucket(processedVideoBucketName);
    await storage.bucket(processedVideoBucketName)
    .upload(`${localProcessedVideoPath}/${fileName}`, {destination: fileName})
    console.log(`${localProcessedVideoPath}/${fileName} uploaded to gs://${processedVideoBucketName}/${fileName}`)
    await bucket.file(fileName).makePublic();
}

/*
* @param fileName: the name of the file to delete from {@link localRawVideoPath} folder
* @returns A promise that resloves when the  file has been deleted.
*/
export function deleteRawVideo(fileName: string): Promise<void> {
    return deleteFile(`${localRawVideoPath}/${fileName}`);
}

/*
* @param fileName: the name of the file to delete from {@link localProcessedVideoPath} folder
* @returns A promise that resolves when the file has been deleted
*/
export function deleteProcessedVideo(fileName: string): Promise<void> {
    return deleteFile(`${localProcessedVideoPath}/${fileName}`);
}

/*
* @param filePath: the path of the file to delete.
* @returns A promise that resolves when the file has been deleted.
*/
function deleteFile(filePath: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {

        } else {
            console.log(`File deleted at ${filePath}`);
            resolve();
        };
    });
}