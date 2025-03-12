package com.example.myweb.controllers;

import com.example.myweb.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @PostMapping("/auth/do-register")
    @ResponseBody
    public Map<String, Object> register(@RequestBody Map<String, String> userData) {
        String username = userData.get("username");
        String password = userData.get("password");

        Map<String, Object> response = new HashMap<>();
        if (userService.register(username, password)) {
            response.put("success", true);
            response.put("message", "註冊成功！");
        } else {
            response.put("success", false);
            response.put("message", "帳號已存在！");
        }
        return response;
    }

    @PostMapping("/auth/do-login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody Map<String, String> userData) {
        String username = userData.get("username");
        String password = userData.get("password");

        Map<String, Object> response = new HashMap<>();
        if (userService.login(username, password)) {
            response.put("success", true);
            response.put("message", "登入成功！");
            response.put("redirect", "/game-lobby");
        } else {
            response.put("success", false);
            response.put("message", "帳號或密碼錯誤！");
        }
        return response;
    }

    // 登出方法
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        request.getSession().invalidate(); // 清除 session
        return "redirect:/"; // 重定向回首頁
    }
}
