// cronJobs.js
const cron = require("node-cron");
const User = require("../models/user"); // 根據您的專案結構調整路徑

// 定義定時任務函數
const deleteExpiredAccounts = async () => {
  try {
    // 找到所有驗證鏈接已過期的帳號
    const expiredUsers = await User.find({
      emailVerificationTokenExpires: { $lt: Date.now() },
    });

    // 刪除所有驗證鏈接已過期的帳號
    await User.deleteMany({
      emailVerificationTokenExpires: { $lt: Date.now() },
    });

    // 回傳被刪除的用戶的 email 或者相應的訊息
    if (expiredUsers.length > 0) {
      const deletedEmails = expiredUsers.map((user) => user.email);
      console.log(`定時任務已完成，被刪除的用戶 email: ${deletedEmails.join(", ")}`);
      return `定時任務已完成，被刪除的用戶 email: ${deletedEmails.join(", ")}`;
    } else {
      console.log("定時任務已完成，沒有已過期的驗證帳號");
      return "定時任務已完成，沒有已過期的驗證帳號";
    }
  } catch (error) {
    console.error("刪除過期帳號時發生錯誤:", error);
    return "刪除過期帳號時發生錯誤";
  }
};

// 定時任務：每 1 小時執行一次
cron.schedule("0 */1 * * *", () => {
  deleteExpiredAccounts()
    .then((message) => {
      console.log(message);
    })
    .catch((error) => {
      console.error("定時任務執行時發生錯誤:", error);
    });
});

// 立即執行一次定時任務 => 寫了會變成執行兩次
/**
    deleteExpiredAccounts().then(message => {
    console.log(message);
    }).catch(error => {
    console.error('立即執行的定時任務執行時發生錯誤:', error);
    });
 */

module.exports = deleteExpiredAccounts;
