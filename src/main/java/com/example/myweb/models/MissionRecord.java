package com.example.myweb.models;

import java.util.HashMap;
import java.util.Map;

public class MissionRecord {
    private int successCount;
    private int failCount;
    private Map<String, String> cardMap = new HashMap<>();  // ✅ 新增：記錄每位玩家交什麼卡

    public MissionRecord(int successCount, int failCount) {
        this.successCount = successCount;
        this.failCount = failCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailCount() {
        return failCount;
    }

    public void setFailCount(int failCount) {
        this.failCount = failCount;
    }

    public Map<String, String> getCardMap() {
        return cardMap;
    }

    public void setCardMap(Map<String, String> cardMap) {
        this.cardMap = cardMap;
    }
}
