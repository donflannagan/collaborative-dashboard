from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson.objectid import ObjectId
from app.models.board import BoardListResponse, BoardResponse


async def _populate_board(board: dict, users_collection) -> dict:
    """Stringify ObjectIds and resolve owner/member user summaries."""
    board['_id'] = str(board['_id'])

    if isinstance(board.get('owner'), ObjectId):
        owner = await users_collection.find_one({'_id': board['owner']})
        if owner:
            owner['_id'] = str(owner['_id'])
        board['owner'] = owner

    members = []
    for member_id in board.get('members', []):
        if isinstance(member_id, ObjectId):
            member = await users_collection.find_one({'_id': member_id})
            if member:
                member['_id'] = str(member['_id'])
                members.append(member)
    board['members'] = members

    return board


async def get_all_boards(db: AsyncIOMotorDatabase) -> BoardListResponse:
    """Get all boards from database"""
    try:
        boards_collection = db['boards']
        users_collection = db['users']
        boards = await boards_collection.find().to_list(None)

        populated_boards = [await _populate_board(board, users_collection) for board in boards]

        return BoardListResponse(
            success=True,
            data=populated_boards,
            count=len(populated_boards)
        )
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


async def get_boards_by_user(db: AsyncIOMotorDatabase, user_id: str) -> BoardListResponse:
    """Get boards for a specific user"""
    try:
        if not user_id:
            raise HTTPException(status_code=400, detail='User ID is required')
        
        # Validate ObjectId format
        try:
            user_oid = ObjectId(user_id)
        except:
            raise HTTPException(status_code=400, detail='Invalid User ID format')
        
        boards_collection = db['boards']
        users_collection = db['users']
        boards = await boards_collection.find({
            '$or': [
                {'owner': user_oid},
                {'members': user_oid}
            ]
        }).to_list(None)

        populated_boards = [await _populate_board(board, users_collection) for board in boards]

        return BoardListResponse(
            success=True,
            data=populated_boards,
            count=len(populated_boards)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
