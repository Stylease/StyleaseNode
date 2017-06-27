/**
 * Plan.js
 *
 * @description :: TODO: You might write a short summary of how this model works and what it represents here.
 * @docs        :: http://sailsjs.org/documentation/concepts/models-and-orm/models
 */

var mongoose = require('mongoose');
var Grid = require('gridfs-stream');
var fs = require("fs");
var lwip = require("lwip");
var process = require('child_process');
var lodash = require('lodash');
var moment = require('moment');
var MaxImageSize = 1200;
var request = require("request");
// var requrl = "http://localhost:81/";
var json2xls = require('json2xls');
var xlsx = require('node-xlsx').default;
var http = require('http');


var requrl = "http://admin.thestylease.com/";
var gfs = Grid(mongoose.connections[0].db, mongoose);
gfs.mongo = mongoose.mongo;

module.exports = {
    GlobalCallback: function (err, data, res) {
        if (err) {
            res.json({
                error: err,
                value: false
            });
        } else {
            res.json({
                data: data,
                value: true
            });
        }
    },

    generateExcel: function (name, found, res) {
        name = _.kebabCase(name);
        var excelData = [];
        _.each(found, function (singleData) {
            var singleExcel = {};
            _.each(singleData, function (n, key) {
                if (key != "__v" && key != "createdAt" && key != "updatedAt") {
                    // singleExcel[_.capitalize(key)] = n;
                    // console.log("in excel", n);
                    singleExcel[key] = n;
                }
            });
            excelData.push(singleExcel);
        });
        var xls = json2xls(excelData);
        var folder = "././.tmp/";
        var path = name + "-" + moment().format("MMM-DD-YYYY-hh-mm-ss-a") + ".xlsx";
        var finalPath = folder + path;
        fs.writeFile(finalPath, xls, 'binary', function (err) {
            if (err) {
                res.callback(err, null);
            } else {
                fs.readFile(finalPath, function (err, excel) {
                    if (err) {
                        res.callback(err, null);
                    } else {
                        res.set('Content-Type', "application/octet-stream");
                        res.set('Content-Disposition', "attachment;filename=" + path);
                        res.send(excel);
                        fs.unlink(finalPath);
                    }
                });
            }
        });

    },

    import: function (name) {
        var jsonExcel = xlsx.parse(name);
        var retVal = [];
        console.log("jsonExcel", jsonExcel);
        var firstRow = _.slice(jsonExcel[0].data, 0, 1)[0];
        var excelDataToExport = _.slice(jsonExcel[0].data, 1);
        var dataObj = [];
        _.each(excelDataToExport, function (val, key) {
            dataObj.push({});
            _.each(val, function (value, key2) {
                dataObj[key][firstRow[key2]] = value;
            });
        });
        return dataObj;
    },

    importExcel: function (name) {
        console.log("name", name);
        var jsonExcel = xlsx.parse(name);
        console.log(":jsonExcel", jsonExcel);
        var retVal = [];
        var firstRow = _.slice(jsonExcel[0].data, 0, 1)[0];
        var excelDataToExport = _.slice(jsonExcel[0].data, 1);
        var dataObj = [];
        _.each(excelDataToExport, function (val, key) {
            dataObj.push({});
            _.each(val, function (value, key2) {
                dataObj[key][firstRow[key2]] = value;
            });
        });
        return dataObj;
    },


    importGS: function (filename, callback) {
        var readstream = gfs.createReadStream({
            filename: filename
        });
        readstream.on('error', function (err) {
            // res.json({
            //     value: false,
            //     error: err
            // });
        });
        var buffers = [];
        console.log("buffers", buffers);
        readstream.on('data', function (buffer) {
            buffers.push(buffer);
        });
        readstream.on('end', function () {
            var buffer = Buffer.concat(buffers);
            console.log("buffer", buffer);
            callback(null, Config.import(buffer));
        });
    },


    uploadFile: function (filename, callback) {
        // console.log("filename in config", filename);
        var id = mongoose.Types.ObjectId();
        var extension = filename.split(".").pop();
        extension = extension.toLowerCase();
        if (extension == "jpeg") {
            extension = "jpg";
        }

        var newFilename = id + "." + extension;
        var writestream = gfs.createWriteStream({
            filename: newFilename
        });
        var imageStream = fs.createReadStream(filename);

        function writer2(metaValue) {
            var writestream2 = gfs.createWriteStream({
                filename: newFilename,
                metadata: metaValue
            });
            writestream2.on('finish', function () {
                callback(null, {
                    name: newFilename
                });
                fs.unlink(filename);
            });
            fs.createReadStream(filename).pipe(writestream2);
        }

        if (extension == "png" || extension == "jpg" || extension == "gif") {
            lwip.open(filename, extension, function (err, image) {
                var upImage = {
                    width: image.width(),
                    height: image.height(),
                    ratio: image.width() / image.height()
                };

                if (upImage.width > upImage.height) {
                    if (upImage.width > MaxImageSize) {
                        image.resize(MaxImageSize, MaxImageSize / (upImage.width / upImage.height), function (err, image2) {
                            upImage = {
                                width: image2.width(),
                                height: image2.height(),
                                ratio: image2.width() / image2.height()
                            };
                            image2.writeFile(filename, function (err) {
                                writer2(upImage);
                            });
                        });
                    } else {
                        writer2(upImage);
                    }
                } else {
                    if (upImage.height > MaxImageSize) {
                        image.resize((upImage.width / upImage.height) * MaxImageSize, MaxImageSize, function (err, image2) {
                            upImage = {
                                width: image2.width(),
                                height: image2.height(),
                                ratio: image2.width() / image2.height()
                            };
                            image2.writeFile(filename, function (err) {
                                writer2(upImage);
                            });
                        });
                    } else {
                        writer2(upImage);
                    }
                }
            });
        } else {
            imageStream.pipe(writestream);
        }

        writestream.on('finish', function () {
            callback(null, {
                name: newFilename
            });
            fs.unlink(filename);
        });
    },


    uploadAllFile: function (filedata, filename, callback) {
        console.log("filedata", filedata);

        console.log("filename", filename);
        var id = mongoose.Types.ObjectId();
        var extension = filename.split(".").pop();
        extension = extension.toLowerCase();
        if (extension == "jpeg") {
            extension = "jpg";
        }
        var newFilename = filedata;
        var writestream = gfs.createWriteStream({
            filename: newFilename
        });
        var imageStream = fs.createReadStream(filename);

        function writer2(metaValue) {
            var writestream2 = gfs.createWriteStream({
                filename: newFilename,
                metadata: metaValue
            });
            writestream2.on('finish', function () {
                callback(null, {
                    name: newFilename
                });
                fs.unlink(filename);
            });
            fs.createReadStream(filename).pipe(writestream2);
        }

        if (extension == "png" || extension == "jpg" || extension == "gif") {
            lwip.open(filename, extension, function (err, image) {
                var upImage = {
                    width: image.width(),
                    height: image.height(),
                    ratio: image.width() / image.height()
                };

                if (upImage.width > upImage.height) {
                    if (upImage.width > MaxImageSize) {
                        image.resize(MaxImageSize, MaxImageSize / (upImage.width / upImage.height), function (err, image2) {
                            upImage = {
                                width: image2.width(),
                                height: image2.height(),
                                ratio: image2.width() / image2.height()
                            };
                            image2.writeFile(filename, function (err) {
                                writer2(upImage);
                            });
                        });
                    } else {
                        writer2(upImage);
                    }
                } else {
                    if (upImage.height > MaxImageSize) {
                        image.resize((upImage.width / upImage.height) * MaxImageSize, MaxImageSize, function (err, image2) {
                            upImage = {
                                width: image2.width(),
                                height: image2.height(),
                                ratio: image2.width() / image2.height()
                            };
                            image2.writeFile(filename, function (err) {
                                writer2(upImage);
                            });
                        });
                    } else {
                        writer2(upImage);
                    }
                }
            });
        } else {
            imageStream.pipe(writestream);
        }

        writestream.on('finish', function () {
            callback(null, {
                name: newFilename
            });
            fs.unlink(filename);
        });
    },
    email: function (data, callback) {
        console.log("######################### email data ##########################",data);
        Password.find().exec(function (err, userdata) {
            if (err) {
                console.log(err);
                callback(err, null);
            } else if (userdata && userdata.length > 0) {
                if (data.filename && data.filename !== "") {
                    request.post({
                        url: requrl + "config/emailReader/",
                        json: data
                    }, function (err, http, body) {
                        // console.log("######################### err, http, body ##########################",err, http, body);
                        console.log("######################### body ##########################",body);
                        if (err) {
                            console.log(err);
                            callback(err, null);
                        } else {
                            if (body && body.value !== false) {
                                var sendgrid = require("sendgrid")(userdata[0].name);
                                sendgrid.send({
                                    to: data.email,
                                    from: data.fromname,
                                    subject: data.subject,
                                    fromname: 'TheStylease.com',
                                    html: body
                                }, function (err, json) {
                                    if (err) {
                                        callback(err, null);
                                    } else {
                                        callback(null, json);
                                    }
                                });
                            } else {
                                callback({
                                    message: "Email Not Sent"
                                }, null);
                            }
                        }
                    });
                } else {
                    callback({
                        message: "Please provide params"
                    }, null);
                }
            } else {
                callback({
                    message: "No api keys found"
                }, null);
            }
        });
    },
    readUploaded: function (filename, width, height, style, res) {
        var readstream = gfs.createReadStream({
            filename: filename
        });
        readstream.on('error', function (err) {
            res.json({
                value: false,
                error: err
            });
        });

        function writer2(filename, gridFSFilename, metaValue) {
            var writestream2 = gfs.createWriteStream({
                filename: gridFSFilename,
                metadata: metaValue
            });
            writestream2.on('finish', function () {
                fs.unlink(filename);
            });
            fs.createReadStream(filename).pipe(res);
            fs.createReadStream(filename).pipe(writestream2);
        }

        function read2(filename2) {
            var readstream2 = gfs.createReadStream({
                filename: filename2
            });
            readstream2.on('error', function (err) {
                res.json({
                    value: false,
                    error: err
                });
            });
            readstream2.pipe(res);
        }
        var onlyName = filename.split(".")[0];
        var extension = filename.split(".").pop();
        if ((extension == "jpg" || extension == "png" || extension == "gif") && ((width && width > 0) || (height && height > 0))) {
            //attempt to get same size image and serve
            var newName = onlyName;
            if (width > 0) {
                newName += "-" + width;
            } else {
                newName += "-" + 0;
            }
            if (height) {
                newName += "-" + height;
            } else {
                newName += "-" + 0;
            }
            if (style && (style == "fill" || style == "cover")) {
                newName += "-" + style;
            } else {
                newName += "-" + 0;
            }
            var newNameExtire = newName + "." + extension;
            gfs.exist({
                filename: newNameExtire
            }, function (err, found) {
                if (err) {
                    res.json({
                        value: false,
                        error: err
                    });
                }
                if (found) {
                    read2(newNameExtire);
                } else {
                    var imageStream = fs.createWriteStream('./.tmp/uploads/' + filename);
                    readstream.pipe(imageStream);
                    imageStream.on("finish", function () {
                        lwip.open('./.tmp/uploads/' + filename, function (err, image) {
                            ImageWidth = image.width();
                            ImageHeight = image.height();
                            var newWidth = 0;
                            var newHeight = 0;
                            var pRatio = width / height;
                            var iRatio = ImageWidth / ImageHeight;
                            if (width && height) {
                                newWidth = width;
                                newHeight = height;
                                switch (style) {
                                    case "fill":
                                        if (pRatio > iRatio) {
                                            newHeight = height;
                                            newWidth = height * (ImageWidth / ImageHeight);
                                        } else {
                                            newWidth = width;
                                            newHeight = width / (ImageWidth / ImageHeight);
                                        }
                                        break;
                                    case "cover":
                                        if (pRatio < iRatio) {
                                            newHeight = height;
                                            newWidth = height * (ImageWidth / ImageHeight);
                                        } else {
                                            newWidth = width;
                                            newHeight = width / (ImageWidth / ImageHeight);
                                        }
                                        break;
                                }
                            } else if (width) {
                                newWidth = width;
                                newHeight = width / (ImageWidth / ImageHeight);
                            } else if (height) {
                                newWidth = height * (ImageWidth / ImageHeight);
                                newHeight = height;
                            }
                            image.resize(parseInt(newWidth), parseInt(newHeight), function (err, image2) {
                                image2.writeFile('./.tmp/uploads/' + filename, function (err) {
                                    writer2('./.tmp/uploads/' + filename, newNameExtire, {
                                        width: newWidth,
                                        height: newHeight
                                    });
                                });
                            });
                        });
                    });
                }
            });
            //else create a resized image and serve
        } else {
            readstream.pipe(res);
        }
        //error handling, e.g. file does not exist
    },
    sendSMS: function (data, callback) {
        if (data.mobile) {
            request.get({
                url: "http://api-alerts.solutionsinfini.com/v3/?method=sms&api_key=A84a4330cf45bb62e40d45a6b5304f1c2&to=" + data.mobile + "&sender=Stylse&message=" + data.content + "&format=json"
            }, function (err, http, body) {
                if (err) {
                    console.log(err);
                    callback(err, null);
                } else {
                    // console.log(body);
                    callback(null, {
                        message: "SMS Sent"
                    });
                }
            });
        } else {
            callback({
                message: "Mobile number not found"
            }, null);
        }
    },

    downloadFromUrl: function (url, callback) {
        var dest = "./.tmp/" + moment().valueOf() + "-" + _.last(url.split("/"));
        var file = fs.createWriteStream(dest);
        var request = http.get(url, function (response) {
            response.pipe(file);
            file.on('finish', function () {
                Config.uploadFile(dest, callback);
            });
        }).on('error', function (err) {
            fs.unlink(dest);
            callback(err);
        });
    },

    saveXmlData: function (url, callback) {
        // var baseUrl = "http://www.thestylease.com/";
        // var obj = "\n <url> \n" + "<loc> \n" + baseUrl + url + " \n" + "</loc> \n" + "<changefreq>" + "monthly" + "</changefreq> \n" + "<priority>" + "1.0" + "</priority> \n" + "</url>\n" + "";
        // var body = fs.readFileSync('sitemap.xml').toString();
        // body = _.replace(body, new RegExp("</urlset>", "g"), "");
        // // "/var/www/html/newsite/testing/production/sitemap.xml"
        // fs.writeFileSync("sitemap.xml", body);
        // fs.appendFile(
        //     "sitemap.xml",
        //     obj,
        //     function (error) {
        //         if (error) {
        //             callback(error);
        //         } else {
        //             callback(null, "File Updated");
        //         }
        //     }
        // );
    },
    writeSiteMap: function (body) {
        body.replace(new RegExp("</urlset>", "g"), "");
        var body1 = body + " \n </urlset>";
        // fs.writeFileSync("sitemap2.xml", body);
        fs.writeFileSync("/var/www/html/newsite/testing/production/sitemap.xml", body1);
    },

    getOldSitemap: function (url, callback) {
        var body = fs.readFileSync('sitemap.xml').toString();
        body.replace(new RegExp("</urlset>", "g"), "");
        return body;
    },

    getUrlXml: function (url, callback) {
        var baseUrl = "http://www.thestylease.com/";
        var obj = "\n <url> \n" + "<loc> \n" + baseUrl + url + " \n" + "</loc> \n" + "<changefreq>" + "monthly" + "</changefreq> \n" + "<priority>" + "1.0" + "</priority> \n" + "</url>\n" + "";
        return obj;
    },
};