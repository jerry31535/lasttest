package com.example.myweb.controllers;

import com.example.myweb.models.User; // ✅ 加上這一行！
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
    public Map<String, Object> register(@RequestBody User user) {
        String username = user.getUsername();
        String password = user.getPassword();

        boolean success = userService.register(username, password);
        Map<String, Object> response = new HashMap<>();
        if (success) {
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
public Map<String, Object> login(@RequestBody User user) {
    String username = user.getUsername();
    String password = user.getPassword();

    boolean success = userService.login(username, password);
    Map<String, Object> response = new HashMap<>();
    if (success) {
        response.put("success", true);
        response.put("message", "登入成功！");
    } else {
        response.put("success", false);
        response.put("message", "帳號或密碼錯誤！");
    }
    return response;
}

    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        request.getSession().invalidate();
        return "redirect:/";
    }
}
