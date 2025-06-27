/**
 * User.java
 *
 * ▶ 此類別為「使用者帳號資料」的資料模型，對應 MongoDB 中的 `users` 集合。
 *
 * ▶ 功能說明：
 *   - 用來儲存使用者的登入資訊（帳號、密碼）
 *   - 通常用於註冊與登入時接收或比對資料
 *
 * ▶ 使用位置：
 *   - AuthController.java 中作為 @RequestBody 對象接收登入/註冊資料
 *   - UserService 中進行帳號驗證、註冊邏輯
 *
 * ▶ 對應 MongoDB 結構（範例）：
 *   {
 *     "_id": "660fb3e...",
 *     "username": "test123",
 *     "password": "abcd1234"
 *   }
 *
 * ▶ 備註：
 *   - 密碼應該在後端儲存前加密（例如使用 bcrypt）
 *   - 若要擴充功能（如頭像、Email、權限等），可以在此加欄位
 */

package com.example.myweb.models;

import org.springframework.data.mongodb.core.mapping.Document;

@Document(collection = "users")
public class User {

    private String id;        // MongoDB 自動產生的使用者 ID
    private String username;  // 帳號名稱
    private String password;  // 密碼（建議加密儲存）

    // 無參數建構子（Spring Data 需要）
    public User() {}

    // 帶參數建構子（可用於初始化物件）
    public User(String username, String password) {
        this.username = username;
        this.password = password;
    }

    // Getter 和 Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }
}
