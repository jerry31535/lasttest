package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SimpMessagingTemplate simpMessagingTemplate;
    
    @PostMapping("/create-room")
    public ResponseEntity<Object> createRoom(
            @RequestBody Room room, @RequestParam String playerName) {
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
        // 將登入玩家名稱作為房主存入 players[0]
        room.setPlayers(new ArrayList<>(Arrays.asList(playerName)));
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
        
        // 私人房間密碼驗證由前端處理，這裡不進行驗證
        
        List<String> players = room.getPlayers();
        if (players.size() >= room.getPlayerCount()) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間人數已滿");
        }
        
        if (players.contains(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("玩家已經加入房間");
        }
        
        players.add(playerName);
        roomRepository.save(room);
        
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
        
        if (!players.contains(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("該玩家不在房間中");
        }
        
        players.remove(playerName);
        
        if (players.isEmpty()) {
            roomRepository.delete(room);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "退出房間成功，房間已刪除，因為沒有其他玩家");
            return ResponseEntity.ok(resp);
        } else {
            roomRepository.save(room);
            Map<String, Object> resp = new HashMap<>();
            resp.put("success", true);
            resp.put("message", "退出房間成功");
            return ResponseEntity.ok(resp);
        }
    }
    
    @PostMapping(value = "/start-game", produces = "application/json")
    public ResponseEntity<Object> startGame(@RequestParam String roomId, @RequestParam String playerName) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");
        }
        Room room = roomOpt.get();
        List<String> players = room.getPlayers();
        // 檢查只有房主（players[0]）才能開始遊戲
        if (players.isEmpty() || !players.get(0).equals(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("只有房主可以開始遊戲");
        }
        // 廣播 "startGame" 訊息給所有訂閱該房間頻道的客戶端
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "startGame");
        Map<String, Object> resp = new HashMap<>();
        resp.put("success", true);
        resp.put("message", "遊戲開始訊息已廣播");
        return ResponseEntity.ok(resp);
    }
}
