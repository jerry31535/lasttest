package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;

import org.springframework.web.bind.annotation.*;


import java.util.Optional;
import java.util.UUID;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired
    private RoomRepository roomRepository;
    
    

    @PostMapping("/create-room")
    public ResponseEntity<Object> createRoom(
        @RequestBody Room room ) {
        String formattedRoomName = room.getRoomName() + "房間";
        room.setRoomName(formattedRoomName);
        Optional<Room> existingRoom = roomRepository.findAll().stream()
        .filter(r -> r.getRoomName().equals(room.getRoomName()))
        .findFirst();

        if (existingRoom.isPresent()) {
        // 返回錯誤訊息並設置狀態碼
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間名稱已存在，請選擇其他名稱！");
        }


        // 設置房間 ID 並儲存
        room.setId(UUID.randomUUID().toString());
        if (!"private".equals(room.getRoomType())) {
            room.setRoomPassword(null);
        }
        
        roomRepository.save(room);

        return ResponseEntity.ok().body(room); // 返回創建成功的房間對象

        
    }
    @GetMapping("/room/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable String roomId) {
        Optional<Room> room = roomRepository.findById(roomId);
        return room.map(ResponseEntity::ok)
                .orElseGet(() -> ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    
}