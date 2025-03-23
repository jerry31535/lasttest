package com.example.myweb.service;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;

@Service
public class RoomService {

    private final RoomRepository roomRepository;

    public RoomService(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    public String createRoom(String roomName, int playerCount, String roomType, String roomPassword) {
        // 檢查是否有相同名稱的房間
        if (roomRepository.existsByRoomName(roomName)) {
            return "房間名稱已經存在";
        }

        // 創建房間
        Room room = new Room();
        room.setRoomName(roomName);
        room.setPlayerCount(playerCount);
        room.setRoomType(roomType);

        // 初始化 players 欄位為一個大小為 playerCount 的空陣列
        List<String> players = new ArrayList<>(playerCount);
        for (int i = 0; i < playerCount; i++) {
            players.add(""); // 初始化為空字串，或根據需求設置預設值
        }
        room.setPlayers(players);

        // 設置密碼（如果是私人房間）
        if ("private".equals(roomType)) {
            room.setRoomPassword(roomPassword);
        } else {
            room.setRoomPassword(null);
        }

        // 保存房間
        roomRepository.save(room);
        return "房間已成功創建，ID：" + room.getId();
    }
}