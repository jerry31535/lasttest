package com.example.myweb.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
@Document(collection = "rooms")
public class Room {
    @Id
    private String id;
    private String roomName;
    private int playerCount;
    private String roomType;
    private String roomPassword;
    private List<String> players = new ArrayList<>(); // 新增 players 欄位
    private Map<String, String> avatarMap = new HashMap<>(); // 玩家名稱 → 頭像名稱
    public Map<String, String> getAvatarMap() {
        return avatarMap;
    }
    
    public void setAvatarMap(Map<String, String> avatarMap) {
        this.avatarMap = avatarMap;
    }
    
    // Getter 和 Setter
    public String getId() {
        return id;
    }

    public void setId(String id) {
        this.id = id;
    }

    public String getRoomName() {
        return roomName;
    }

    public void setRoomName(String roomName) {
        this.roomName = roomName;
    }

    public int getPlayerCount() {
        return playerCount;
    }

    public void setPlayerCount(int playerCount) {
        this.playerCount = playerCount;
    }

    public String getRoomType() {
        return roomType;
    }

    public void setRoomType(String roomType) {
        this.roomType = roomType;
    }

    public String getRoomPassword() {
        return roomPassword;
    }

    public void setRoomPassword(String roomPassword) {
        this.roomPassword = roomPassword;
    }

    public List<String> getPlayers() {
        return players;
    }

    public void setPlayers(List<String> players) {
        this.players = players;
    }
}