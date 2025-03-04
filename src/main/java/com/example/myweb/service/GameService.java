package com.example.myweb.service;

import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class GameService {

    private List<String> gameRooms = new ArrayList<>();

    // 獲取遊戲房間列表
    public Map<String, Object> getGameRooms() {
        Map<String, Object> response = new HashMap<>();
        response.put("rooms", gameRooms);
        return response;
    }

    // 創建遊戲房間
    public Map<String, Object> createGameRoom(String roomName) {
        Map<String, Object> response = new HashMap<>();
        if (gameRooms.contains(roomName)) {
            response.put("success", false);
            response.put("message", "遊戲房間名稱已存在！");
        } else {
            gameRooms.add(roomName);
            response.put("success", true);
            response.put("message", "遊戲房間創建成功！");
        }
        return response;
    }
}
