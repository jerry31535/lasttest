package com.example.myweb.controllers;

import com.example.myweb.models.Room;
import com.example.myweb.repositories.RoomRepository;
import org.springframework.stereotype.Controller;
import org.springframework.ui.Model;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Optional;

@Controller
public class RoomController {

    private final RoomRepository roomRepository;

    // 注入 RoomRepository
    public RoomController(RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
    }

    // 顯示所有房間
    @GetMapping("/rooms")
    public String getAllRooms(Model model) {
        List<Room> rooms = roomRepository.findAll();
        model.addAttribute("rooms", rooms);
        return "roomList";  // 返回房間列表頁面
    }

    // 創建新房間
    @PostMapping("/rooms/create")
    public String createRoom(@RequestParam String roomName,
                             @RequestParam boolean isPrivate,
                             @RequestParam int maxPlayers,
                             @RequestParam(required = false) String password,
                             Model model) {
        Room room = new Room();
        room.setRoomName(roomName);
        room.setPrivate(isPrivate);
        room.setMaxPlayers(maxPlayers);
        if (isPrivate && password != null && !password.isEmpty()) {
            room.setPassword(password);
        }
        roomRepository.save(room);
        return "redirect:/rooms";  // 創建後重定向到房間列表
    }

    // 顯示房間詳細頁面
    @GetMapping("/rooms/roomPage/{roomName}")
    public String getRoomPage(@PathVariable String roomName, Model model) {
        Optional<Room> roomOptional = roomRepository.findByRoomName(roomName);
        if (roomOptional.isPresent()) {
            model.addAttribute("room", roomOptional.get());
            return "roomPage";  // 返回房間頁面
        }
        return "redirect:/rooms";  // 房間不存在則重定向到房間列表
    }

    // 加入房間
    @PostMapping("/rooms/join/{roomName}")
    public String joinRoom(@PathVariable String roomName,
                           @RequestParam String username,
                           @RequestParam(required = false) String password,
                           Model model) {
        Optional<Room> roomOptional = roomRepository.findByRoomName(roomName);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            if (room.isPrivate() && (password == null || !room.getPassword().equals(password))) {
                model.addAttribute("error", "密碼錯誤！");
                return "roomList";  // 如果是私密房間且密碼錯誤，返回房間列表
            }
            room.addPlayer(username);
            roomRepository.save(room);  // 更新房間，加入玩家
            return "redirect:/rooms/roomPage/" + roomName;  // 重定向到該房間頁面
        }
        model.addAttribute("error", "房間不存在！");
        return "roomList";  // 房間不存在則返回房間列表
    }

    // 開始遊戲
    @PostMapping("/rooms/startGame/{roomName}")
    public String startGame(@PathVariable String roomName) {
        Optional<Room> roomOptional = roomRepository.findByRoomName(roomName);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            if (room.getPlayers().size() >= 5) {
                // 開始遊戲邏輯
                room.setGameStarted(true);
                roomRepository.save(room);
                return "gameStarted";  // 你可以實現遊戲開始頁面
            }
            return "redirect:/rooms/roomPage/" + roomName;  // 玩家人數不足則返回房間頁面
        }
        return "redirect:/rooms";  // 房間不存在則重定向到房間列表
    }

    // 玩家退出房間
    @PostMapping("/rooms/leave/{roomName}")
    public String leaveRoom(@PathVariable String roomName, @RequestParam String username, Model model) {
        Optional<Room> roomOptional = roomRepository.findByRoomName(roomName);
        if (roomOptional.isPresent()) {
            Room room = roomOptional.get();
            room.removePlayer(username);  // 從房間中移除玩家
            roomRepository.save(room);
            if (room.getPlayers().isEmpty()) {
                roomRepository.delete(room);  // 如果沒有玩家，刪除房間
            }
            return "redirect:/rooms";  // 返回房間列表
        }
        return "redirect:/rooms";  // 如果房間不存在，重定向到房間列表
    }
}
