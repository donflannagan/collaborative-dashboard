package com.collaborative.dashboard.repository;

import com.collaborative.dashboard.model.Board;
import java.util.List;
import org.bson.types.ObjectId;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;

public interface BoardRepository extends MongoRepository<Board, String> {
    // owner/members are stored as BSON ObjectId; the domain field is String, so
    // filters must be built with ObjectId explicitly rather than a derived query.
    @Query("{ '$or': [ { 'owner': ?0 }, { 'members': ?0 } ] }")
    List<Board> findByOwnerOrMembers(ObjectId userId);
}
