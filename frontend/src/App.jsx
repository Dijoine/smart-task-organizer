import React, { useState, useEffect } from 'react';
import './App.css';

const API_URL = 'http://localhost:8000';

function App() {
  const [tasks, setTasks] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    deadline: '',
    category: 'general'
  });

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}/tasks/`);
      const data = await response.json();
      setTasks(data.tasks);
    } catch (error) {
      console.error('Error loading tasks:', error);
    }
  };

  const loadRecommendations = async () => {
    try {
      const response = await fetch(`${API_URL}/recommendations/`);
      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (error) {
      console.error('Error loading recommendations:', error);
    }
  };

  const createTask = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/tasks/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTask),
      });
      
      const result = await response.json();
      alert(`Задача создана! Приоритет: ${result.priority}`);
      
      setNewTask({
        title: '',
        description: '',
        deadline: '',
        category: 'general'
      });
      
      loadTasks();
      loadRecommendations();
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  useEffect(() => {
    loadTasks();
    loadRecommendations();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high': return '#ff4444';
      case 'medium': return '#ffaa00';
      case 'low': return '#44ff44';
      default: return '#cccccc';
    }
  };

  return (
    <div className="App">
      <header className="app-header">
        <h1>🎯 Умный органайзер задач</h1>
        <p>Ваш интеллектуальный помощник в планировании</p>
      </header>

      <div className="container">
        <section className="task-form">
          <h2>Добавить новую задачу</h2>
          <form onSubmit={createTask}>
            <input
              type="text"
              placeholder="Название задачи"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              required
            />
            <textarea
              placeholder="Описание"
              value={newTask.description}
              onChange={(e) => setNewTask({...newTask, description: e.target.value})}
            />
            <input
              type="date"
              value={newTask.deadline}
              onChange={(e) => setNewTask({...newTask, deadline: e.target.value})}
              required
            />
            <select
              value={newTask.category}
              onChange={(e) => setNewTask({...newTask, category: e.target.value})}
            >
              <option value="general">Общее</option>
              <option value="work">Работа</option>
              <option value="study">Учеба</option>
              <option value="personal">Личное</option>
            </select>
            <button type="submit">Добавить задачу</button>
          </form>
        </section>

        <section className="recommendations">
          <h2>💡 Рекомендуемые задачи на сегодня</h2>
          <div className="recommendations-list">
            {recommendations.map(rec => (
              <div key={rec.id} className="recommendation-card">
                <span className="priority-dot" style={{backgroundColor: getPriorityColor(rec.priority)}}></span>
                <div className="rec-content">
                  <h4>{rec.title}</h4>
                  <p>Дедлайн: {rec.deadline}</p>
                  <span className={`priority-badge ${rec.priority}`}>
                    {rec.priority === 'high' ? 'Высокий' : rec.priority === 'medium' ? 'Средний' : 'Низкий'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="all-tasks">
          <h2>Все задачи ({tasks.length})</h2>
          <div className="tasks-list">
            {tasks.map(task => (
              <div key={task.id} className="task-card">
                <div className="task-header">
                  <h3>{task.title}</h3>
                  <span className="priority" style={{color: getPriorityColor(task.priority)}}>
                    {task.priority === 'high' ? '🔥 Высокий' : task.priority === 'medium' ? '⚠️ Средний' : '✅ Низкий'}
                  </span>
                </div>
                <p className="task-description">{task.description}</p>
                <div className="task-meta">
                  <span>📅 {task.deadline}</span>
                  <span>📁 {task.category}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

export default App;
