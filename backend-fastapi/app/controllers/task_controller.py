from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase
from bson.objectid import ObjectId
from app.models.task import TaskListResponse, TaskResponse


async def get_tasks_by_board(db: AsyncIOMotorDatabase, board_id: str) -> TaskListResponse:
    """Get all tasks for a specific board"""
    try:
        if not board_id:
            raise HTTPException(status_code=400, detail='Board ID is required')
        
        # Validate ObjectId format
        try:
            board_oid = ObjectId(board_id)
        except:
            raise HTTPException(status_code=400, detail='Invalid Board ID format')
        
        tasks_collection = db['tasks']
        tasks = await tasks_collection.find(
            {'boardId': board_oid}
        ).sort([('columnId', 1), ('position', 1)]).to_list(None)
        
        # Populate assignee and createdBy
        populated_tasks = []
        users_collection = db['users']
        
        for task in tasks:
            task['_id'] = str(task['_id'])
            task['boardId'] = str(task['boardId'])

            # Populate assignee
            if task.get('assignee') and isinstance(task['assignee'], ObjectId):
                assignee = await users_collection.find_one({'_id': task['assignee']})
                if assignee:
                    assignee['_id'] = str(assignee['_id'])
                task['assignee'] = assignee
            
            # Populate createdBy
            if task.get('createdBy') and isinstance(task['createdBy'], ObjectId):
                created_by = await users_collection.find_one({'_id': task['createdBy']})
                if created_by:
                    created_by['_id'] = str(created_by['_id'])
                task['createdBy'] = created_by
            
            populated_tasks.append(task)
        
        return TaskListResponse(
            success=True,
            data=populated_tasks,
            count=len(populated_tasks)
        )
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
