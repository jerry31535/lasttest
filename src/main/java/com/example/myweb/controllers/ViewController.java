package com.example.myweb.controllers;

import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

@Controller
public class ViewController {

    @GetMapping("/game-play/{roomId}")
    public String redirectToFrontPage(@PathVariable String roomId) {
        return "redirect://game-front-page.html?roomId=" + roomId;
    }
}
