package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    @PostMapping("/create-room")
    public ResponseEntity<Object> createRoom(@RequestBody Room room) {
        // 檢查是否已經有相同名稱的房間
        if (roomRepository.existsByRoomName(room.getRoomName())) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間名稱已存在，請選擇其他名稱！");
        }

        // 設置房間 ID 並儲存
        room.setId(UUID.randomUUID().toString());
        if (!"private".equals(room.getRoomType())) {
            room.setRoomPassword(null);
        }
        roomRepository.save(room);

        // 通過 WebSocket 發送房間更新消息
        messagingTemplate.convertAndSend("/topic/rooms", room);
        System.out.println("發送房間信息到 /topic/rooms: " + room); // 添加日誌

        return ResponseEntity.ok().body(room);
    }

    @PostMapping("/join-room")
    public ResponseEntity<Object> joinRoom(@RequestParam String roomId, @RequestParam String username) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isEmpty()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("房間不存在");
        }

        Room room = roomOptional.get();
        String message = username + " 加入了房間 " + room.getRoomName();

        // 通過 WebSocket 發送加入房間的通知
        messagingTemplate.convertAndSend("/topic/room-updates", message);
        System.out.println("發送加入房間通知到 /topic/room-updates: " + message); // 添加日誌

        return ResponseEntity.ok().body(message);
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll();
        System.out.println("獲取所有房間: " + rooms); // 添加日誌
        return ResponseEntity.ok(rooms);
    }

    @GetMapping("/find-room-by-password")
    public ResponseEntity<Room> findRoomByPassword(@RequestParam String password) {
        Optional<Room> roomOptional = roomRepository.findByRoomPassword(password);
        if (roomOptional.isPresent()) {
            System.out.println("找到房間: " + roomOptional.get()); // 添加日誌
            return ResponseEntity.ok(roomOptional.get());
        } else {
            System.out.println("找不到對應的房間，密碼: " + password); // 添加日誌
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(null);
        }
    }

    @DeleteMapping("/delete-room/{roomId}")
    public ResponseEntity<String> deleteRoom(@PathVariable String roomId) {
        Optional<Room> roomOptional = roomRepository.findById(roomId);
        if (roomOptional.isPresent()) {
            roomRepository.deleteById(roomId);
            System.out.println("房間已刪除: " + roomId); // 添加日誌
            return ResponseEntity.ok("房間已刪除");
        } else {
            System.out.println("房間不存在: " + roomId); // 添加日誌
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("房間不存在");
        }
    }
}