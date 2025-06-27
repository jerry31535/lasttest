/**
 * ChatController.java
 *
 * ▶ 此檔案負責處理聊天室訊息的 WebSocket 傳輸。
 *
 * ▶ 功能總覽：
 *   - 接收來自前端聊天室的訊息（透過 STOMP WebSocket 傳到 /app/chat/{roomId}）
 *   - 將訊息廣播給指定房間的所有訂閱者（發送到 /topic/room/{roomId}/chat）
 *
 * ▶ 與此控制器互動的單元：
 *   - models.ChatMessage.java（訊息的資料格式）
 *   - 前端透過 WebSocket + STOMP 發送與接收聊天室訊息
 *   - SimpMessagingTemplate 用於將訊息廣播到訂閱的主題（topic）
 *
 * ▶ 備註：
 *   若要修改聊天室邏輯（如增加訊息類型、儲存訊息紀錄等），請從這裡著手。
 */

package com.example.myweb.controllers;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.handler.annotation.DestinationVariable;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Controller;

import com.example.myweb.models.ChatMessage;

@Controller
public class ChatController {

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @MessageMapping("/chat/{roomId}")
    public void sendMessage(@DestinationVariable String roomId, ChatMessage message) {
        // 將訊息廣播到指定房間的聊天頻道（所有訂閱該 topic 的前端會收到）
        messagingTemplate.convertAndSend("/topic/room/" + roomId + "/chat", message);
    }
}
