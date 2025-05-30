package com.example.myweb.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestParam;

@Controller
public class HomeController {
    @GetMapping("/game-start")
    public String gameStartQuery(@RequestParam String roomId) {
        return "game-front-page";   // 遊戲主畫面模板
    }
    @GetMapping("/game-start/{roomId}")
    public String gameStart(@PathVariable String roomId) {
        return "game-start";
    }
    @GetMapping("/")
    public String home() {
        return "index"; // 對應 resources/templates/index.html
    }

    @GetMapping("/about")
    public String about() {
        return "about"; // 對應 resources/templates/about.html
    }

    @GetMapping("/team")
    public String team() {
        return "team"; // 對應 resources/templates/team.html
    }

    @GetMapping("/game")
    public String game() {
        return "game"; // 對應 resources/templates/game.html
    }

    @GetMapping("/game-lobby")
    public String gameLobby() {
        return "game-lobby"; // 對應 resources/templates/game-lobby.html
    }

    @GetMapping("/create-room")
    public String createRoom() {
        return "create-room"; // 對應 resources/templates/create-room.html
    }

    @GetMapping("/join-room-selection")
    public String joinRoomSelection() {
        return "join-room-selection"; // 對應 resources/templates/join-room-selection.html
    }

    @GetMapping("/join-room-public")
    public String joinRoomPublic() {
        return "join-room-public"; // 對應 resources/templates/join-room-public.html
    }

    @GetMapping("/join-room-private")
    public String joinRoomPrivate() {
        return "join-room-private"; // 對應 resources/templates/join-room-private.html
    }

    @GetMapping("/room/{roomId}")
    public String getRoomPage(@PathVariable String roomId) {
        return "room";  // 返回 resources/templates/room.html
    }
    

    @GetMapping("/game-introduction")
    public String gameIntroduction() {
        return "game-introduction"; // 對應 resources/templates/game-introduction.html
    }

    @GetMapping("/character-introduction")
    public String characterIntroduction() {
        return "character-introduction"; // 對應 resources/templates/character-introduction.html
    }
    @GetMapping("/vote")
    public String vote() {
        return "vote";
    }
}
