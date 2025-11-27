from fastapi import FastAPI
from pydantic import BaseModel
from datetime import date
from enum import Enum
import sqlite3
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse

app = FastAPI(title="Smart Task Organizer")

# CORS для production
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "https://smart-task-organizer.vercel.app",
        "https://smart-task-organizer-*.vercel.app"
    ],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allow_headers=["*"],
)


class Priority(str, Enum):
    LOW = "low"
    MEDIUM = "medium"
    HIGH = "high"


class Task(BaseModel):
    title: str
    description: str = ""
    deadline: date
    category: str = "general"


def init_db():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS tasks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT,
            deadline DATE,
            category TEXT,
            priority TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    conn.commit()
    conn.close()


def predict_priority(task: Task) -> Priority:
    days_until_deadline = (task.deadline - date.today()).days

    if days_until_deadline <= 1:
        return Priority.HIGH
    elif days_until_deadline <= 3:
        return Priority.MEDIUM
    else:
        return Priority.LOW


@app.options("/tasks/")
async def options_tasks():
    return JSONResponse(content={"message": "OK"})


@app.post("/tasks/")
def create_task(task: Task):
    priority = predict_priority(task)

    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()

    cursor.execute('''
        INSERT INTO tasks (title, description, deadline, category, priority)
        VALUES (?, ?, ?, ?, ?)
    ''', (task.title, task.description, task.deadline.isoformat(), task.category, priority))

    task_id = cursor.lastrowid
    conn.commit()
    conn.close()

    return {"id": task_id, "priority": priority, "message": "Task created successfully"}


@app.get("/tasks/")
def get_tasks():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()

    cursor.execute('SELECT * FROM tasks ORDER BY deadline ASC')
    tasks = cursor.fetchall()
    conn.close()

    return {
        "tasks": [
            {
                "id": task[0],
                "title": task[1],
                "description": task[2],
                "deadline": task[3],
                "category": task[4],
                "priority": task[5],
                "created_at": task[6]
            }
            for task in tasks
        ]
    }


@app.get("/recommendations/")
def get_recommendations():
    conn = sqlite3.connect('tasks.db')
    cursor = conn.cursor()

    cursor.execute('''
        SELECT * FROM tasks 
        WHERE priority = 'high' 
        ORDER BY deadline ASC 
        LIMIT 5
    ''')
    recommendations = cursor.fetchall()
    conn.close()

    return {
        "recommendations": [
            {
                "id": task[0],
                "title": task[1],
                "deadline": task[3],
                "priority": task[5]
            }
            for task in recommendations
        ]
    }


init_db()

if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="0.0.0.0", port=8000)
