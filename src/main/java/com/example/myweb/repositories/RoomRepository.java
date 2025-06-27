/**
 * RoomRepository.java
 *
 * ▶ 此介面為「房間資料」對應的 Repository，繼承自 Spring Data 的 MongoRepository。
 *
 * ▶ 功能說明：
 *   - 用來操作 MongoDB 中的 `rooms` 集合（對應 Room.java 模型）
 *   - 提供基本 CRUD 操作（例如 save、findById、findAll、delete 等）
 *   - 自訂方法支援依房間名稱查詢與檢查是否存在（Spring Data JPA 自動解析方法名稱）
 *
 * ▶ 使用位置：
 *   - `RoomController.java`：進行房間的建立、查詢、加入、退出等功能
 *   - `RoomService.java`：進行遊戲邏輯如角色分配、領袖輪替、投票等操作
 *
 * ▶ 常用語法範例：
 *   - `roomRepository.findById(roomId)`：查詢指定房間
 *   - `roomRepository.save(room)`：儲存房間資料
 *   - `roomRepository.existsByRoomName(name)`：檢查房間名稱是否已存在
 *
 * ▶ 備註：
 *   - 因為繼承 MongoRepository，這裡不需要寫任何 SQL 或 Mongo 指令
 *   - 可依需求新增方法命名（如 findByRoomType、deleteByRoomName 等）
 */

package com.example.myweb.repositories;

import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.myweb.models.Room;

public interface RoomRepository extends MongoRepository<Room, String> {

    /** 檢查是否已存在某個房間名稱 */
    boolean existsByRoomName(String roomName);

    /** 透過房間名稱查詢房間 */
    Optional<Room> findByRoomName(String roomName);
}
