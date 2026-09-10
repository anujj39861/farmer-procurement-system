import os

SECRET_KEY = os.getenv("SECRET_KEY", "farmer-procurement-super-secret-key-2026")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24  # 24 hours

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./farmer_procurement.db")
