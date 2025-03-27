package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.Arrays;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;
    
    @PostMapping("/create-room")
    public ResponseEntity<Object> createRoom(
        @RequestBody Room room, @RequestParam String creatorName) {
        String formattedRoomName = room.getRoomName() + "房間";
        room.setRoomName(formattedRoomName);
        Optional<Room> existingRoom = roomRepository.findAll().stream()
            .filter(r -> r.getRoomName().equals(room.getRoomName()))
            .findFirst();
    
        if (existingRoom.isPresent()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body("房間名稱已存在，請選擇其他名稱！");
        }
    
        room.setId(UUID.randomUUID().toString());
        if (!"private".equals(room.getRoomType())) {
            room.setRoomPassword(null);
        }
        // 使用 Arrays.asList 建立包含創建玩家名稱的 List
        room.setPlayers(new ArrayList<>(Arrays.asList(creatorName)));
        roomRepository.save(room);
    
        return ResponseEntity.ok().body(room);
    }
    
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable String roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        return room.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }
    
    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        return ResponseEntity.ok(rooms);
    }
    
    @PostMapping("/join-room")
    public ResponseEntity<Object> joinRoom(
            @RequestParam String roomId,
            @RequestParam String playerName,
            @RequestParam(required = false) String roomPassword) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");
        }
        Room room = roomOpt.get();
        
        // 若房間為私人房間，驗證密碼是否正確
        if ("private".equals(room.getRoomType())) {
            if (roomPassword == null || !roomPassword.equals(room.getRoomPassword())) {
                return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間密碼錯誤");
            }
        }
        
        // 檢查房間是否已滿
        List<String> players = room.getPlayers();
        if (players.size() >= room.getPlayerCount()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間人數已滿");
        }
        
        // 檢查同一玩家是否已經加入房間
        if (players.contains(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("玩家已經加入房間");
        }
        
        players.add(playerName);
        roomRepository.save(room);
        
        // 回傳成功訊息
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "加入房間成功");
        return ResponseEntity.ok(resp);
    }
    
    @PostMapping("/exit-room")
    public ResponseEntity<Object> exitRoom(
            @RequestParam String roomId,
            @RequestParam String playerName) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");
        }
        Room room = roomOpt.get();
        List<String> players = room.getPlayers();
        
        // 檢查該玩家是否在房間中
        if (!players.contains(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("玩家不在房間中");
        }
        
        // 從 players 陣列中移除該玩家
        players.remove(playerName);
        
        // 如果移除後玩家清單為空，則刪除此房間
        if (players.isEmpty()) {
            roomRepository.delete(room);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "最後一位玩家已退出，房間已刪除");
            return ResponseEntity.ok(response);
        } else {
            roomRepository.save(room);
            Map<String, Object> response = new HashMap<>();
            response.put("success", true);
            response.put("message", "退出房間成功");
            response.put("players", room.getPlayers());
            return ResponseEntity.ok(response);
        }
    }
}