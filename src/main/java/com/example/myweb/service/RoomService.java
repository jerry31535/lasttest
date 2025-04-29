package com.example.myweb.service;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class RoomService {

    private final RoomRepository        roomRepo;
    private final SimpMessagingTemplate ws;

    public RoomService(RoomRepository roomRepo,
                       SimpMessagingTemplate ws) {
        this.roomRepo = roomRepo;
        this.ws       = ws;
    }

    /* ========== 既有 createRoom() 完全保留 ========== */
    public String createRoom(String roomName, int playerCount,
                             String roomType, String roomPassword) {
        if (roomRepo.existsByRoomName(roomName)) return "房間名稱已經存在";

        Room room = new Room();
        room.setRoomName(roomName);
        room.setPlayerCount(playerCount);
        room.setRoomType(roomType);

        List<String> players = new ArrayList<>(playerCount);
        for (int i = 0; i < playerCount; i++) players.add("");
        room.setPlayers(players);

        if ("private".equals(roomType)) room.setRoomPassword(roomPassword);

        roomRepo.save(room);
        return "房間已成功創建，ID：" + room.getId();
    }

    /* ========== ★★★ 新增：指派角色 + 隨機領袖 ========== */
    public Room assignRoles(String roomId) {

        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        /* 1. 你原本的角色指派 (若已有就跳過) */
        if (room.getAssignedRoles() == null || room.getAssignedRoles().isEmpty()) {
            List<String> names = new ArrayList<>(room.getPlayers());

            List<Room.RoleInfo> roles = Arrays.asList(
                new Room.RoleInfo("工程師",      "goodpeople1.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                new Room.RoleInfo("邪惡平民",   "badpeople4.png")
            );
            Collections.shuffle(names);
            Collections.shuffle(roles);

            Map<String,Room.RoleInfo> assigned = new HashMap<>();
            for (int i = 0; i < names.size(); i++) assigned.put(names.get(i), roles.get(i));

            room.setAssignedRoles(assigned);
        }

        /* 2. 隨機領袖 */
        List<String> valid = room.getPlayers().stream()
                                 .filter(n -> n != null && !n.isBlank())
                                 .toList();
        String picked = valid.get(new Random().nextInt(valid.size()));
        room.setCurrentLeader(picked);

        /* 3. 儲存並廣播 */
        roomRepo.save(room);
        ws.convertAndSend("/topic/leader/" + roomId, picked);

        return room;
    }
}
