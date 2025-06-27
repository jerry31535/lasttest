/**
 * ChatMessage.java
 *
 * ▶ 此類別為「聊天室訊息」的資料模型（Model or DTO）。
 *
 * ▶ 功能說明：
 *   - 封裝聊天室中每一則訊息的資料內容
 *   - 由 WebSocket 傳送與接收的物件格式
 *
 * ▶ 資料欄位：
 *   - sender  ：傳送者的名稱（如玩家名稱）
 *   - content ：訊息內容（文字訊息）
 *
 * ▶ 搭配使用的控制器：
 *   - ChatController.java
 *     → @MessageMapping("/chat/{roomId}")
 *     → SimpMessagingTemplate 會將這個物件發送到 `/topic/room/{roomId}/chat`
 *
 * ▶ 使用方式（前後端）：
 *   - 前端傳送：
 *       {
 *         "sender": "小明",
 *         "content": "哈囉大家好"
 *       }
 *   - 後端接收後，會用這個類別封裝成 Java 物件，再廣播出去
 *
 * ▶ 備註：
 *   - 若將來要加表情、時間戳、訊息類型等欄位，可從此類擴充。
 */

package com.example.myweb.models;

public class ChatMessage {
    private String sender;   // 傳送者名稱
    private String content;  // 訊息文字內容

    public ChatMessage() {}

    public ChatMessage(String sender, String content) {
        this.sender = sender;
        this.content = content;
    }

    public String getSender() {
        return sender;
    }

    public void setSender(String sender) {
        this.sender = sender;
    }

    public String getContent() {
        return content;
    }

    public void setContent(String content) {
        this.content = content;
    }
}
