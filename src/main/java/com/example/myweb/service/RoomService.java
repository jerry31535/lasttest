package com.example.myweb.service;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 房間核心邏輯：<br>
 * 1. 建房、加入玩家、指派角色<br>
 * 2. 廣播領袖<br>
 * 3. 🔥 投票流程（startVote / castVote / getVoteState）
 */
@Service
public class RoomService {

    private final RoomRepository        roomRepo;
    private final SimpMessagingTemplate ws;

    public RoomService(RoomRepository roomRepo,
                       SimpMessagingTemplate ws) {
        this.roomRepo = roomRepo;
        this.ws       = ws;
    }

    /* ==========================================================
       1.  建房流程（原樣保留）
       ========================================================== */
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

    /* ==========================================================
       2.  指派角色 + 隨機領袖（原樣保留）
       ========================================================== */
    public Room assignRoles(String roomId) {

        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        // 若尚未指派角色，隨機給予
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

        // 隨機領袖
        List<String> valid = room.getPlayers().stream()
                                 .filter(n -> n != null && !n.isBlank())
                                 .toList();
        String picked = valid.get(new Random().nextInt(valid.size()));
        room.setCurrentLeader(picked);

        roomRepo.save(room);
        ws.convertAndSend("/topic/leader/" + roomId, picked);

        return room;
    }

    /* ==========================================================
       3.  🔥 投票流程
       ========================================================== */

    /** 🔥 開始投票（領袖已選出 expedition） */
    public void startVote(String roomId, List<String> expedition, String leader) {
        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setCurrentExpedition(expedition);          // 🔥 新增欄位 (List<String>)
        room.setVoteMap(new HashMap<>());               // 🔥 新增欄位 (Map<String,Boolean>)
        room.setCurrentLeader(leader);                  // 同步領袖（保險起見）

        roomRepo.save(room);

        // 廣播「投票開始」給前端
        ws.convertAndSend("/topic/vote/" + roomId,
                Map.of("agree", 0, "reject", 0, "finished", false));
    }

    /** 🔥 玩家投票；回傳目前票數 & 是否結束 */
    public Map<String,Object> castVote(String roomId, String voter, boolean agree) {
        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        // 寫入票
        room.getVoteMap().put(voter, agree);
        roomRepo.save(room);

        long agreeCnt  = room.getVoteMap().values().stream().filter(b -> b).count();
        long rejectCnt = room.getVoteMap().size() - agreeCnt;

        boolean finished = room.getVoteMap().size() == room.getPlayers().size()
                        || rejectCnt > room.getPlayers().size() / 2
                        || agreeCnt  > room.getPlayers().size() / 2;

        Map<String,Object> payload = Map.of(
                "agree", agreeCnt,
                "reject", rejectCnt,
                "finished", finished
        );

        // 即時推播最新票數
        ws.convertAndSend("/topic/vote/" + roomId, payload);
        return payload;
    }

    /** 🔥 查詢投票狀態（給前端 vote.html 初始化） */
    public Map<String,Object> getVoteState(String roomId, String requester) {
        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        long agreeCnt  = room.getVoteMap().values().stream().filter(Boolean::booleanValue).count();
        long rejectCnt = room.getVoteMap().size() - agreeCnt;

        boolean canVote = !Objects.equals(room.getCurrentLeader(), requester)
                       && !room.getCurrentExpedition().contains(requester);

        boolean hasVoted = room.getVoteMap().containsKey(requester);

        return Map.of(
                "agree", agreeCnt,
                "reject", rejectCnt,
                "total", room.getPlayers().size(),
                "canVote", canVote,
                "hasVoted", hasVoted
        );
    }
}
