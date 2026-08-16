from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.controllers.board_controller import get_all_boards, get_boards_by_user
from app.models.board import BoardListResponse

router = APIRouter(prefix='/boards', tags=['boards'])


@router.get('', response_model=BoardListResponse)
async def list_all_boards(db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all boards from database"""
    return await get_all_boards(db)


@router.get('/user/{user_id}', response_model=BoardListResponse)
async def list_user_boards(user_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all boards for a specific user"""
    return await get_boards_by_user(db, user_id)
