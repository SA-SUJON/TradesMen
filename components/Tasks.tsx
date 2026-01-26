
import React, { useState } from 'react';
import { Card, Input, Button } from './ui/BaseComponents';
import { CheckSquare, Square, Trash2, Plus, AlertCircle, Clock, CheckCircle2 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import useLocalStorage from '../hooks/useLocalStorage';
import { Task } from '../types';
import { motion, AnimatePresence } from 'framer-motion';

const Tasks: React.FC = () => {
    const { theme } = useTheme();
    const [tasks, setTasks] = useLocalStorage<Task[]>('tradesmen-tasks', []);
    const [newTask, setNewTask] = useState('');
    const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
    const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

    const addTask = (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!newTask.trim()) return;
        
        const task: Task = {
            id: Date.now().toString(),
            text: newTask,
            completed: false,
            priority,
            createdAt: new Date().toISOString()
        };
        
        setTasks(prev => [task, ...prev]);
        setNewTask('');
    };

    const toggleTask = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const filteredTasks = tasks.filter(t => {
        if (filter === 'pending') return !t.completed;
        if (filter === 'completed') return t.completed;
        return true;
    });

    const getPriorityColor = (p: string) => {
        if (p === 'high') return 'bg-red-100 text-red-700 border-red-200';
        if (p === 'medium') return 'bg-orange-100 text-orange-700 border-orange-200';
        return 'bg-blue-100 text-blue-700 border-blue-200';
    };

    return (
        <div className="space-y-6 pb-24">
            <Card className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white border-none">
                <div className="flex items-center gap-4">
                    <div className="p-3 bg-white/20 rounded-full backdrop-blur-sm">
                        <CheckSquare className="w-8 h-8 text-white" />
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold">Daily Tasks</h2>
                        <p className="opacity-80 text-sm">Manage shop operations and to-dos</p>
                    </div>
                </div>
            </Card>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-1 space-y-4">
                    <Card>
                        <h3 className="font-bold mb-4">Add New Task</h3>
                        <form onSubmit={addTask} className="space-y-4">
                            <Input 
                                placeholder="What needs to be done?" 
                                value={newTask} 
                                onChange={e => setNewTask(e.target.value)}
                                autoFocus
                            />
                            <div className="flex gap-2">
                                {['low', 'medium', 'high'].map(p => (
                                    <button
                                        key={p}
                                        type="button"
                                        onClick={() => setPriority(p as any)}
                                        className={`flex-1 py-2 text-xs font-bold rounded-lg capitalize border-2 transition-all ${
                                            priority === p 
                                                ? getPriorityColor(p) + ' border-current'
                                                : 'bg-gray-50 border-transparent opacity-60 hover:opacity-100'
                                        }`}
                                    >
                                        {p}
                                    </button>
                                ))}
                            </div>
                            <Button type="submit" className="w-full flex items-center justify-center gap-2">
                                <Plus className="w-4 h-4" /> Add Task
                            </Button>
                        </form>
                    </Card>

                    <Card>
                        <h3 className="font-bold mb-4">Summary</h3>
                        <div className="space-y-3">
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm opacity-70">Pending</span>
                                <span className="font-bold text-orange-500">{tasks.filter(t => !t.completed).length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm opacity-70">Completed</span>
                                <span className="font-bold text-green-500">{tasks.filter(t => t.completed).length}</span>
                            </div>
                            <div className="flex justify-between items-center p-2 bg-gray-50 dark:bg-white/5 rounded-lg">
                                <span className="text-sm opacity-70">High Priority</span>
                                <span className="font-bold text-red-500">{tasks.filter(t => t.priority === 'high' && !t.completed).length}</span>
                            </div>
                        </div>
                    </Card>
                </div>

                <div className="lg:col-span-2">
                    <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
                        <button onClick={() => setFilter('all')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/10'}`}>All Tasks</button>
                        <button onClick={() => setFilter('pending')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/10'}`}>Pending</button>
                        <button onClick={() => setFilter('completed')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap transition-all ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-white/10'}`}>Completed</button>
                    </div>

                    <div className="space-y-3">
                        <AnimatePresence>
                            {filteredTasks.length > 0 ? filteredTasks.map(task => (
                                <motion.div
                                    key={task.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, x: -10 }}
                                    className={`p-4 rounded-xl border transition-all flex items-start gap-3 group ${
                                        task.completed 
                                            ? 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/5 opacity-60' 
                                            : 'bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 shadow-sm'
                                    }`}
                                >
                                    <button onClick={() => toggleTask(task.id)} className={`mt-1 transition-colors ${task.completed ? 'text-green-500' : 'text-gray-400 hover:text-blue-500'}`}>
                                        {task.completed ? <CheckCircle2 className="w-5 h-5" /> : <Square className="w-5 h-5" />}
                                    </button>
                                    
                                    <div className="flex-grow">
                                        <div className={`text-sm font-medium leading-snug ${task.completed ? 'line-through' : ''}`}>
                                            {task.text}
                                        </div>
                                        <div className="flex items-center gap-2 mt-2">
                                            <span className={`text-[10px] uppercase font-bold px-1.5 py-0.5 rounded border ${getPriorityColor(task.priority)}`}>
                                                {task.priority}
                                            </span>
                                            <span className="text-[10px] opacity-40 flex items-center gap-1">
                                                <Clock className="w-3 h-3" /> {new Date(task.createdAt).toLocaleDateString()}
                                            </span>
                                        </div>
                                    </div>

                                    <button 
                                        onClick={() => deleteTask(task.id)}
                                        className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg opacity-0 group-hover:opacity-100 transition-all"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </motion.div>
                            )) : (
                                <div className="text-center py-12 opacity-40 flex flex-col items-center">
                                    <CheckSquare className="w-12 h-12 mb-3 opacity-50" />
                                    <p>No tasks found.</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Tasks;
