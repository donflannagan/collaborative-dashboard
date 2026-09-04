package com.collaborative.dashboard;

import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import com.mongodb.client.MongoDatabase;
import org.junit.jupiter.api.extension.AfterEachCallback;
import org.junit.jupiter.api.extension.BeforeAllCallback;
import org.junit.jupiter.api.extension.ExtensionContext;
import org.testcontainers.containers.MongoDBContainer;

public final class MongoTestFixture implements BeforeAllCallback, AfterEachCallback {
    private static final MongoDBContainer CONTAINER = new MongoDBContainer("mongo:7.0");
    private static MongoClient client;
    private static MongoDatabase database;

    public static MongoDatabase database() {
        return database;
    }

    public static String connectionString() {
        return CONTAINER.getConnectionString();
    }

    @Override
    public void beforeAll(ExtensionContext context) {
        if (!CONTAINER.isRunning()) {
            CONTAINER.start();
            client = MongoClients.create(CONTAINER.getConnectionString());
            database = client.getDatabase("collaborative-dashboard-tests");
        }
    }

    @Override
    public void afterEach(ExtensionContext context) {
        database.getCollection("users").drop();
        database.getCollection("boards").drop();
        database.getCollection("tasks").drop();
    }
}