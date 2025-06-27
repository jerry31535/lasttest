package com.example.myweb.models;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.HashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

/**
 * Room.java
 *
 * ▶ 遊戲房間資料模型，儲存每場遊戲的所有狀態。
 */
@Document(collection = "rooms")
public class Room {

    /* 🧾 基本欄位 */
    @Id
    private String id;
    private String roomName;
    private int playerCount;
    private String roomType;
    private String roomPassword;

    private List<String> players = new ArrayList<>();
    private Map<String, String> avatarMap = new HashMap<>();

    /* 🧙‍♂️ 角色資訊 */
    private Map<String, RoleInfo> assignedRoles = new HashMap<>();

    /* 🟢 遊戲狀態 */
    private boolean started = false;
    private String currentLeader;

    /* 🔥 投票階段 */
    private List<String> currentExpedition = new ArrayList<>();
    private Map<String, Boolean> voteMap = new HashMap<>();

    /* 🃏 任務卡階段 */
    private Map<String, String> missionCards = new HashMap<>();
    private boolean missionSubmitted = false;

    /* 🧾 任務階段（記錄交卡人） */
    private Set<String> finishedMissions = new HashSet<>();

    /* ✨ 技能階段狀態 */
    private Set<String> finishedSkills = new HashSet<>();
    private boolean skillPhaseFinished = false;

    /* 🧩 Getter / Setter 區塊 */
    public String getId() { return id; }
    public void setId(String id) { this.id = id; }

    public String getRoomName() { return roomName; }
    public void setRoomName(String roomName) { this.roomName = roomName; }

    public int getPlayerCount() { return playerCount; }
    public void setPlayerCount(int playerCount) { this.playerCount = playerCount; }

    public String getRoomType() { return roomType; }
    public void setRoomType(String roomType) { this.roomType = roomType; }

    public String getRoomPassword() { return roomPassword; }
    public void setRoomPassword(String roomPassword) { this.roomPassword = roomPassword; }

    public List<String> getPlayers() { return players; }
    public void setPlayers(List<String> players) { this.players = players; }

    public Map<String, String> getAvatarMap() { return avatarMap; }
    public void setAvatarMap(Map<String, String> avatarMap) { this.avatarMap = avatarMap; }

    public Map<String, RoleInfo> getAssignedRoles() { return assignedRoles; }
    public void setAssignedRoles(Map<String, RoleInfo> assignedRoles) { this.assignedRoles = assignedRoles; }

    public boolean isStarted() { return started; }
    public void setStarted(boolean started) { this.started = started; }

    public String getCurrentLeader() { return currentLeader; }
    public void setCurrentLeader(String currentLeader) { this.currentLeader = currentLeader; }

    public List<String> getCurrentExpedition() { return currentExpedition; }
    public void setCurrentExpedition(List<String> currentExpedition) { this.currentExpedition = currentExpedition; }

    public Map<String, Boolean> getVoteMap() { return voteMap; }
    public void setVoteMap(Map<String, Boolean> voteMap) { this.voteMap = voteMap; }

    public Map<String, String> getMissionCards() { return missionCards; }
    public void setMissionCards(Map<String, String> missionCards) { this.missionCards = missionCards; }

    public boolean isMissionSubmitted() { return missionSubmitted; }
    public void setMissionSubmitted(boolean missionSubmitted) { this.missionSubmitted = missionSubmitted; }

    public Set<String> getFinishedMissions() { return finishedMissions; }
    public void setFinishedMissions(Set<String> finishedMissions) { this.finishedMissions = finishedMissions; }

    public Set<String> getFinishedSkills() { return finishedSkills; }
    public void setFinishedSkills(Set<String> finishedSkills) { this.finishedSkills = finishedSkills; }

    public boolean isSkillPhaseFinished() { return skillPhaseFinished; }
    public void setSkillPhaseFinished(boolean skillPhaseFinished) { this.skillPhaseFinished = skillPhaseFinished; }

    /* 🎭 角色類別 */
    public static class RoleInfo {
        private String name;
        private String image;

        public RoleInfo() {}

        public RoleInfo(String name, String image) {
            this.name = name;
            this.image = image;
        }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public String getImage() { return image; }
        public void setImage(String image) { this.image = image; }
    }
}
