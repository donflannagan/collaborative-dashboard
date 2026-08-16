import pytest
from fastapi.testclient import TestClient

from app.database import get_database
from main import app


class FakeCursor:
    def __init__(self, documents):
        self.documents = documents

    def sort(self, _fields):
        return self

    async def to_list(self, _length):
        return self.documents


class FakeCollection:
    def __init__(self, documents=None):
        self.documents = documents or []
        self.last_query = None

    def find(self, query=None):
        self.last_query = query
        return FakeCursor(self.documents)

    async def find_one(self, _query):
        return None


class FakeDatabase:
    def __init__(self):
        self.collections = {
            'boards': FakeCollection(),
            'tasks': FakeCollection(),
            'users': FakeCollection(),
        }

    def __getitem__(self, collection_name):
        return self.collections[collection_name]


@pytest.fixture
def fake_database():
    return FakeDatabase()


@pytest.fixture
def client(fake_database, monkeypatch):
    async def no_database_connection():
        return None

    async def no_database_disconnect():
        return None

    monkeypatch.setattr('main.connect_to_mongo', no_database_connection)
    monkeypatch.setattr('main.close_mongo_connection', no_database_disconnect)
    app.dependency_overrides[get_database] = lambda: fake_database

    with TestClient(app) as test_client:
        yield test_client

    app.dependency_overrides.clear()
