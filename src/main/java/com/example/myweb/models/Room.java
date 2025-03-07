package com.example.myweb.models;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.util.ArrayList;
import java.util.List;

@Document(collection = "rooms")
public class Room {

    @Id
    private String id;
    private String roomName;
    private boolean isPrivate;
    private String password;
    private int maxPlayers;
    private List<String> players;
    private boolean gameStarted;  // 表示遊戲是否已經開始

    public Room() {
        this.players = new ArrayList<>();
        this.gameStarted = false;  // 默認遊戲未開始
    }

    // Getter 和 Setter 方法
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

    public boolean isPrivate() {
        return isPrivate;
    }

    public void setPrivate(boolean aPrivate) {
        isPrivate = aPrivate;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public int getMaxPlayers() {
        return maxPlayers;
    }

    public void setMaxPlayers(int maxPlayers) {
        this.maxPlayers = maxPlayers;
    }

    public List<String> getPlayers() {
        return players;
    }

    public void setPlayers(List<String> players) {
        this.players = players;
    }

    public boolean isGameStarted() {
        return gameStarted;
    }

    public void setGameStarted(boolean gameStarted) {
        this.gameStarted = gameStarted;
    }

    // 加入玩家
    public void addPlayer(String player) {
        if (this.players.size() < this.maxPlayers) {
            this.players.add(player);
        }
    }

    // 移除玩家
    public void removePlayer(String player) {
        this.players.remove(player);
    }
}
