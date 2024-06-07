const express = require("express");
const router = express.Router();
const { Client, middleware } = require("@line/bot-sdk");
const bodyParser = require("body-parser");
const fs = require("fs");
const path = require("path"); // 引入 path 模塊
const axios = require("axios");
const User = require("../models/user"); // 引入 User 模型
const dotenv = require("dotenv");
dotenv.config({ path: "./config.env" });

const config = {
  channelSecret: process.env.CHANNEL_SECRET,
  channelAccessToken: process.env.CHANNEL_ACCESS_TOKEN,
};

const client = new Client(config);

// router.use(middleware(config));
router.use(bodyParser.json());

const richMenuConfig = {
  size: {
    width: 2500,
    height: 1686,
  },
  selected: false,
  name: "Fixed Menu",
  chatBarText: "點我打開選單",
  areas: [
    {
      bounds: {
        x: 0,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: "postback",
        data: "action=showMenu",
      },
    },
    {
      bounds: {
        x: 834,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: "postback",
        data: "action=showMenu",
      },
    },
    {
      bounds: {
        x: 1667,
        y: 0,
        width: 833,
        height: 843,
      },
      action: {
        type: "postback",
        data: "action=showMenu",
      },
    },
  ],
};

// 創建 Rich Menu 並上傳圖片
let richMenuId;
client
  .createRichMenu(richMenuConfig)
  .then((id) => {
    richMenuId = id;
    console.log(`Rich Menu created with ID: ${richMenuId}`);

    const imagePath = path.join(__dirname, "../public/images/open.jpeg");
    const imageStream = fs.createReadStream(imagePath);

    return client.setRichMenuImage(richMenuId, imageStream, "image/jpeg");
  })
  .then(() => {
    console.log("Rich Menu image uploaded");
  })
  .catch((err) => {
    console.error(`Error creating Rich Menu: ${err}`);
  });

const flexMessage = {
  type: "flex",
  altText: "想詢問關於哪部分的問題呢？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "想詢問關於哪部分的問題呢？",
          size: "xl",
          weight: "bold",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "會員相關",
            data: "會員相關",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "貼文相關",
            data: "貼文相關",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "關於平台",
            data: "關於平台",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "其他",
            data: "其他",
          },
          flex: 1,
        },
      ],
    },
  },
};

const secondLevelMenu1 = {
  type: "flex",
  altText: "想詢問會員相關的什麼問題呢？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "想詢問會員相關的什麼問題呢？",
          size: "xl",
          weight: "bold",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "如何成為會員",
            data: "如何成為會員",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "成為會員可以做什麼",
            data: "成為會員可以做什麼",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "其他",
            data: "其他",
          },
          flex: 1,
        },
      ],
    },
  },
};

const secondLevelMenu2 = {
  type: "flex",
  altText: "想詢問貼文相關的什麼問題呢？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "想詢問貼文相關的什麼問題呢？",
          size: "xl",
          weight: "bold",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "如何新增文章",
            data: "如何新增文章",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "如何修改文章",
            data: "如何修改文章",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "如何刪除文章",
            data: "如何刪除文章",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "其他",
            data: "其他",
          },
          flex: 1,
        },
      ],
    },
  },
};

const secondLevelMenu3 = {
  type: "flex",
  altText: "想詢問關於平台的什麼問題呢？",
  contents: {
    type: "bubble",
    body: {
      type: "box",
      layout: "vertical",
      contents: [
        {
          type: "text",
          text: "想詢問關於平台的什麼問題呢？",
          size: "xl",
          weight: "bold",
        },
        {
          type: "separator",
          margin: "md",
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "平台主要功能",
            data: "平台主要功能",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "平台由來",
            data: "平台由來",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "平台創作者",
            data: "平台創作者",
          },
          flex: 1,
        },
        {
          type: "button",
          action: {
            type: "postback",
            label: "其他",
            data: "其他",
          },
          flex: 1,
        },
      ],
    },
  },
};

router.post("/", (req, res) => {
  // 打印接收到的 webhook 請求
  console.log("Webhook received", req.body);
  // 獲取事件列表
  const events = req.body.events;

  // 遍歷每個事件
  events.forEach((event) => {
    // 如果事件類型是 "follow"
    if (event.type === "follow") {
      // 獲取用戶 ID
      const userId = event.source.userId;
      console.log(`User followed: ${userId}`);

      // 定義歡迎消息
      const welcomeMessage = {
        type: "text",
        text: "您好！歡迎使用 Chat! 社群的智能客服機器人，可以點擊下方選單來詢問問題！",
      };

      // 發送歡迎消息
      client
        .pushMessage(userId, welcomeMessage)
        .then(() => {
          console.log(`Sent welcome message to ${userId}`);
          // 發送第一層選單
          return client.pushMessage(userId, flexMessage);
        })
        .then(() => {
          if (richMenuId) {
            return client.linkRichMenuToUser(userId, richMenuId);
          } else {
            throw new Error("Rich Menu ID is not available");
          }
        })
        .then(() => {
          console.log(`Rich Menu linked to user: ${userId}`);
        })
        .catch((err) => {
          // 處理發送消息時的錯誤
          console.error(`Error sending welcome message: ${err}`);
          res.status(500).send({ error: err.message });
        });
    }
    // 如果事件類型是 "message"
    else if (event.type === "message") {
      // 獲取回覆 token
      const replyToken = event.replyToken;
      // 回覆第一層選單
      client.replyMessage(replyToken, flexMessage).catch((err) => {
        // 處理發送消息時的錯誤
        console.error(`Error sending flex message: ${err}`);
        res.status(500).send({ error: err.message });
      });
    }
    // 如果事件類型是 "postback"
    else if (event.type === "postback") {
      // 獲取 postback data
      const data = event.postback.data;
      let replyMessage;

      if (data === "action=showMenu") {
        const replyToken = event.replyToken;
        client.replyMessage(replyToken, flexMessage).catch((err) => {
          console.error(`Error sending flex message: ${err}`);
          res.status(500).send({ error: err.message });
        });
        return;
      }

      // 根據 postback data 設置回覆消息
      switch (data) {
        case "會員相關":
          replyMessage = secondLevelMenu1;
          break;
        case "貼文相關":
          replyMessage = secondLevelMenu2;
          break;
        case "關於平台":
          replyMessage = secondLevelMenu3;
          break;
        case "如何成為會員":
          replyMessage = {
            type: "text",
            text: "網站右上角註冊按鈕點下去可以進入註冊畫面，填寫基本資料送出後請幫我到信箱收信驗證，驗證完就可以登入平台跟其他使用者互動囉！",
          };
          break;
        case "成為會員可以做什麼":
          replyMessage = {
            type: "text",
            text: "成為會員後可以跟眾多使用者使用文章進行交流及互動，也可以新增文章分享你的生活日常點滴！",
          };
          break;
        case "如何新增文章":
          replyMessage = {
            type: "text",
            text: "選單有個新增貼文，進去後填寫文字就可以送出囉！",
          };
          break;
        case "如何修改文章":
          replyMessage = {
            type: "text",
            text: "目前還沒有修改文章的功能，努力研發中 ><",
          };
          break;
        case "如何刪除文章":
          replyMessage = {
            type: "text",
            text: "目前還沒有刪除文章的功能，努力研發中 ><",
          };
          break;
        case "平台主要功能":
          replyMessage = {
            type: "text",
            text: "平台提供訪客及用戶兩種身份。訪客可以查看所有文章；用戶則可以跟其他用戶使用文章進行交流及互動，也可以新增文章分享你的生活日常點滴！",
          };
          break;
        case "平台由來":
          replyMessage = {
            type: "text",
            text: "平台是開發者在六角學院入門班的作品，有任何建議都歡迎分享給作者歐！",
          };
          break;
        case "平台創作者":
          replyMessage = {
            type: "text",
            text: `平台創作者是我，
我是 2魚，
這是我的作品集 https://simpleportfolio-64b60.web.app/portfolio
歡迎跟我合作✨`,
          };
          break;
        case "其他":
          replyMessage = {
            type: "text",
            text: "其他問題或意見回饋請寄信至 yu13142013@gmail.com",
          };
          break;
        default:
          replyMessage = { type: "text", text: "想詢問關於哪部分的問題呢？" };
      }

      // 獲取回覆 token
      const replyToken = event.replyToken;
      // 回覆消息
      client.replyMessage(replyToken, replyMessage).catch((err) => {
        // 處理回覆消息時的錯誤
        console.error(`Error replying to postback: ${err}`);
      });
    }
  });

  // 回應 200 狀態碼
  res.status(200).end();
});

module.exports = router;
