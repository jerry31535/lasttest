/**
 * UserRepository.java
 *
 * ▶ 此介面為「使用者資料」對應的 Repository，繼承自 Spring Data 的 MongoRepository。
 *
 * ▶ 功能說明：
 *   - 操作 MongoDB 中的 `users` 集合（對應 User.java 模型）
 *   - 提供基本 CRUD 功能（例如 save、findAll、findById、delete 等）
 *   - 自定義常用查詢方法：可透過使用者名稱查詢、判斷帳號是否已存在
 *
 * ▶ 使用位置：
 *   - AuthController.java：進行登入、註冊邏輯（查詢帳號是否存在、比對密碼）
 *
 * ▶ 方法說明：
 *   - `Optional<User> findByUsername(String username)`：
 *       用來查詢指定名稱的使用者資料，查無資料會回傳空 Optional（避免 null）。
 *
 *   - `boolean existsByUsername(String username)`：
 *       用來在註冊時確認使用者名稱是否已存在，避免帳號重複。
 *
 * ▶ 備註：
 *   - `@Repository` 註解非必要（Spring Data 自動掃描），但加上可提升可讀性。
 *   - 若你未來想根據帳號密碼查詢（不建議明文比較），可擴充如：
 *     `Optional<User> findByUsernameAndPassword(String username, String password)`
 */

package com.example.myweb.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import com.example.myweb.models.User;

@Repository
public interface UserRepository extends MongoRepository<User, String> {

    /** 根據使用者名稱查詢單一使用者資料 */
    Optional<User> findByUsername(String username);

    /** 檢查帳號是否已存在 */
    boolean existsByUsername(String username);
}
