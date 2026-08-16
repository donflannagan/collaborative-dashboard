from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class UserResponse(BaseModel):
    id: str = Field(alias='_id')
    email: str
    username: str

    class Config:
        populate_by_name = True


class BoardResponse(BaseModel):
    id: str = Field(alias='_id')
    title: str
    description: Optional[str] = None
    owner: UserResponse
    members: list[UserResponse]
    columns: list[str]
    createdAt: datetime
    updatedAt: datetime

    class Config:
        populate_by_name = True


class BoardListResponse(BaseModel):
    success: bool
    data: list[BoardResponse]
    count: int
