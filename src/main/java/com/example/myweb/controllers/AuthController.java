package com.example.myweb.controllers;

import com.example.myweb.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.servlet.http.HttpServletRequest;
import java.util.HashMap;
import java.util.Map;

@Controller
public class AuthController {

    @Autowired
    private UserService userService;

    @GetMapping("/auth/do-register")
    @ResponseBody
    public Map<String, Object> register(@RequestParam String username, @RequestParam String password) {
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

    @GetMapping("/auth/do-login")
    @ResponseBody
    public Map<String, Object> login(@RequestParam String username, @RequestParam String password) {
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

    // 登出方法
    @GetMapping("/logout")
    public String logout(HttpServletRequest request) {
        // 清除會話
        request.getSession().invalidate();
        return "redirect:/"; // 重定向回首頁
    }
}