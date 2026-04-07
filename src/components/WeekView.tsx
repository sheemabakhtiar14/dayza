import React, { useState, useMemo } from 'react';
import { format, addDays, startOfWeek } from 'date-fns';
import { Plus, Check, MoreVertical, Trash2, ChevronDown, ChevronUp, Edit2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import { DayOfWeek, Task } from '../types';
import { cn } from '../lib/utils';
import * as Dialog from '@radix-ui/react-dialog';

export function WeekView({ onAddTask, onEditTask }: { onAddTask: (day: DayOfWeek) => void, onEditTask: (task: Task) => void }) {
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
  const toggleSubtaskCompletion = useStore(state => state.toggleSubtaskCompletion);
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
                  ? "bg-[#1a1a24] border border-fuchsia-500/30" 
                  : "bg-[#121214] border border-gray-800 hover:border-gray-700"
              )}
            >
              <span className={cn(
                "text-[10px] font-bold tracking-widest uppercase mb-1",
                isSelected ? "text-fuchsia-400" : "text-gray-500"
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
                <div className="absolute bottom-3 w-1.5 h-1.5 rounded-full bg-fuchsia-500" />
              )}
            </button>
          );
        })}
      </div>

      <div className="bg-[#121214] border border-gray-800 rounded-3xl p-5 mb-8">
        <div className="flex justify-between items-end mb-3">
          <h3 className="font-medium">{selectedDayName} Progress</h3>
          <span className="text-fuchsia-400 font-bold">{progress}%</span>
        </div>
        <div className="h-2 w-full bg-gray-800/50 rounded-full overflow-hidden">
          <div 
            className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
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
            <>
              {tasks.map(task => (
                <WeekTaskCard 
                  key={task.id} 
                  task={task} 
                  onToggle={() => toggleTaskCompletion(task.id, selectedDate)}
                  onToggleSubtask={(subtaskId) => toggleSubtaskCompletion(task.id, subtaskId, selectedDate)}
                  onDelete={() => deleteTask(task.id)}
                  onEdit={() => onEditTask(task)}
                />
              ))}
            </>
          )}
        </div>
      </div>

      <button 
        onClick={() => onAddTask(selectedDayName)}
        className="fixed bottom-36 right-6 w-16 h-16 bg-gradient-to-tr from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 rounded-full flex items-center justify-center shadow-lg shadow-pink-500/20 transition-transform active:scale-95 z-40"
      >
        <Plus size={28} className="text-white" />
      </button>
    </div>
  );
}

const WeekTaskCard: React.FC<{ task: Task, onToggle: () => void, onToggleSubtask: (id: string) => void, onDelete: () => void, onEdit: () => void }> = ({ task, onToggle, onToggleSubtask, onDelete, onEdit }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [expanded, setExpanded] = useState(false);
  const hasSubtasks = task.subtasks && task.subtasks.length > 0;

  return (
    <div 
      className={cn(
        "rounded-2xl p-4 transition-all border relative",
        task.completed 
          ? "bg-gray-900/30 border-gray-800/50" 
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
            <h4 className={cn(
              "font-medium truncate transition-colors",
              task.completed ? "text-gray-500 line-through" : "text-white"
            )}>
              {task.title}
            </h4>
            
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
          
          {(task.duration || task.priority) && (
            <div className="flex items-center gap-2 text-xs text-gray-500 mt-1">
              {task.duration && <span>{task.duration}</span>}
              {task.duration && task.priority && <span>•</span>}
              {task.priority && (
                <span className="flex items-center gap-1 uppercase tracking-wider">
                  <span className={cn(
                    "w-1.5 h-1.5 rounded-full",
                    task.priority === 'High' ? 'bg-red-500' : 
                    task.priority === 'Medium' ? 'bg-amber-500' : 
                    'bg-emerald-500'
                  )}></span>
                  {task.priority}
                </span>
              )}
            </div>
          )}
        </div>
      </div>

      {hasSubtasks && expanded && (
        <div className="overflow-hidden">
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
        </div>
      )}
    </div>
  );
}
