package com.example.myweb.models;

public class MissionRecord {
    private int successCount;
    private int failCount;

    public MissionRecord(int successCount, int failCount) {
        this.successCount = successCount;
        this.failCount = failCount;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public int getFailCount() {
        return failCount;
    }
}
