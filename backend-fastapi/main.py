from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
import logging
from app.config import API_PREFIX, DEBUG
from app.database import connect_to_mongo, close_mongo_connection
from app.routes import boards, tasks

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan context manager for startup and shutdown"""
    # Startup
    print('🚀 Starting FastAPI backend...')
    await connect_to_mongo()
    yield
    # Shutdown
    print('⛔ Shutting down FastAPI backend...')
    await close_mongo_connection()


# Create FastAPI app
app = FastAPI(
    title='Collaborative Dashboard - FastAPI Backend',
    description='FastAPI implementation of task management API',
    version='1.0.0',
    docs_url='/docs',
    redoc_url='/redoc',
    openapi_url='/openapi.json',
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=True,
    allow_methods=['*'],
    allow_headers=['*'],
)


# Health check endpoint
@app.get('/health')
async def health_check():
    return {
        'status': 'ok',
        'service': 'fastapi-backend',
    }


# Include routers
app.include_router(boards.router)
app.include_router(tasks.router)


# Root endpoint
@app.get('/')
async def root():
    return {
        'message': 'Collaborative Dashboard - FastAPI Backend',
        'version': '1.0.0',
        'docs': f'{API_PREFIX}/docs',
        'endpoints': {
            'boards': {
                'all': f'{API_PREFIX}/boards',
                'by_user': f'{API_PREFIX}/boards/user/{{user_id}}',
            },
            'tasks': {
                'by_board': f'{API_PREFIX}/tasks/board/{{board_id}}',
            },
        },
    }


if __name__ == '__main__':
    import uvicorn
    uvicorn.run(
        'main:app',
        host='0.0.0.0',
        port=5001,
        reload=DEBUG,
    )
