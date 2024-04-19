const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const tools = require('../utils/tools');
const headers = require('../utils/headers');
const handleError = require('../utils/handleError');
const handleSuccess = require('../utils/handleSuccess');
const Post = require('../models/post');

router.get('', async (req, res) => {
    try {
        const post = await Post.find();
        handleSuccess(res, post, '取得所有資料成功');
    } catch (err) {
        handleError(res, err.message);
    }
});

router.post('', async (req, res) => {
    try {
        const data = req.body;
        if (data) {

            // 定義及檢查欄位內容不得為空
            const fieldsToCheck = ['name', 'content'];
            const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
            if (errorMessage) {
                handleError(res, errorMessage);
                return;
            }

            // 定義及提供的數據是否只包含了允許的欄位
            const allowedFields = ['name', 'content','image','likes'];
            const invalidFieldsError = tools.validateFields(data, allowedFields);
            if (invalidFieldsError) {
                handleError(res, invalidFieldsError);
                return;
            }

            const newPost = await Post.create({
                name: data.name,
                content: data.content,
                image: data.image,
                likes: data.likes
            });
            handleSuccess(res, newPost, '新增單筆資料成功');
        } else {
            handleError(res);
        }
    } catch (err) {
        handleError(res, err.message);
    }
});

router.delete('', async (req, res) => {
    try {
        const data = await Post.deleteMany({});
        handleSuccess(res, [], '刪除全部資料成功');
    } catch (err) {
        handleError(res, err.message);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;

        // 檢查 ID 格式及是否存在
        const isIdExist = await tools.findModelById(Post, id, res);
        if (!isIdExist) {
            // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
            return;
        }

        await Post.findByIdAndDelete(id);
        handleSuccess(res, null, '刪除單筆資料成功');
    } catch (err) {
        handleError(res, err.message);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        let data = req.body;

        // 使用 trimObjectValues 函數來去掉資料中所有值的空格
        data = tools.trimObjectAllValues(data);

        // 檢查 ID 格式及是否存在
        const isIdExist = await tools.findModelById(Post, id, res);
        if (!isIdExist) {
            // 如果 isIdExist 為 null，則已經處理過錯誤，直接返回
            return;
        }

        // 使用 hasDataChanged 函數來檢查資料是否有改變
        const oldData = await Post.findById(id);
        if (!tools.hasDataChanged(oldData, data)) {
        handleError(res, '資料未變更');
        return;
        }

        // 定義及檢查欄位內容不得為空
        const fieldsToCheck = ['name', 'content'];
        const errorMessage = tools.checkFieldsNotEmpty(data, fieldsToCheck);
        if (errorMessage) {
            handleError(res, errorMessage);
            return;
        }
        
        // 定義及提供的數據是否只包含了允許的欄位
        const allowedFields = ['name', 'content','image','likes'];
        const invalidFieldsError = tools.validateFields(data, allowedFields);
        if (invalidFieldsError) {
            handleError(res, invalidFieldsError);
            return;
        }

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                name: data.name,
                content: data.content,
                image: data.image,
                likes: data.likes
            },
            { new: true } // 返回更新後的 updatedPost
        );

        if (updatedPost) {
            handleSuccess(res, updatedPost, '更新單筆資料成功');
        } else {
            handleError(res);
        }
    } catch (err) {
        handleError(res, err.message);
    }
});

module.exports = router;
