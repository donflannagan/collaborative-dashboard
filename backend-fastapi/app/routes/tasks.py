from fastapi import APIRouter, Depends
from motor.motor_asyncio import AsyncIOMotorDatabase
from app.database import get_database
from app.controllers.task_controller import get_tasks_by_board
from app.models.task import TaskListResponse

router = APIRouter(prefix='/tasks', tags=['tasks'])


@router.get('/board/{board_id}', response_model=TaskListResponse)
async def list_board_tasks(board_id: str, db: AsyncIOMotorDatabase = Depends(get_database)):
    """Get all tasks for a specific board"""
    return await get_tasks_by_board(db, board_id)
