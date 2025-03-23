package com.example.myweb.repositories;

import com.example.myweb.models.Room;
import org.springframework.data.mongodb.repository.MongoRepository;
import java.util.Optional;

public interface RoomRepository extends MongoRepository<Room, String> {
    boolean existsByRoomName(String roomName);
    Optional<Room> findByRoomName(String roomName);
    
}
