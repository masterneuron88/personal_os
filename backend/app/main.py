from fastapi import FastAPI
from app.auth import router as auth_router
from app.routines import router as routines_router
from app.life_score import router as life_score_router
from app.planning import router as planning_router

app = FastAPI()
app.include_router(auth_router)
app.include_router(routines_router)
app.include_router(life_score_router)
app.include_router(planning_router)


@app.get("/")
def root():
    return {"status": "ok"}
