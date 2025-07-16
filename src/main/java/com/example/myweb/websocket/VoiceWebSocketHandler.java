package com.example.myweb.websocket;

import org.springframework.lang.NonNull;
import org.springframework.stereotype.Component;
import org.springframework.web.socket.*;
import org.springframework.web.socket.handler.BinaryWebSocketHandler;

import java.net.URI;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Component
public class VoiceWebSocketHandler extends BinaryWebSocketHandler {

    private final Map<String, WebSocketSession> sessions = new ConcurrentHashMap<>();

    @Override
    public void afterConnectionEstablished(@NonNull WebSocketSession session) {
        String playerName = getPlayerName(session);
        sessions.put(playerName, session);
        System.out.println("✅ 語音連線建立：" + playerName);
    }

    @Override
    public void handleBinaryMessage(@NonNull WebSocketSession session, @NonNull BinaryMessage message) throws Exception {
        String sender = getPlayerName(session);

        for (Map.Entry<String, WebSocketSession> entry : sessions.entrySet()) {
            String receiver = entry.getKey();
            WebSocketSession wsSession = entry.getValue();

            if (!receiver.equals(sender) && wsSession.isOpen()) {
                wsSession.sendMessage(message);
            }
        }
    }

    @Override
    public void afterConnectionClosed(@NonNull WebSocketSession session, @NonNull CloseStatus status) {
        String playerName = getPlayerName(session);
        sessions.remove(playerName);
        System.out.println("❌ 語音連線關閉：" + playerName);
    }

   private String getPlayerName(WebSocketSession session) {
    URI uri = session.getUri();
    if (uri == null) {
        return "unknown"; // 或者拋出例外、記錄錯誤等
    }
    return uri.toString().substring(uri.toString().lastIndexOf("/") + 1);
}

}
