from bson import ObjectId


def test_health(client):
    response = client.get('/health')

    assert response.status_code == 200
    assert response.json() == {
        'status': 'ok',
        'service': 'fastapi-backend',
    }


def test_get_all_boards_returns_empty_list(client):
    response = client.get('/boards')

    assert response.status_code == 200
    assert response.json() == {
        'success': True,
        'data': [],
        'count': 0,
    }


def test_get_boards_by_user_returns_empty_list_and_queries_user(fake_database, client):
    user_id = str(ObjectId())

    response = client.get(f'/boards/user/{user_id}')

    assert response.status_code == 200
    assert response.json()['success'] is True
    assert response.json()['count'] == 0
    assert fake_database['boards'].last_query == {
        '$or': [
            {'owner': ObjectId(user_id)},
            {'members': ObjectId(user_id)},
        ]
    }


def test_get_boards_by_user_rejects_invalid_id(client):
    response = client.get('/boards/user/not-an-object-id')

    assert response.status_code == 400
    assert response.json()['detail'] == 'Invalid User ID format'


def test_get_tasks_by_board_returns_empty_list_and_queries_board(fake_database, client):
    board_id = str(ObjectId())

    response = client.get(f'/tasks/board/{board_id}')

    assert response.status_code == 200
    assert response.json() == {
        'success': True,
        'data': [],
        'count': 0,
    }
    assert fake_database['tasks'].last_query == {'boardId': ObjectId(board_id)}


def test_get_tasks_by_board_rejects_invalid_id(client):
    response = client.get('/tasks/board/not-an-object-id')

    assert response.status_code == 400
    assert response.json()['detail'] == 'Invalid Board ID format'
