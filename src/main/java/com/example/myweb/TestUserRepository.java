/**
 * TestUserRepository.java
 *
 * ▶ 此檔案是專案啟動時自動執行的測試程式，用來驗證 UserRepository 是否能成功操作 MongoDB。
 *
 * ▶ 功能說明：
 *   - 使用 `@Component` 註解，會被 Spring 自動掃描並注入容器
 *   - 實作 `CommandLineRunner` 介面，會在專案啟動完成後自動執行 `run()` 方法一次
 *   - 實際用途為：
 *     ✅ 測試是否成功連線到 MongoDB
 *     ✅ 測試是否能成功儲存與查詢 `User` 物件
 *
 * ▶ 執行流程：
 *   1. 檢查是否已有帳號為 "testuser" 的使用者
 *   2. 若無則新增該使用者並儲存到 MongoDB
 *   3. 嘗試從資料庫查詢 "testuser"，並將結果印出到 console
 *
 * ▶ 建議用途：
 *   - 僅用於開發或測試階段，實務部署可將此類檔案移除或封存
 */

package com.example.myweb;

import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import com.example.myweb.models.User;
import com.example.myweb.repositories.UserRepository;

@Component
public class TestUserRepository implements CommandLineRunner {

    private final UserRepository userRepository;

    public TestUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // 如果 testuser 不存在，則建立一個新帳號
        if (!userRepository.existsByUsername("testuser")) {
            User user = new User("testuser", "password123");
            userRepository.save(user);
            System.out.println("測試使用者已儲存到 MongoDB");
        } else {
            System.out.println("測試使用者已存在");
        }

        // 測試查詢：從 MongoDB 找出帳號為 testuser 的使用者並印出
        userRepository.findByUsername("testuser").ifPresent(user -> 
            System.out.println("找到使用者：" + user.getUsername())
        );
    }
}
