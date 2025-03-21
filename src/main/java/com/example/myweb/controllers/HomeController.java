package com.example.myweb.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class HomeController {

    @GetMapping("/")
    public String home() {
        return "index"; // 會對應到 resources/templates/index.html
    }

    @GetMapping("/about")
    public String about() {
        return "about"; // 會對應到 resources/templates/about.html
    }

    @GetMapping("/team")
    public String team() {
        return "team"; // 會對應到 resources/templates/team.html
    }

    @GetMapping("/game")
    public String game() {
        return "game"; // 對應 resources/templates/game.html
    }


    @GetMapping("/game-lobby")
    public String gameLobby() {
        return "game-lobby"; // 這裡對應 src/main/resources/templates/game-lobby.html
    }

    @GetMapping("/create-room")
    public String createRoom() {
        return "create-room"; // 對應 resources/templates/create-room.html
    }

    @GetMapping("/join-room")
    public String joinRoom() {
        return "join-room"; // 對應 resources/templates/join-room.html
    }

    @GetMapping("/room/{roomId}")
    public String getRoomPage(@PathVariable String roomId) {
        return "room";  // 返回 room.html
    }

    @GetMapping("/game-introduction")
    public String gameintroduction() {
        return "game-introduction"; // 對應 resources/templates/game-introduction.html
    }

    @GetMapping("/character-introduction")
    public String characterintroduction() {
        return "character-introduction"; // 對應 resources/templates/character-introduction.html
    }
    
    
}
