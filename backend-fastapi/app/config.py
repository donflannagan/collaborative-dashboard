import os
from dotenv import load_dotenv

load_dotenv()

MONGODB_URL = os.getenv('MONGODB_URI', 'mongodb://localhost:27017/collaborative-dashboard')
DATABASE_NAME = os.getenv('MONGO_DB_NAME', 'collaborative-dashboard')
API_PREFIX = '/api/fastapi'
DEBUG = os.getenv('NODE_ENV', 'development') == 'development'
