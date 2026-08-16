from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str = Field(alias='_id')
    email: str
    username: str

    class Config:
        populate_by_name = True


class TaskResponse(BaseModel):
    id: str = Field(alias='_id')
    title: str
    description: Optional[str] = None
    boardId: str
    columnId: str
    position: int
    assignee: Optional[UserResponse] = None
    priority: Optional[str] = None
    dueDate: Optional[datetime] = None
    tags: Optional[list[str]] = None
    createdBy: UserResponse
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True


class TaskListResponse(BaseModel):
    success: bool
    data: list[TaskResponse]
    count: int
