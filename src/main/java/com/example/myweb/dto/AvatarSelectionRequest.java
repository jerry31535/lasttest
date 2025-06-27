/**
 * AvatarSelectionRequest.java
 *
 * ▶ 此類別為資料傳輸物件（DTO），用於接收前端傳來的「頭像選擇請求」資料。
 *
 * ▶ 使用場景：
 *   - 當玩家選擇頭像後，前端會送出一個 JSON，內容包含：
 *       {
 *         "playerName": "小明",
 *         "avatar": "headshot2"
 *       }
 *   - 後端的 RoomController 將這段 JSON 映射成 AvatarSelectionRequest 物件。
 *
 * ▶ 搭配使用的 API：
 *   - @PostMapping("/room/{roomId}/select-avatar")
 *     public ResponseEntity<?> selectAvatar(..., @RequestBody AvatarSelectionRequest req)
 *
 * ▶ 備註：
 *   - DTO 不包含邏輯，只作為資料封裝使用。
 *   - 若以後資料欄位變動（如增加顏色、表情等），可從這裡擴充。
 */

package com.example.myweb.dto;

public class AvatarSelectionRequest {
    private String playerName; // 玩家名稱
    private String avatar;     // 玩家選擇的頭像代號（例如 "headshot2"）

    public String getPlayerName() {
        return playerName;
    }

    public void setPlayerName(String playerName) {
        this.playerName = playerName;
    }

    public String getAvatar() {
        return avatar;
    }

    public void setAvatar(String avatar) {
        this.avatar = avatar;
    }
}
