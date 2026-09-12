from app.database import SessionLocal
from app.models import User
from app.security import hash_password

email = input("Email: ")
password = input("Password: ")

db = SessionLocal()
user = User(email=email, hashed_password=hash_password(password))
db.add(user)
db.commit()
print(f"Created user: {user.email} (id: {user.id})")
db.close()
