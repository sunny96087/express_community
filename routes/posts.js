const express = require('express');
const router = express.Router();
const headers = require('../utils/headers');
const handleError = require('../utils/handleError');
const handleSuccess = require('../utils/handleSuccess');
const Post = require('../models/post');

router.get('', async (req, res) => {
    try {
        const post = await Post.find();
        handleSuccess(res, post, '取得所有資料成功');
    } catch (err) {
        handleError(res, err);
    }
});

router.post('', async (req, res) => {
    try {
        const data = req.body;
        if (data.content) {
            const newPost = await Post.create({
                name: data.name,
                content: data.content,
            });
            handleSuccess(res, newPost, '新增單筆資料成功');
        } else {
            handleError(res);
        }
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('', async (req, res) => {
    try {
        const data = await Post.deleteMany({});
        handleSuccess(res, [], '刪除全部資料成功');
    } catch (err) {
        handleError(res, err);
    }
});

router.delete('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        await Post.findByIdAndDelete(id);
        handleSuccess(res, null, '刪除單筆資料成功');
    } catch (err) {
        handleError(res, err);
    }
});

router.patch('/:id', async (req, res) => {
    try {
        const id = req.params.id;
        const data = req.body;

        const updatedPost = await Post.findByIdAndUpdate(
            id,
            {
                name: data.name,
                content: data.content
            },
            { new: true }
        );

        if (updatedPost) {
            handleSuccess(res, updatedPost, '更新單筆資料成功');
        } else {
            handleError(res);
        }
    } catch (err) {
        handleError(res, err);
    }
});

module.exports = router;
