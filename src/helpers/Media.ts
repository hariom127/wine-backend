// "use strict";

// const fs = require('fs');
// const request = require('request');
// const sharp = require('sharp');




// const isFileTypePdf = (mimeType: string) => {
//     var doc_type_mimeTypes = ['application/pdf'];
//     return doc_type_mimeTypes.includes(mimeType);
// };

// //============================================================

// // var exportFuns = {};

// // //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// // exportFuns.downloadMediaByUrl = (mediaUrl, fileDestPath, callback) => {

// //     request(mediaUrl).pipe(fs.createWriteStream(fileDestPath))
// //         .on('close', function () {
// //             //console.log("saving process is done!");
// //         });
// // };

// // exportFuns.getMediaTypeByExtension = (extension) => {

// //     extension = extension.toLowerCase();
// //     var image_type_extensions = ['jpeg', 'jpg', 'png', 'gif'];
// //     var video_type_extensions = ['mp4', '3gp', 'wmv', 'webm', 'flv'];
// //     var doc_type_extensions = ['doc', 'docx', 'odt', 'pdf'];
// //     var audio_type_extensions = ['mp3', 'wma'];

// //     if (image_type_extensions.includes(extension)) {
// //         var type = 'image';
// //     } else if (video_type_extensions.includes(extension)) {
// //         var type = 'video';
// //     } else if (doc_type_extensions.includes(extension)) {
// //         var type = 'document';
// //     } else if (audio_type_extensions.includes(extension)) {
// //         var type = 'audio';
// //     } else {
// //         var type = '';
// //     }
// //     return type;
// // };

// // exportFuns.getMediaTypeByMimeType = (mimeType) => {

// //     var image_type_mimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
// //     var video_type_mimeTypes = ['video/mp4', 'video/3gp', 'video/wmv', 'video/webm', 'video/flv'];
// //     var doc_type_mimeTypes = ['application/doc', 'application/docx', 'application/odt', 'application/pdf', 'application/xlsx'];
// //     var audio_type_mimeTypes = ['audio/mp3', 'audio/wma'];

// //     if (image_type_mimeTypes.includes(mimeType)) {
// //         var type = 'image';
// //     } else if (video_type_mimeTypes.includes(mimeType)) {
// //         var type = 'video';
// //     } else if (doc_type_mimeTypes.includes(mimeType)) {
// //         var type = 'document';
// //     } else if (audio_type_mimeTypes.includes(mimeType)) {
// //         var type = 'audio';
// //     } else {
// //         var type = '';
// //     }
// //     return type;
// // };

// // exportFuns.isFileTypeImage = (mimeType) => {
// //     var image_type_mimeTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
// //     return image_type_mimeTypes.includes(mimeType);
// // };



// // exportFuns.createDirectory = (path) => {
// //     if (!fs.existsSync(path)) {
// //         fs.mkdirSync(path);
// //     }
// // };

// // exportFuns.deleteFile = (path) => {
// //     if (fs.existsSync(path)) {
// //         fs.unlinkSync(path, function (err) { console.log(err.toString()); });
// //     }
// // };

// // exportFuns.deleteFolderRecursive = (path) => {

// //     if (fs.existsSync(path)) {

// //         fs.readdirSync(path).forEach(function (file, index) {
// //             var curPath = path + "/" + file;
// //             if (fs.lstatSync(curPath).isDirectory()) { // recurse
// //                 deleteFolderRecursive(curPath);
// //             } else { // delete file
// //                 fs.unlinkSync(curPath);
// //             }
// //         });
// //         fs.rmdirSync(path);
// //     }
// // };

// // exportFuns.uploadFile = (fileData, destPath) => {

// //     var fileName = Date.now() + fileData.name.replace(/[^0-9a-z.]/gi, '');
// //     var destFilePath = destPath + "/" + fileName;
// //     var file_data_bitmap = new Buffer.from(fileData.data, 'base64');

// //     fs.writeFileSync(destFilePath, file_data_bitmap, function (err) {
// //         if (err) { throw err; }
// //     });
// //     return fileName;
// // };

// // exportFuns.createThumbnail = (filePath, thumbPath, width = 200, height = 200) => {
// //     sharp(filePath)
// //         .rotate()
// //         .resize(width, height)
// //         .toFile(thumbPath)
// //         .then(data => { })
// //         .catch(err => { console.log(err.toString()) });
// // };

// // //+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++

// // exportFuns.generateXlsxFileByJson = (headerOpts = [], rowsData = [], filePath = "") => {

// //     var writeStream = fs.createWriteStream(filePath, {
// //         flags: "w",
// //         encoding: "utf8",
// //         mode: 0o666,
// //         autoClose: true,
// //         emitClose: true,
// //         start: 0
// //     });

// //     let header = headerOpts.join("\t") + "\n";
// //     writeStream.write(header);

// //     rowsData.forEach(item => {
// //         let row = item.join("\t") + "\n";
// //         writeStream.write(row);
// //     });

// //     writeStream.close();
// // };

// //++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++
// export = { isFileTypePdf };