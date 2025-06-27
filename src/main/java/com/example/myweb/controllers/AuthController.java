package com.example.myweb.controllers;

import com.example.myweb.models.User;
import com.example.myweb.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;


// 標註這是一個 Spring Controller 類別（用於處理 HTTP 請求）
@Controller
public class AuthController {

    // 自動注入 UserService（處理註冊、登入邏輯）
    @Autowired
    private UserService userService;

    // 處理 POST 請求，註冊用戶
    @PostMapping("/auth/do-register")
    @ResponseBody  // 表示回傳的是 JSON，而不是頁面
    public Map<String, Object> register(@RequestBody User user) {
        String username = user.getUsername();
        String password = user.getPassword();

        // 呼叫服務層註冊方法
        boolean success = userService.register(username, password);

        // 回傳結果封裝成 Map（可自動轉為 JSON）
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

    // 處理 POST 請求，登入用戶
    @PostMapping("/auth/do-login")
    @ResponseBody
    public Map<String, Object> login(@RequestBody User user) {
        String username = user.getUsername();
        String password = user.getPassword();

        // 呼叫服務層登入方法
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

    // 處理 GET 請求，登出使用者
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        // 使當前 session 無效，達到登出效果
        request.getSession().invalidate();

        // 登出後重新導向回首頁
        return "redirect:/";
    }
}
