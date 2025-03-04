package com.example.myweb;

import com.example.myweb.models.User;
import com.example.myweb.repositories.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class TestUserRepository implements CommandLineRunner {
    private final UserRepository userRepository;

    public TestUserRepository(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Override
    public void run(String... args) {
        // 測試儲存一個 User
        if (!userRepository.existsByUsername("testuser")) {
            User user = new User("testuser", "password123");
            userRepository.save(user);
            System.out.println("測試使用者已儲存到 MongoDB");
        } else {
            System.out.println("測試使用者已存在");
        }

        // 測試查詢 User
        userRepository.findByUsername("testuser").ifPresent(user -> 
            System.out.println("找到使用者：" + user.getUsername())
        );
    }
}
