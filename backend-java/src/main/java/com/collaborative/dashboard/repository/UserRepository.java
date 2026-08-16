package com.collaborative.dashboard.repository;

import com.collaborative.dashboard.model.User;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface UserRepository extends MongoRepository<User, String> {
}
