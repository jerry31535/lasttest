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
    public ResponseEntity<Object> createRoom(@RequestBody Room room) {
        // 檢查是否已經有相同名稱的房間
        Optional<Room> existingRoom = roomRepository.findAll().stream()
                .filter(r -> r.getRoomName().equals(room.getRoomName()))
                .findFirst();

        if (existingRoom.isPresent()) {
            // 返回錯誤訊息並設置狀態碼
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間名稱已存在，請選擇其他名稱！");
        }

        // 設置房間 ID 並儲存
        room.setId(UUID.randomUUID().toString());
        roomRepository.save(room);

        return ResponseEntity.ok().body(room); // 返回創建成功的房間對象
    }
}
