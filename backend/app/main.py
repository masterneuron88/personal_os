from fastapi import FastAPI
from app.auth import router as auth_router
from app.routines import router as routines_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(routines_router)


@app.get("/")
def root():
    return {"status": "ok"}
