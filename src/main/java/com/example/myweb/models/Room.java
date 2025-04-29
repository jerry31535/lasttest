package com.example.myweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.*;

@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    private String roomName;
    private int    playerCount;
    private String roomType;
    private String roomPassword;

    private List<String>             players        = new ArrayList<>();
    private Map<String,String>       avatarMap      = new HashMap<>();
    private Map<String,RoleInfo>     assignedRoles  = new HashMap<>();

    /* 已有 */
    private boolean started = false;

    /* ★★★ 新增：本回合領袖 (用 playerName 當 key) */
    private String currentLeader;

    /* ---------- Getter / Setter ---------- */
    public String getId() { return id; }
    public void   setId(String id) { this.id = id; }

    public String getRoomName() { return roomName; }
    public void   setRoomName(String roomName) { this.roomName = roomName; }

    public int  getPlayerCount() { return playerCount; }
    public void setPlayerCount(int playerCount) { this.playerCount = playerCount; }

    public String getRoomType() { return roomType; }
    public void   setRoomType(String roomType) { this.roomType = roomType; }

    public String getRoomPassword() { return roomPassword; }
    public void   setRoomPassword(String roomPassword) { this.roomPassword = roomPassword; }

    public List<String> getPlayers() { return players; }
    public void         setPlayers(List<String> players) { this.players = players; }

    public Map<String,String> getAvatarMap() { return avatarMap; }
    public void               setAvatarMap(Map<String,String> avatarMap) { this.avatarMap = avatarMap; }

    public Map<String,RoleInfo> getAssignedRoles() { return assignedRoles; }
    public void                 setAssignedRoles(Map<String,RoleInfo> assignedRoles) { this.assignedRoles = assignedRoles; }

    public boolean isStarted() { return started; }
    public void    setStarted(boolean started) { this.started = started; }

    /* ★★★ currentLeader Getter/Setter */
    public String getCurrentLeader() { return currentLeader; }
    public void   setCurrentLeader(String currentLeader) { this.currentLeader = currentLeader; }

    /* ---------- 角色資訊 ---------- */
    public static class RoleInfo {
        private String name;
        private String image;
        public RoleInfo() {}
        public RoleInfo(String name, String image){ this.name=name; this.image=image; }
        public String getName()  { return name;  }
        public void   setName(String name)  { this.name=name; }
        public String getImage() { return image; }
        public void   setImage(String image){ this.image=image; }
    }
}
