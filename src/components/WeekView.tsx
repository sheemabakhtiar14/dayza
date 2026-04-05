import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Search, Plus, Check, MoreVertical, Trash2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DayOfWeek, Task } from '../types';
import { cn } from '../lib/utils';
import { motion, AnimatePresence } from 'motion/react';

export function WeekView({ onAddTask }: { onAddTask: (day: DayOfWeek) => void }) {
  const [currentDate] = useState(new Date());
  const startOfCurrentWeek = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday
  
  const [selectedDate, setSelectedDate] = useState(currentDate);
  const selectedDayName = format(selectedDate, 'EEEE') as DayOfWeek;
  
  const allTasks = useStore(state => state.tasks);
  const completionState = useStore(state => state.completionState);
  
  const tasks = useMemo(() => {
    const dateString = format(selectedDate, 'yyyy-MM-dd');
    return allTasks
      .filter((task) => task.day === selectedDayName)
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
  }, [allTasks, completionState, selectedDayName, selectedDate]);

  const toggleTaskCompletion = useStore(state => state.toggleTaskCompletion);
  const deleteTask = useStore(state => state.deleteTask);

  const completedCount = tasks.filter(t => t.completed).length;
  const progress = tasks.length > 0 ? Math.round((completedCount / tasks.length) * 100) : 0;

  const weekDays = Array.from({ length: 7 }).map((_, i) => {
    const date = addDays(startOfCurrentWeek, i);
    return {
      date,
      dayName: format(date, 'EEEE') as DayOfWeek,
      shortName: format(date, 'EEE').toUpperCase(),
      dayNumber: format(date, 'd')
    };
  });

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center text-sm font-bold">
            D
          </div>
          <span className="font-medium text-gray-200">dayo</span>
        </div>
        <button className="text-gray-400 hover:text-white transition-colors">
          <Search size={20} />
        </button>
      </header>

      <div className="mb-8">
        <h1 className="text-3xl font-bold tracking-tight mb-2">Weekly Rhythm</h1>
        <p className="text-gray-400 text-sm">Planning your intentions for the week ahead.</p>
      </div>

      <div className="flex gap-3 overflow-x-auto pb-4 mb-4 snap-x no-scrollbar">
        {weekDays.map((day) => {
          const isSelected = format(day.date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
          const isToday = format(day.date, 'yyyy-MM-dd') === format(currentDate, 'yyyy-MM-dd');
          
          return (
            <button
              key={day.dayName}
              onClick={() => setSelectedDate(day.date)}
              className={cn(
                "flex flex-col items-center justify-center min-w-[72px] h-24 rounded-3xl transition-all snap-center relative",
                isSelected 
                  ? "bg-[#1a1a24] border border-indigo-500/30" 
                  : "bg-[#121214] border border-gray-800 hover:border-gray-700"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase mb-1",
                isSelected ? "text-indigo-400" : "text-gray-500"
              )}>
                {day.shortName}
              </span>
              <span className={cn(
                "text-2xl font-bold",
                isSelected ? "text-white" : "text-gray-300"
              )}>
                {day.dayNumber}
              </span>
              {isToday && (
                <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-indigo-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-[#121214] border border-gray-800 rounded-3xl p-5 mb-8">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-medium">{selectedDayName} Progress</h3>
          <span className="text-indigo-400 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden">
          <motion.div 
            className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.5, ease: "easeOut" }}
          />
        </div>
      </div>

      <div>
        <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-4">{selectedDayName} TASKS</h2>
        
        <div className="space-y-3">
          {tasks.length === 0 ? (
            <div className="text-center py-10 bg-[#121214] border border-gray-800 rounded-3xl">
              <p className="text-gray-500 text-sm">No tasks scheduled for {selectedDayName}.</p>
            </div>
          ) : (
            <AnimatePresence>
              {tasks.map(task => (
                <WeekTaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskCompletion(task.id, selectedDate)}
                  onDelete={() => deleteTask(task.id)}
                />
              ))}
            </AnimatePresence>
          )}
        </div>
      </div>

      <div className="mt-8 bg-gradient-to-br from-[#1a1a24] to-[#121214] border border-indigo-500/20 rounded-3xl p-6 relative overflow-hidden">
        <div className="relative z-10">
          <h3 className="text-lg font-bold mb-2">Weekly Goal</h3>
          <p className="text-sm text-gray-400 mb-6 leading-relaxed">
            Complete the "Zen Workspace" UI component library and finalize client feedback loop.
          </p>
          <div className="flex items-center gap-2 text-sm text-emerald-400 font-medium">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"></polyline><polyline points="16 7 22 7 22 13"></polyline></svg>
            12 tasks completed of 15 planned
          </div>
        </div>
        
        <button 
          onClick={() => onAddTask(selectedDayName)}
          className="absolute bottom-6 right-6 w-12 h-12 bg-indigo-500 hover:bg-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20 transition-transform active:scale-95 z-20"
        >
          <Plus size={24} className="text-white" />
        </button>
      </div>
    </div>
  );
}

function WeekTaskCard({ task, onToggle, onDelete }: { task: Task, onToggle: () => void, onDelete: () => void }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <motion.div 
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className={cn(
        "flex items-center gap-4 p-4 rounded-2xl border transition-colors relative",
        task.completed 
          ? "bg-gray-900/30 border-gray-800/50" 
          : "bg-[#121214] border-gray-800"
      )}
    >
      <button 
        onClick={onToggle}
        className={cn(
          "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors shrink-0",
          task.completed 
            ? "bg-emerald-500 border-emerald-500 text-white" 
            : "border-gray-500 text-transparent hover:border-gray-400"
        )}
      >
        <Check size={14} />
      </button>
      
      <div className="flex-1 min-w-0">
        <h4 className={cn(
          "font-medium truncate transition-colors",
          task.completed ? "text-gray-500 line-through" : "text-white"
        )}>
          {task.title}
        </h4>
        {(task.startTime || task.priority) && (
          <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
            {task.startTime && <span>{task.startTime}</span>}
            {task.startTime && task.priority && <span>•</span>}
            {task.priority && <span className="uppercase tracking-wider">{task.priority}</span>}
          </div>
        )}
      </div>
      
      <div className="relative">
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="text-gray-600 hover:text-white p-1"
        >
          <MoreVertical size={18} />
        </button>
        {showMenu && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
            <div className="absolute right-0 top-8 bg-[#1a1a24] border border-gray-800 rounded-xl shadow-xl z-20 overflow-hidden w-32">
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
    </motion.div>
  );
}
