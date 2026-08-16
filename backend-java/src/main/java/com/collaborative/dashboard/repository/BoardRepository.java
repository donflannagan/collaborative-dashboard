package com.collaborative.dashboard.repository;

import com.collaborative.dashboard.model.Board;
import java.util.List;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface BoardRepository extends MongoRepository<Board, String> {
    List<Board> findByOwnerOrMembers(String owner, String member);
}
