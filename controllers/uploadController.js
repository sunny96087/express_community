// controllers / uploadController.js

const express = require("express");
const firebaseAdmin = require("../connection/firebase");
const { v4: uuidv4 } = require("uuid");
const appError = require("../utils/appError");
const handleSuccess = require("../utils/handleSuccess");

const bucket = firebaseAdmin.storage().bucket();

const tinify = require("tinify");
tinify.key = process.env.TINYPNG_API_KEY;

const uploadController = {
// 上傳圖片
  uploadImage: async function (req, res, next) {
    const file = req.file;

    if (!file || file === '') {
      return next(appError(400, "請上傳圖片"));
    }

    // 上傳圖片到 TinyPNG 並壓縮
    const resultData = await new Promise((resolve, reject) => {
      tinify.fromBuffer(file.buffer).toBuffer(function (err, resultData) {
        if (err) reject(err);
        resolve(resultData);
      });
    });

    // 上傳檔案的地方:
    // 1. 加資料夾名稱 bucket.file(`image/${file.originalname}`)
    // 2. 直接存在最外層 bucket.file(file.originalname)
    // 3. 使用 UUID 產生檔案名稱
    const blob = bucket.file(
      `images/${uuidv4()}.${file.originalname.split(".").pop()}`
    );
    const blobStream = blob.createWriteStream();

    blobStream.on("finish", async () => {
      // 設定檔案的存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", // 必填！ 網址的有效期限
      };

      // 取得檔案的網址
      const imgUrl = await new Promise((resolve, reject) => {
        blob.getSignedUrl(config, (err, imgUrl) => {
          if (err) reject(err);
          resolve(imgUrl);
        });
      });

      let data = {
        imgUrl,
      };
      handleSuccess(res, data, "上傳成功 回傳圖片網址");
      // res.send({
      //   imgUrl,
      // });
    });

    blobStream.on("error", (err) => {
      //    res.status(500).send("上傳失敗");
      return next(appError(500, "上傳失敗，系統錯誤！"));
    });

    blobStream.end(resultData);
  },

  // 上傳圖片 -> 要登入才能用的版本
  uploadUserImage: async function (req, res, next) {
    const file = req.file;

    if (!file || file === '') {
      return next(appError(400, "請上傳圖片"));
    }

    // 上傳圖片到 TinyPNG 並壓縮
    const resultData = await new Promise((resolve, reject) => {
      tinify.fromBuffer(file.buffer).toBuffer(function (err, resultData) {
        if (err) reject(err);
        resolve(resultData);
      });
    });

    // 上傳檔案的地方:
    // 1. 加資料夾名稱 bucket.file(`image/${file.originalname}`)
    // 2. 直接存在最外層 bucket.file(file.originalname)
    // 3. 使用 UUID 產生檔案名稱
    const blob = bucket.file(
      `images/${uuidv4()}.${file.originalname.split(".").pop()}`
    );
    const blobStream = blob.createWriteStream();

    blobStream.on("finish", async () => {
      // 設定檔案的存取權限
      const config = {
        action: "read", // 權限
        expires: "12-31-2500", // 必填！ 網址的有效期限
      };

      // 取得檔案的網址
      const imgUrl = await new Promise((resolve, reject) => {
        blob.getSignedUrl(config, (err, imgUrl) => {
          if (err) reject(err);
          resolve(imgUrl);
        });
      });

      let data = {
        imgUrl,
      };
      handleSuccess(res, data, "上傳成功 回傳圖片網址");
      // res.send({
      //   imgUrl,
      // });
    });

    blobStream.on("error", (err) => {
      //    res.status(500).send("上傳失敗");
      return next(appError(500, "上傳失敗，系統錯誤！"));
    });

    blobStream.end(resultData);
  },

  // 刪除圖片
  deleteImage: async function (req, res, next) {
    // 取得檔案名稱 => ?fileName=test.jpeg 如果有資料夾名稱也要一起
    const fileName = req.query.fileName;
    // 取得檔案
    const blob = bucket.file(fileName);
    // 刪除檔案
    await blob.delete();
    // 刪除成功
    handleSuccess(res, null, "刪除成功");
    // res.send("刪除成功");
  },

// 獲取所有圖片列表
  getImages: async (req, res, next) => {
    // 取得檔案列表
    const [files] = await bucket.getFiles();
    const fileList = [];
    for (const file of files) {
      // 取得檔案的簽署 URL
      const fileUrl = await file.getSignedUrl({
        action: "read",
        expires: "03-09-2491",
      });
      fileList.push({
        fileName: file.name,
        imgUrl: fileUrl,
      });
    }
    handleSuccess(res, fileList, "取得所有圖片列表成功");
  },
};

module.exports = uploadController;
