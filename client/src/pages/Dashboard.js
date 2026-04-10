import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/dashboard.css';

const STATUSES = ['Todo', 'In Progress', 'In Review', 'Done'];
const PRIORITIES = ['Low', 'Medium', 'High', 'Critical'];

const priorityColor = { Low: '#4caf50', Medium: '#ff9800', High: '#f44336', Critical: '#9c27b0' };
const statusColor = {
  Todo: '#6b7280',
  'In Progress': '#3b82f6',
  'In Review': '#f59e0b',
  Done: '#10b981',
};

const emptyForm = { title: '', description: '', status: 'Todo', priority: 'Medium', dueDate: '' };

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editTask, setEditTask] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [filter, setFilter] = useState('All');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const fetchTasks = useCallback(async () => {
    try {
      const params = filter !== 'All' ? { status: filter } : {};
      const { data } = await axios.get('/api/tasks', { params });
      setTasks(data);
    } catch {
      setError('Error al cargar tareas');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  const openCreate = () => { setEditTask(null); setForm(emptyForm); setShowModal(true); };
  const openEdit = (task) => {
    setEditTask(task);
    setForm({
      title: task.title,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      dueDate: task.dueDate ? task.dueDate.slice(0, 10) : '',
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editTask) {
        const { data } = await axios.put(`/api/tasks/${editTask._id}`, form);
        setTasks(tasks.map(t => t._id === data._id ? data : t));
      } else {
        const { data } = await axios.post('/api/tasks', form);
        setTasks([data, ...tasks]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('¿Eliminar esta tarea?')) return;
    try {
      await axios.delete(`/api/tasks/${id}`);
      setTasks(tasks.filter(t => t._id !== id));
    } catch {
      setError('Error al eliminar');
    }
  };

  const handleLogout = () => { logout(); navigate('/login'); };

  const tasksByStatus = STATUSES.reduce((acc, s) => {
    acc[s] = tasks.filter(t => t.status === s);
    return acc;
  }, {});

  const initials = (name) => name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="dashboard">
      {/* Navbar */}
      <nav className="dash-nav">
        <div className="nav-left">
          <div className="nav-logo">AX</div>
          <span className="nav-title">AdminExpress</span>
        </div>
        <div className="nav-right">
          <div className="user-chip">
            <div className="avatar">{initials(user?.name)}</div>
            <div className="user-info">
              <span className="user-name">{user?.name}</span>
              <span className="user-role">{user?.role}</span>
            </div>
          </div>
          <button className="btn-logout" onClick={handleLogout}>Salir</button>
        </div>
      </nav>

      {/* Header */}
      <div className="dash-header">
        <div>
          <h1>Panel de Tareas</h1>
          <p>Bienvenido, <strong>{user?.name}</strong> — {tasks.length} tarea{tasks.length !== 1 ? 's' : ''} en total</p>
        </div>
        <button className="btn-create" onClick={openCreate}>+ Nueva Tarea</button>
      </div>

      {/* Filtros */}
      <div className="filter-bar">
        {['All', ...STATUSES].map(s => (
          <button
            key={s}
            className={`filter-btn ${filter === s ? 'active' : ''}`}
            onClick={() => setFilter(s)}
          >
            {s}
            {s !== 'All' && (
              <span className="filter-count">{tasksByStatus[s]?.length || 0}</span>
            )}
          </button>
        ))}
      </div>

      {error && <div className="alert alert-error dash-alert">{error}</div>}

      {/* Board Kanban */}
      {loading ? (
        <div className="loading-screen"><div className="spinner" /></div>
      ) : (
        <div className="board">
          {STATUSES.map(status => (
            <div key={status} className="board-col">
              <div className="col-header" style={{ borderColor: statusColor[status] }}>
                <span className="col-dot" style={{ background: statusColor[status] }} />
                <span className="col-title">{status}</span>
                <span className="col-count">{tasksByStatus[status].length}</span>
              </div>
              <div className="col-cards">
                {tasksByStatus[status].length === 0 && (
                  <div className="empty-col">Sin tareas</div>
                )}
                {tasksByStatus[status].map(task => (
                  <div key={task._id} className="task-card">
                    <div className="card-top">
                      <span
                        className="priority-badge"
                        style={{ background: priorityColor[task.priority] + '22', color: priorityColor[task.priority] }}
                      >
                        {task.priority}
                      </span>
                      <div className="card-actions">
                        <button className="icon-btn edit" onClick={() => openEdit(task)} title="Editar">✏️</button>
                        <button className="icon-btn del" onClick={() => handleDelete(task._id)} title="Eliminar">🗑</button>
                      </div>
                    </div>
                    <h3 className="card-title">{task.title}</h3>
                    {task.description && <p className="card-desc">{task.description}</p>}
                    <div className="card-footer">
                      {task.dueDate && (
                        <span className="due-date">
                          📅 {new Date(task.dueDate).toLocaleDateString('es-ES')}
                        </span>
                      )}
                      {task.createdBy && (
                        <div className="card-avatar" title={task.createdBy.name}>
                          {initials(task.createdBy.name)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal CRUD */}
      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{editTask ? 'Editar Tarea' : 'Nueva Tarea'}</h2>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="field-group">
                <label>Título *</label>
                <input
                  type="text"
                  placeholder="Nombre de la tarea"
                  value={form.title}
                  onChange={e => setForm({ ...form, title: e.target.value })}
                  required
                />
              </div>

              <div className="field-group">
                <label>Descripción</label>
                <textarea
                  placeholder="Descripción opcional..."
                  value={form.description}
                  onChange={e => setForm({ ...form, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="field-row">
                <div className="field-group">
                  <label>Estado</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })}>
                    {STATUSES.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                <div className="field-group">
                  <label>Prioridad</label>
                  <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })}>
                    {PRIORITIES.map(p => <option key={p}>{p}</option>)}
                  </select>
                </div>
              </div>

              <div className="field-group">
                <label>Fecha límite</label>
                <input
                  type="date"
                  value={form.dueDate}
                  onChange={e => setForm({ ...form, dueDate: e.target.value })}
                />
              </div>

              <div className="modal-actions">
                <button type="button" className="btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
                <button type="submit" className="btn-primary" disabled={saving}>
                  {saving ? <span className="btn-spinner" /> : editTask ? 'Guardar Cambios' : 'Crear Tarea'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
