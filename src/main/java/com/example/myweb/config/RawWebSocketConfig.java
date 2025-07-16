package com.example.myweb.config;

import org.springframework.lang.NonNull;
import com.example.myweb.websocket.VoiceWebSocketHandler;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Configuration;
import org.springframework.web.socket.config.annotation.WebSocketConfigurer;
import org.springframework.web.socket.config.annotation.WebSocketHandlerRegistry;

@Configuration
public class RawWebSocketConfig implements WebSocketConfigurer {

    @Autowired
    private VoiceWebSocketHandler voiceHandler;

    @Override
    public void registerWebSocketHandlers(@NonNull WebSocketHandlerRegistry registry) {

        registry.addHandler(voiceHandler, "/voice/{playerName}")
                .setAllowedOrigins("*");
    }
}
