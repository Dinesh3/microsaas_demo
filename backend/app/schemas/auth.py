from pydantic import BaseModel, EmailStr
from typing import Literal


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    role: str
    name: str
    email: str


class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    role: Literal["admin", "user"] = "user"


class UserOut(BaseModel):
    id: str
    name: str
    email: str
    role: str
    is_active: bool

    class Config:
        from_attributes = True
