package com.example.myweb.controllers;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Collections;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.myweb.dto.AvatarSelectionRequest;
import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import com.example.myweb.service.RoomService;

@RestController
@RequestMapping("/api")
public class RoomController {

    @Autowired private RoomRepository        roomRepository;
    @Autowired private RoomService           roomService;          // ★ 新增
    @Autowired private SimpMessagingTemplate simpMessagingTemplate;

    /* -------------------- 建房 -------------------- */

    @PostMapping("/create-room")
    public ResponseEntity<Object> createRoom(@RequestBody Room room,
                                             @RequestParam String playerName) {

        String formattedRoomName = room.getRoomName() + "房間";
        room.setRoomName(formattedRoomName);

        boolean exists = roomRepository.findAll().stream()
                            .anyMatch(r -> r.getRoomName().equals(room.getRoomName()));
        if (exists)
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                                 .body("房間名稱已存在，請選擇其他名稱！");

        room.setId(UUID.randomUUID().toString());
        if (!"private".equals(room.getRoomType())) room.setRoomPassword(null);

        room.setPlayers(new ArrayList<>(List.of(playerName)));
        roomRepository.save(room);
        return ResponseEntity.ok(room);
    }

    /* -------------------- 查房 -------------------- */

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Room> getRoomById(@PathVariable String roomId) {
        return roomRepository.findById(roomId)
               .map(ResponseEntity::ok)
               .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(null));
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<Room>> getAllRooms() {
        List<Room> rooms = roomRepository.findAll().stream()
                             .filter(r -> !r.isStarted())
                             .collect(Collectors.toList());
        return ResponseEntity.ok(rooms);
    }

    /* -------------------- 加退房 -------------------- */

    @PostMapping("/join-room")
    public ResponseEntity<Object> joinRoom(@RequestParam String roomId,
                                           @RequestParam String playerName,
                                           @RequestParam(required = false) String roomPassword) {

        Optional<Room> opt = roomRepository.findById(roomId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");

        Room room = opt.get();
        List<String> players = room.getPlayers();

        if (players.size() >= room.getPlayerCount())
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("房間人數已滿");

        if (players.contains(playerName))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("玩家已經加入房間");

        players.add(playerName);
        roomRepository.save(room);
        return ResponseEntity.ok(Map.of("success", true, "message", "加入房間成功"));
    }

    @PostMapping("/exit-room")
    public ResponseEntity<Object> exitRoom(@RequestParam String roomId,
                                           @RequestParam String playerName) {

        Optional<Room> opt = roomRepository.findById(roomId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");

        Room room = opt.get();
        List<String> players = room.getPlayers();

        if (!players.remove(playerName))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("該玩家不在此房間");

        if (players.isEmpty()) {
            roomRepository.delete(room);
            return ResponseEntity.ok(Map.of("success", true, "message", "退出房間成功，房間已刪除"));
        }
        roomRepository.save(room);
        return ResponseEntity.ok(Map.of("success", true, "message", "退出房間成功"));
    }

    /* -------------------- 開始遊戲 -------------------- */

    @PostMapping("/start-game")
    public ResponseEntity<Object> startGame(@RequestParam String roomId,
                                            @RequestParam String playerName) {

        Optional<Room> opt = roomRepository.findById(roomId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("找不到房間");

        Room room = opt.get();
        List<String> players = room.getPlayers();
        if (players.isEmpty() || !players.get(0).equals(playerName))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("只有房主可以開始遊戲");

        room.setStarted(true);
        roomRepository.save(room);
        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "startGame");
        return ResponseEntity.ok(Map.of("success", true, "message", "遊戲開始訊息已廣播"));
    }

    /* -------------------- 選頭貼 -------------------- */

    @PostMapping("/room/{roomId}/select-avatar")
    public ResponseEntity<?> selectAvatar(@PathVariable String roomId,
                                          @RequestBody AvatarSelectionRequest req) {

        String playerName = req.getPlayerName();
        String avatar     = req.getAvatar();

        Optional<Room> opt = roomRepository.findById(roomId);
        if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).body("房間不存在");

        Room room = opt.get();
        if (!room.getPlayers().contains(playerName))
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("該玩家不在此房間");

        room.getAvatarMap().put(playerName, avatar);
        roomRepository.save(room);

        simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "avatarSelected:" + playerName);

        if (room.getAvatarMap().size() >= room.getPlayerCount())
            simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "allAvatarSelected");

        return ResponseEntity.ok().build();
    }

    /* -------------------- 角色一次分配（舊流程） -------------------- */

    @PostMapping("/start-real-game")
public ResponseEntity<Map<String, Room.RoleInfo>> startRealGame(@RequestParam String roomId,
                                                                @RequestParam String playerName) {

    Optional<Room> opt = roomRepository.findById(roomId);
    if (opt.isEmpty()) return ResponseEntity.status(HttpStatus.NOT_FOUND).build();

    Room room = opt.get();
    if (room.getAssignedRoles() != null && !room.getAssignedRoles().isEmpty())
        return ResponseEntity.status(HttpStatus.CONFLICT).body(room.getAssignedRoles());

    List<String> players = new ArrayList<>(room.getPlayers());

    List<Room.RoleInfo> roles;

    switch (players.size()) {
        case 5:
            roles = new ArrayList<>(Arrays.asList(
                new Room.RoleInfo("工程師", "goodpeople1.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("潛伏者", "badpeople1.png"),
                new Room.RoleInfo("邪惡平民", "badpeople4.png")
            ));
            break;

        case 6:
            roles = new ArrayList<>(Arrays.asList(
                new Room.RoleInfo("工程師", "goodpeople1.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                new Room.RoleInfo("潛伏者", "badpeople1.png"),
                new Room.RoleInfo("邪惡平民", "badpeople4.png")
            ));
            break;

        default:
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("error", new Room.RoleInfo("錯誤", "尚未支援此人數的遊戲模式")));
    }

    if (roles.size() != players.size())
        return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                             .body(Map.of("error", new Room.RoleInfo("錯誤", "角色數量與玩家人數不符")));

    Collections.shuffle(players);
    Collections.shuffle(roles);

    Map<String, Room.RoleInfo> assigned = new HashMap<>();
    for (int i = 0; i < players.size(); i++) assigned.put(players.get(i), roles.get(i));

    room.setAssignedRoles(assigned);
    roomRepository.save(room);
    simpMessagingTemplate.convertAndSend("/topic/room/" + roomId, "startRealGame");

    return ResponseEntity.ok(assigned);
}

    /* -------------------- 取玩家列表 -------------------- */

    @GetMapping("/room/{roomId}/players")
    public ResponseEntity<List<Map<String, String>>> getAllPlayers(@PathVariable String roomId) {

        return roomRepository.findById(roomId)
            .map(room -> {
                List<Map<String, String>> list = new ArrayList<>();
                room.getAvatarMap().forEach((name, avatar) -> {
                    list.add(Map.of("name", name, "avatar", avatar));
                });
                return ResponseEntity.ok(list);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /* -------------------- 取角色 + 領袖（唯一實作） -------------------- */

    @GetMapping("/room/{roomId}/roles")
    public ResponseEntity<Map<String,Object>> getRolesAndLeader(@PathVariable String roomId){

        return roomRepository.findById(roomId)
            .map(room -> {
                Map<String,Object> res = new HashMap<>();
                res.put("assignedRoles", room.getAssignedRoles());
                res.put("currentLeader", room.getCurrentLeader());
                return ResponseEntity.ok(res);
            })
            .orElse(ResponseEntity.notFound().build());
    }

    /* -------------------- 指派角色 + 隨機領袖 -------------------- */


    @PostMapping("/room/{roomId}/assign-roles")
    public Map<String,Object> assignRoles(@PathVariable String roomId){

        Room room = roomService.assignRoles(roomId);

        Map<String,Object> res = new HashMap<>();
        res.put("assignedRoles", room.getAssignedRoles());
        res.put("currentLeader", room.getCurrentLeader());
        return res;
    }

    /* =================================================
       🔥 投  票  相  關  端  點
       ================================================= */

    /** 開始投票（領袖送 expedition） */
    @PostMapping("/room/{roomId}/start-vote")
    public ResponseEntity<Void> startVote(
            @PathVariable String roomId,
            @RequestBody Map<String,Object> body) {

        @SuppressWarnings("unchecked")             // 🔥 修正：消除未檢查 cast 警告
        List<String> expedition = (List<String>) body.get("expedition");
        String leader = (String) body.get("leader");

        roomService.startVote(roomId, expedition, leader);   // 🔥 修正：改用 roomService
        return ResponseEntity.ok().build();
    }

    /** 玩家投票 */
    @PostMapping("/room/{roomId}/vote")
    public ResponseEntity<Map<String,Object>> vote(
            @PathVariable String roomId,
            @RequestBody Map<String,Object> body) {

        String voter = (String) body.get("voter");
        boolean agree = (Boolean) body.get("agree");

        Map<String,Object> result = roomService.castVote(roomId, voter, agree); // 🔥 修正
        return ResponseEntity.ok(result);
    }

    /** 取得目前票數與自身能否投票 */
    @GetMapping("/room/{roomId}/vote-state")
    public ResponseEntity<Map<String,Object>> voteState(
            @PathVariable String roomId,
            @RequestParam String player) {

        Map<String,Object> state = roomService.getVoteState(roomId, player);    // 🔥 修正
        return ResponseEntity.ok(state);
    }
    @GetMapping("/game-start/{roomId}")
    public String gameStart(@PathVariable String roomId){
    return "5player-front-page";   // 或你真正的遊戲模板名
}

}
