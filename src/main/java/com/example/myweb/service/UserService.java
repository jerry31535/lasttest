package com.example.myweb.service;

import com.example.myweb.models.User;
import com.example.myweb.repositories.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    // 登入邏輯
    public boolean login(String username, String password) {
        // 使用 Optional 來處理返回的結果
        Optional<User> userOptional = userRepository.findByUsername(username);
        
        // 檢查 userOptional 是否存在
        if (userOptional.isPresent()) {
            User user = userOptional.get();
            // 檢查密碼是否匹配
            return user.getPassword().equals(password);
        }
        return false; // 如果用戶不存在
    }

    // 註冊邏輯
    public boolean register(String username, String password) {
        // 檢查帳號是否已存在
        if (userRepository.existsByUsername(username)) {
            return false; // 帳號已存在，無法註冊
        }
        
        // 創建新用戶並保存到資料庫
        User newUser = new User(username, password);
        userRepository.save(newUser);
        return true; // 註冊成功
    }
}
