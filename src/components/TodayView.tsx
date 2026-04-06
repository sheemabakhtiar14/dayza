import React, { useState, useMemo } from 'react';
import { format } from 'date-fns';
import { Search, Plus, Check, ChevronDown, ChevronUp, MoreVertical, Trash2, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DayOfWeek, Task } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';
import * as Dialog from '@radix-ui/react-dialog';

export function TodayView({ onAddTask, onEditTask }: { onAddTask: (day: DayOfWeek) => void, onEditTask: (task: Task) => void }) {
  const [currentDate] = useState(new Date());
  const currentDayName = format(currentDate, 'EEEE') as DayOfWeek;
  
  const allTasks = useStore(state => state.tasks);
  const completionState = useStore(state => state.completionState);
  
  const tasks = useMemo(() => {
    const dateString = format(currentDate, 'yyyy-MM-dd');
    return allTasks
      .filter((task) => task.day === currentDayName)
      .map((task) => {
        const taskCompletion = completionState[dateString]?.[task.id];
        return {
          ...task,
          completed: taskCompletion?.completed || false,
          subtasks: task.subtasks.map(st => ({
            ...st,
            completed: taskCompletion?.subtasks?.[st.id] || false
          }))
        };
      });
  }, [allTasks, completionState, currentDayName, currentDate]);

  const toggleTaskCompletion = useStore(state => state.toggleTaskCompletion);
  const toggleSubtaskCompletion = useStore(state => state.toggleSubtaskCompletion);
  const deleteTask = useStore(state => state.deleteTask);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <span className="font-medium text-gray-200">dayza</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
      </header>

      <div className="mb-8">
        <h2 className="text-gray-400 text-sm font-medium tracking-widest uppercase mb-1">Today</h2>
        <div className="flex justify-between items-end">
          <h1 className="text-4xl font-bold tracking-tight">{currentDayName}</h1>
          <div className="text-right">
            <span className="text-2xl font-bold">{progress}%</span>
            <p className="text-[10px] text-gray-400 font-medium tracking-widest uppercase">Completed</p>
          </div>
        </div>
        <div className="h-1 w-full bg-gray-800 rounded-full mt-4 overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div className="space-y-4">
        {tasks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Check className="text-indigo-400" size={40} />
            </div>
            <h3 className="text-2xl font-semibold mb-2">Your day is clear!</h3>
            <p className="text-gray-400 mb-8">The digital sanctuary is quiet. Take a breath or start mapping your next focus.</p>
            <button 
              onClick={() => onAddTask(currentDayName)}
              className="bg-indigo-500 hover:bg-indigo-600 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Add your first task
            </button>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {tasks.map(task => (
              <TaskCard 
                key={task.id} 
                task={task} 
                date={currentDate}
                onToggle={() => toggleTaskCompletion(task.id, currentDate)}
                onToggleSubtask={(subtaskId) => toggleSubtaskCompletion(task.id, subtaskId, currentDate)}
                onDelete={() => deleteTask(task.id)}
                onEdit={() => onEditTask(task)}
              />
            ))}
          </AnimatePresence>
        )}
      </div>

      {tasks.length > 0 && (
        <button 
          onClick={() => onAddTask(currentDayName)}
          className="fixed bottom-24 right-6 w-14 h-14 bg-indigo-500 hover:bg-indigo-600 rounded-full flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 z-40"
        >
          <Plus size={24} className="text-white" />
        </button>
      )}
    </div>
  );
}

function TaskCard({ task, date, onToggle, onToggleSubtask, onDelete, onEdit }: { task: Task, date: Date, onToggle: () => void, onToggleSubtask: (id: string) => void, onDelete: () => void, onEdit: () => void }) {
  const [expanded, setExpanded] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "rounded-3xl p-5 transition-all border relative",
        task.completed 
          ? "bg-gray-900/50 border-gray-800/50" 
          : "bg-[#121214] border-gray-800"
      )}
    >
      <div className="flex items-start gap-4">
        <button 
          onClick={onToggle}
          className={cn(
            "mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
            task.completed 
              ? "bg-emerald-500 border-emerald-500 text-white" 
              : "border-gray-500 text-transparent hover:border-gray-400"
          )}
        >
          <Check size={14} />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-start">
            <h3 className={cn(
              "font-medium text-lg truncate transition-colors",
              task.completed ? "text-gray-500 line-through" : "text-white"
            )}>
              {task.title}
            </h3>
            <div className="flex items-center gap-2 shrink-0 relative">
              {hasSubtasks && (
                <button 
                  onClick={() => setExpanded(!expanded)}
                  className="text-gray-400 hover:text-white p-1"
                >
                  {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
              )}
              <button 
                onClick={() => setShowMenu(!showMenu)}
                className="text-gray-500 hover:text-white p-1"
              >
                <MoreVertical size={18} />
              </button>
              
              {showMenu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
                  <div className="absolute right-0 top-8 bg-[#1a1a24] border border-gray-800 rounded-xl shadow-xl z-20 overflow-hidden w-32">
                    <button 
                      onClick={() => {
                        onEdit();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-gray-300 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Edit2 size={16} />
                      Edit
                    </button>
                    <button 
                      onClick={() => {
                        onDelete();
                        setShowMenu(false);
                      }}
                      className="w-full text-left px-4 py-3 text-sm text-red-400 hover:bg-white/5 flex items-center gap-2"
                    >
                      <Trash2 size={16} />
                      Delete
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
          
          {(task.description || task.duration || task.priority) && (
            <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-400">
              {task.description && <span className="truncate max-w-full block">{task.description}</span>}
              {task.duration && <span>{task.duration}</span>}
              {task.priority && (
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-400"></span>
                  {task.priority}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      <AnimatePresence>
        {hasSubtasks && expanded && (
          <motion.div 
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pl-10 space-y-3">
              {task.subtasks.map(subtask => (
                <div key={subtask.id} className="flex items-start gap-3">
                  <button 
                    onClick={() => onToggleSubtask(subtask.id)}
                    className={cn(
                      "mt-0.5 w-4 h-4 rounded border flex items-center justify-center transition-colors shrink-0",
                      subtask.completed 
                        ? "bg-emerald-500 border-emerald-500 text-white" 
                        : "border-gray-600 text-transparent hover:border-gray-400"
                    )}
                  >
                    <Check size={10} />
                  </button>
                  <span className={cn(
                    "text-sm transition-colors",
                    subtask.completed ? "text-gray-500 line-through" : "text-gray-300"
                  )}>
                    {subtask.title}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
