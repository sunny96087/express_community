// routes/announcements.js

const express = require("express");
const router = express.Router();
const announcementController = require("../controllers/announcementController");
const { isAuth } = require("../utils/auth");
const handleErrorAsync = require("../utils/handleErrorAsync");

// 新增公告
router.post(
  "/",
  isAuth,
  handleErrorAsync(announcementController.createAnnouncement)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '後台管理員 - 新增公告' 

    #swagger.parameters['announcement'] = {
      in: 'body',
      required: true,
      schema: {
        title: {
            type: 'string',
            description: '公告標題',
            required: true
        },
        content: {
            type: 'string',
            description: '公告內容',
            required: true
        },
        status: {
            type: 'number',
            description: '公告狀態 ( 0: 未公告 1: 已公告 )',
            default: 0
        },
        tag: {
            type: 'string',
            description: '公告標籤 ( 公告、功能、其他 )',
            default: '公告'
        }
      }
    }
  */
);

// 後台管理員取回所有公告
router.get(
  "/admin",
  isAuth,
  handleErrorAsync(announcementController.getAllAnnouncementsForAdmin)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '後台管理員 - 取得所有公告' 

    #swagger.parameters['status'] = { in: 'query', description: '公告狀態 ( 0: 未公告 1: 已公告 )', type: 'Number' }
    #swagger.parameters['tag'] = { in: 'query', description: '公告標籤 ( 公告、功能、其他 )', type: 'string' }
    #swagger.parameters['keyword'] = { in: 'query', description: '關鍵字，用於公告標題和公告內容的模糊搜索', type: 'string' }
    #swagger.parameters['startDate'] = { in: 'query', description: '開始日期，用於篩選公告的起始時間', type: 'Date' }
    #swagger.parameters['endDate'] = { in: 'query', description: '結束日期，用於篩選公告的結束時間', type: 'Date' }
  */
);

// 編輯公告
router.put(
  "/update/:id",
  isAuth,
  handleErrorAsync(announcementController.editAnnouncement)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '後台管理員 - 編輯公告' 

    #swagger.parameters['announcement'] = {
      in: 'body',
      required: true,
      schema: {
        title: {
            type: 'string',
            description: '公告標題',
            required: true
        },
        content: {
            type: 'string',
            description: '公告內容',
            required: true
        },
        status: {
            type: 'number',
            description: '公告狀態 ( 0: 未公告 1: 已公告 )',
            default: 0
        },
        tag: {
            type: 'string',
            description: '公告標籤 ( 公告、功能、其他 )',
            default: '公告'
        }
      }
    }
  */
);

// 刪除公告
router.delete(
  "/delete/:id",
  isAuth,
  handleErrorAsync(announcementController.deleteAnnouncement)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '後台管理員 - 刪除公告' 
  */
);

// 前台使用者取回所有公告
router.get(
  "/all",
  handleErrorAsync(announcementController.getAllAnnouncementsForUser)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '前台使用者 - 取得所有公告' 

    #swagger.parameters['sort'] = { in: 'query', description: '排序方式：預設最新, oldest（最舊）', type: 'string' }
    #swagger.parameters['keyword'] = { in: 'query', description: '關鍵字，用於公告標題和公告內容的模糊搜索', type: 'string' }
    #swagger.parameters['tag'] = { in: 'query', description: '公告標籤 ( 公告、功能、其他 )', type: 'string' }
  */
);

// 前台增加公告瀏覽次數
router.put(
  "/views/:id",
  handleErrorAsync(announcementController.increaseAnnouncementViews)
  /* 	
    #swagger.tags = ['Announcements']
    #swagger.description = '前台自動計算 - 增加公告瀏覽次數' 
  */
);

module.exports = router;
