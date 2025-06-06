package com.example.myweb.service;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * 房間核心邏輯：
 * 1. 指派角色 + 隨機領袖
 * 2. 🔥 投票流程（startVote / castVote / getVoteState）
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

    /* ---------- 角色指派 & 領袖 ---------- */
    public Room assignRoles(String roomId) {
        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        // 如果還沒指派過
        if (room.getAssignedRoles() == null || room.getAssignedRoles().isEmpty()) {
            int n = room.getPlayerCount();
            List<Room.RoleInfo> roles = switch (n) {
                case 5 -> Arrays.asList(
                    new Room.RoleInfo("工程師",      "goodpeople1.png"),
                    new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者", "goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("邪惡平民",   "badpeople4.png")
                );
                case 6 -> Arrays.asList(
                    new Room.RoleInfo("指揮官",     "goodpeople3.png"),
                    new Room.RoleInfo("工程師",     "goodpeople1.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("邪惡平民",   "badpeople4.png")
                );
                case 7 -> Arrays.asList(
                    new Room.RoleInfo("指揮官",     "goodpeople3.png"),
                    new Room.RoleInfo("工程師",     "goodpeople1.png"),
                    new Room.RoleInfo("醫護兵",     "goodpeople2.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("破壞者",     "badpeople2.png"),
                    new Room.RoleInfo("邪惡平民",   "badpeople4.png")
                );
                case 8 -> Arrays.asList(
                    new Room.RoleInfo("指揮官",     "goodpeople3.png"),
                    new Room.RoleInfo("工程師",     "goodpeople1.png"),
                    new Room.RoleInfo("醫護兵",     "goodpeople2.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("破壞者",     "badpeople2.png"),
                    new Room.RoleInfo("邪惡平民",   "badpeople4.png")
                );
                case 9 -> Arrays.asList(
                    new Room.RoleInfo("指揮官",     "goodpeople3.png"),
                    new Room.RoleInfo("工程師",     "goodpeople1.png"),
                    new Room.RoleInfo("醫護兵",     "goodpeople2.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("破壞者",     "badpeople2.png"),
                    new Room.RoleInfo("影武者",     "badpeople3.png")
                );
                case 10 -> Arrays.asList(
                    new Room.RoleInfo("指揮官",     "goodpeople3.png"),
                    new Room.RoleInfo("工程師",     "goodpeople1.png"),
                    new Room.RoleInfo("醫護兵",     "goodpeople2.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("普通倖存者","goodpeople4.png"),
                    new Room.RoleInfo("潛伏者",     "badpeople1.png"),
                    new Room.RoleInfo("破壞者",     "badpeople2.png"),
                    new Room.RoleInfo("影武者",     "badpeople3.png"),
                    new Room.RoleInfo("邪惡平民",   "badpeople4.png")
                );
                default -> throw new RuntimeException("尚未支援 " + n + " 人的遊戲模式");
            };

            Collections.shuffle(roles);
            List<String> names = new ArrayList<>(room.getPlayers());
            Collections.shuffle(names);
            Map<String, Room.RoleInfo> assigned = new HashMap<>();
            for (int i = 0; i < names.size(); i++) {
                assigned.put(names.get(i), roles.get(i));
            }
            room.setAssignedRoles(assigned);
        }

        // 再隨機選領袖
        List<String> valid = room.getPlayers().stream()
                                 .filter(s -> !s.isBlank())
                                 .toList();
        String picked = valid.get(new Random().nextInt(valid.size()));
        room.setCurrentLeader(picked);

        roomRepo.save(room);
        ws.convertAndSend("/topic/leader/" + roomId, picked);
        return room;
    }

    // ... 其餘投票流程不變 ...



    /* =========================================================
       🔥  投  票  流  程
       ========================================================= */

    /* 領袖選完 expedition → 廣播投票開始 */
    public void startVote(String roomId, List<String> expedition, String leader) {

        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        room.setCurrentExpedition(expedition);
        room.setVoteMap(new HashMap<>());
        room.setCurrentLeader(leader);

        roomRepo.save(room);

        ws.convertAndSend("/topic/vote/" + roomId, Map.of(
                "agree",      0,
                "reject",     0,
                "finished",   false,
                "expedition", expedition
        ));
    }

    /* 玩家投票 */
    public Map<String,Object> castVote(String roomId, String voter, boolean agree) {

        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        room.getVoteMap().put(voter, agree);
        roomRepo.save(room);

        long agreeCnt  = room.getVoteMap().values().stream().filter(b -> b).count();
        long rejectCnt = room.getVoteMap().size() - agreeCnt;

        boolean finished = room.getVoteMap().size() == room.getPlayers().size(); // ✅ 全員投畢

        Map<String,Object> payload = Map.of(
                "agree",      agreeCnt,
                "reject",     rejectCnt,
                "finished",   finished,
                "expedition", room.getCurrentExpedition()
        );

        ws.convertAndSend("/topic/vote/" + roomId, payload);
        return payload;
    }

    /* 前端初始化用 */
    public Map<String,Object> getVoteState(String roomId, String requester) {

        Room room = roomRepo.findById(roomId)
                            .orElseThrow(() -> new RuntimeException("Room not found"));

        long agreeCnt  = room.getVoteMap().values().stream().filter(Boolean::booleanValue).count();
        long rejectCnt = room.getVoteMap().size() - agreeCnt;

        boolean hasVoted = room.getVoteMap().containsKey(requester);
        boolean canVote  = !hasVoted;                        // ✅ 所有人皆可投 until voted

        return Map.of(
                "agree",      agreeCnt,
                "reject",     rejectCnt,
                "total",      room.getPlayers().size(),
                "canVote",    canVote,
                "hasVoted",   hasVoted,
                "expedition", room.getCurrentExpedition()
        );
    }
    public Room getRoomById(String roomId) {
    return roomRepo.findById(roomId).orElse(null);
    }

}
