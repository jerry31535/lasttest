package com.example.myweb.config;


import org.springframework.beans.factory.annotation.Autowired;
// 匯入相關的 Spring WebSocket 設定類別與註解
import org.springframework.context.annotation.Configuration;
import org.springframework.lang.NonNull;
import org.springframework.messaging.simp.config.MessageBrokerRegistry;
import org.springframework.web.socket.config.annotation.EnableWebSocketMessageBroker;
import org.springframework.web.socket.config.annotation.StompEndpointRegistry;
import org.springframework.web.socket.config.annotation.WebSocketMessageBrokerConfigurer;

// 表示這是一個設定類別
@Configuration

// 啟用 WebSocket 消息代理（Message Broker）的功能（使用 STOMP 協定）
@EnableWebSocketMessageBroker
public class WebSocketConfig implements WebSocketMessageBrokerConfigurer {

   
    // 設定訊息代理（Message Broker）
    @Override
    public void configureMessageBroker(@NonNull MessageBrokerRegistry config) {
        // 啟用一個簡易的內建訊息代理，處理訂閱前綴為 "/topic" 的訊息
        config.enableSimpleBroker("/topic");

        // 設定應用程式傳送訊息的目的地前綴為 "/app"
        // 也就是說，Controller 中使用 @MessageMapping 的路徑會以 "/app" 為開頭
        config.setApplicationDestinationPrefixes("/app");
    }

    // 註冊 STOMP 端點，供前端連線 WebSocket 使用
    @Override
    public void registerStompEndpoints(@NonNull StompEndpointRegistry registry) {
        // 註冊一個名為 "/ws" 的端點，允許任何來源跨域連線
        // 並啟用 SockJS 作為備用傳輸方式（適用於瀏覽器不支援 WebSocket 的情況）
        registry.addEndpoint("/ws").setAllowedOriginPatterns("*").withSockJS();
    }
}
