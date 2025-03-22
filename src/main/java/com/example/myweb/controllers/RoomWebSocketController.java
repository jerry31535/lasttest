package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import org.springframework.messaging.handler.annotation.MessageMapping;
import org.springframework.messaging.handler.annotation.SendTo;
import org.springframework.stereotype.Controller;

@Controller
public class RoomWebSocketController {

    // 處理創建房間的消息
    @MessageMapping("/create-room")
    @SendTo("/topic/rooms")
    public Room createRoom(Room room) {
        return room; // 返回創建的房間信息
    }

    // 處理加入房間的消息
    @MessageMapping("/join-room")
    @SendTo("/topic/room-updates")
    public String joinRoom(String message) {
        return message; // 返回加入房間的通知
    }
}