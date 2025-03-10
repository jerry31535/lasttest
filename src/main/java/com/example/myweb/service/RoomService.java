package com.example.myweb.service;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.stereotype.Service;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public String createRoom(String roomName, int playerCount, String roomType) {
        // 檢查是否有相同名稱的房間
        if (roomRepository.existsByRoomName(roomName)) {
            return "房間名稱已經存在";
        }
        
        Room room = new Room();
        room.setRoomName(roomName);
        room.setPlayerCount(playerCount);
        room.setRoomType(roomType);

        roomRepository.save(room);
        return "房間已成功創建，ID：" + room.getId();
    }
}
