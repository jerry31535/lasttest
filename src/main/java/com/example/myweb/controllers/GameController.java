package com.example.myweb.controllers;

import com.example.myweb.service.GameService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/game")
public class GameController {

    @Autowired
    private GameService gameService;

    // 獲取遊戲房間列表
    @GetMapping("/rooms")
    public Map<String, Object> getGameRooms() {
        return gameService.getGameRooms();
    }

    // 創建遊戲房間
    @PostMapping("/create-room")
    public Map<String, Object> createGameRoom(@RequestBody Map<String, String> roomData) {
        String roomName = roomData.get("name");
        return gameService.createGameRoom(roomName);
    }
}
