package com.example.myweb.controllers;

import java.util.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.*;

import com.example.myweb.dto.AvatarSelectionRequest;
import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;

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
        return ResponseEntity.ok(roomRepository.findAll());
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
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "退出房間成功，房間已刪除，因為沒有其他玩家"
            ));
        } else {
            roomRepository.save(room);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "message", "退出房間成功"
            ));
        }
    }

    @PostMapping("/start-game")
    public ResponseEntity<Object> startGame(@RequestParam String roomId, @RequestParam String playerName) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");
        }

        Room room = roomOpt.get();
        List<String> players = room.getPlayers();

        if (players.isEmpty() || !players.get(0).equals(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("只有房主可以開始遊戲");
        }

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "startGame");
        return ResponseEntity.ok(Map.of("success", true, "message", "遊戲開始訊息已廣播"));
    }

    @PostMapping("/room/{roomId}/select-avatar")
    public ResponseEntity<?> selectAvatar(@PathVariable String roomId, @RequestBody AvatarSelectionRequest request) {
        String playerName = request.getPlayerName();
        String avatar = request.getAvatar();

        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("房間不存在");
        }

        Room room = roomOpt.get();
        if (!room.getPlayers().contains(playerName)) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("該玩家不在此房間");
        }

        if (room.getAvatarMap() == null) {
            room.setAvatarMap(new HashMap<>());
        }
        room.getAvatarMap().put(playerName, avatar);
        roomRepository.save(room);

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "avatarSelected:" + playerName);

        if (room.getAvatarMap().size() >= room.getPlayerCount()) {
            simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "allAvatarSelected");
        }

        return ResponseEntity.ok().build();
    }

    @PostMapping("/start-real-game")
    public ResponseEntity<?> startRealGame(@RequestParam String roomId, @RequestParam String playerName) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (!roomOpt.isPresent()) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("房間不存在");
        }

        Room room = roomOpt.get();

        if (room.getPlayers().isEmpty() || !room.getPlayers().get(0).equals(playerName)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).body("只有房主可以開始遊戲");
        }

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "startRealGame");
        return ResponseEntity.ok().build();
    }

    // ✅ 修正過的：移除多餘 /api，這樣前端才能正確 call
    @GetMapping("/room/{roomId}/players")
    public ResponseEntity<List<Map<String, String>>> getAllPlayers(@PathVariable String roomId) {
        Optional<Room> roomOpt = roomRepository.findById(roomId);
        if (roomOpt.isEmpty()) {
            return ResponseEntity.notFound().build();
        }

        Room room = roomOpt.get();
        Map<String, String> avatarMap = room.getAvatarMap();

        List<Map<String, String>> players = new ArrayList<>();
        for (String playerName : avatarMap.keySet()) {
            Map<String, String> playerInfo = new HashMap<>();
            playerInfo.put("name", playerName);
            playerInfo.put("avatar", avatarMap.get(playerName));
            players.add(playerInfo);
        }

        return ResponseEntity.ok(players);
    }
}
