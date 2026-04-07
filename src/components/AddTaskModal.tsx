import React, { useState, useEffect, useRef } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, Clock, AlertCircle, Plus, Check, Target, ChevronDown } from 'lucide-react';
import { DayOfWeek, Task, Subtask } from '../types';
import { useStore } from '../store/useStore';
import { cn } from '../lib/utils';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialDay?: DayOfWeek;
  existingTask?: Task | null;
}

export function AddTaskModal({ isOpen, onClose, initialDay = 'Monday', existingTask }: AddTaskModalProps) {
  const addTask = useStore(state => state.addTask);
  const updateTask = useStore(state => state.updateTask);
  const goals = useStore(state => state.goals);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState('30m');
  const [priority, setPriority] = useState<Task['priority']>('Medium');
  const [selectedDays, setSelectedDays] = useState<DayOfWeek[]>([initialDay]);
  const [subtasks, setSubtasks] = useState<{ id: string, title: string, completed?: boolean }[]>([]);
  const [newSubtask, setNewSubtask] = useState('');
  const [goalId, setGoalId] = useState<string>('');
  const [goalUnits, setGoalUnits] = useState<number | ''>(1);
  const [isDayDropdownOpen, setIsDayDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const daysOfWeek: DayOfWeek[] = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDayDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen) {
      if (existingTask) {
        setTitle(existingTask.title);
        setDescription(existingTask.description || '');
        setDuration(existingTask.duration || '30m');
        setPriority(existingTask.priority || 'Medium');
        setSelectedDays([existingTask.day]);
        setSubtasks(existingTask.subtasks || []);
        setGoalId(existingTask.goalId || '');
        setGoalUnits(existingTask.goalUnits ?? 1);
      } else {
        setTitle('');
        setDescription('');
        setDuration('30m');
        setPriority('Medium');
        setSelectedDays([initialDay]);
        setSubtasks([]);
        setGoalId('');
        setGoalUnits(1);
      }
      setNewSubtask('');
      setIsDayDropdownOpen(false);
    }
  }, [isOpen, existingTask, initialDay]);

  const handleAddSubtask = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && newSubtask.trim()) {
      e.preventDefault();
      setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false }]);
      setNewSubtask('');
    }
  };

  const removeSubtask = (id: string) => {
    setSubtasks(subtasks.filter(st => st.id !== id));
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const finalSubtasks = [...subtasks];
    if (newSubtask.trim()) {
      finalSubtasks.push({ id: crypto.randomUUID(), title: newSubtask.trim(), completed: false });
    }
    
    const taskData = {
      title: title.trim(),
      description: description.trim() || undefined,
      duration: duration,
      priority,
      goalId: goalId || undefined,
      goalUnits: goalId ? (Number(goalUnits) || 0) : undefined,
    };

    if (selectedDays.length === 0) return;

    if (existingTask) {
      const firstDay = selectedDays[0];
      updateTask(existingTask.id, {
        ...taskData,
        day: firstDay,
        subtasks: finalSubtasks.map(st => ({ ...st, completed: st.completed || false }))
      });

      const remainingDays = selectedDays.slice(1);
      remainingDays.forEach(d => {
        addTask({
          ...taskData,
          day: d,
          subtasks: finalSubtasks.map(st => ({ ...st, completed: false }))
        });
      });
    } else {
      selectedDays.forEach(d => {
        addTask({
          ...taskData,
          day: d,
          subtasks: finalSubtasks.map(st => ({ ...st, completed: false }))
        });
      });
    }
    
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:-translate-x-[50%] md:-translate-y-[50%] md:w-full md:max-w-md md:h-auto md:max-h-[85vh] h-full bg-[#09090b] md:rounded-[32px] md:border border-gray-800 z-50 flex flex-col overflow-hidden data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">
          
          <div className="flex items-center justify-between p-6 border-b border-gray-800/50">
            <div className="flex items-center gap-3">
              <Dialog.Close asChild>
                <button className="text-gray-400 hover:text-white transition-colors">
                  <X size={24} />
                </button>
              </Dialog.Close>
              <span className="font-medium">dayza</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-400">
              {existingTask ? 'Edit Task' : 'Draft'}
              <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 text-xs">
                {existingTask ? 'E' : 'D'}
              </div>
            </div>
          </div>
          
          <Dialog.Title className="sr-only">{existingTask ? 'Edit Task' : 'Add New Task'}</Dialog.Title>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            <div>
              <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">INTENT</h2>
              <input 
                type="text" 
                placeholder="Craft your task"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-transparent text-3xl font-bold text-white placeholder:text-gray-600 outline-none"
                autoFocus
              />
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-gray-800 focus-within:border-gray-600 transition-colors">
                <Clock className="text-gray-500" size={20} />
                <div className="flex-1">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">DURATION</label>
                  <select 
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="w-full bg-transparent text-white outline-none text-sm appearance-none"
                  >
                    <option value="15m" className="bg-gray-900">15 minutes</option>
                    <option value="30m" className="bg-gray-900">30 minutes</option>
                    <option value="45m" className="bg-gray-900">45 minutes</option>
                    <option value="1h" className="bg-gray-900">1 hour</option>
                    <option value="1.5h" className="bg-gray-900">1.5 hours</option>
                    <option value="2h" className="bg-gray-900">2 hours</option>
                    <option value="4h" className="bg-gray-900">4 hours</option>
                    <option value="All Day" className="bg-gray-900">All Day</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-gray-800">
                <AlertCircle className="text-fuchsia-400" size={20} />
                <div className="flex-1">
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">PRIORITY</label>
                  <select 
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as Task['priority'])}
                    className="w-full bg-transparent text-white outline-none text-sm appearance-none"
                  >
                    <option value="Low" className="bg-gray-900">Low</option>
                    <option value="Medium" className="bg-gray-900">Medium</option>
                    <option value="High" className="bg-gray-900">High</option>
                  </select>
                </div>
              </div>
              
              <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-gray-800 focus-within:border-gray-600 transition-colors">
                <CalendarIcon className="text-gray-500" size={20} />
                <div className="flex-1 relative" ref={dropdownRef}>
                  <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">DAY</label>
                  <button 
                    type="button"
                    onClick={() => setIsDayDropdownOpen(!isDayDropdownOpen)}
                    className="w-full bg-transparent text-white outline-none text-sm text-left flex justify-between items-center"
                  >
                    <span className="truncate pr-2">
                      {selectedDays.length === 7 ? 'Everyday' : selectedDays.length > 0 ? selectedDays.join(', ') : 'Select days'}
                    </span>
                    <ChevronDown size={14} className="text-gray-500" />
                  </button>

                  {isDayDropdownOpen && (
                    <div className="absolute top-full left-0 mt-2 w-full bg-[#1a1a1d] border border-gray-800 rounded-xl shadow-xl z-50 overflow-hidden py-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (selectedDays.length === 7) {
                            setSelectedDays([initialDay]);
                          } else {
                            setSelectedDays([...daysOfWeek]);
                          }
                        }}
                        className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
                      >
                        <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", selectedDays.length === 7 ? "bg-fuchsia-500 border-fuchsia-500" : "border-gray-600")}>
                          {selectedDays.length === 7 && <Check size={10} className="text-white" />}
                        </div>
                        Everyday
                      </button>
                      <div className="h-px bg-gray-800 my-1 mx-2" />
                      {daysOfWeek.map(d => (
                        <button
                          key={d}
                          type="button"
                          onClick={() => {
                            if (selectedDays.includes(d)) {
                              setSelectedDays(selectedDays.filter(day => day !== d));
                            } else {
                              setSelectedDays([...selectedDays, d]);
                            }
                          }}
                          className="w-full text-left px-4 py-2.5 text-sm hover:bg-gray-800 flex items-center gap-3 transition-colors"
                        >
                          <div className={cn("w-4 h-4 rounded border flex items-center justify-center transition-colors", selectedDays.includes(d) ? "bg-fuchsia-500 border-fuchsia-500" : "border-gray-600")}>
                            {selectedDays.includes(d) && <Check size={10} className="text-white" />}
                          </div>
                          {d}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {goals.length > 0 && (
                <div className="flex items-center gap-4 p-4 rounded-2xl bg-[#121214] border border-gray-800">
                  <Target className="text-fuchsia-400" size={20} />
                  <div className="flex-1">
                    <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">LINK TO GOAL</label>
                    <select 
                      value={goalId}
                      onChange={(e) => setGoalId(e.target.value)}
                      className="w-full bg-transparent text-white outline-none text-sm appearance-none"
                    >
                      <option value="" className="bg-gray-900">None</option>
                      {goals.map(g => (
                        <option key={g.id} value={g.id} className="bg-gray-900">{g.title}</option>
                      ))}
                    </select>
                  </div>
                  {goalId && (
                    <div className="w-24 border-l border-gray-800 pl-4">
                      <label className="text-[10px] font-bold tracking-widest text-gray-500 uppercase block mb-1">UNITS</label>
                      <input 
                        type="number" 
                        min="0"
                        value={goalUnits}
                        onChange={(e) => setGoalUnits(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                        className="w-full bg-transparent text-white outline-none text-sm"
                      />
                    </div>
                  )}
                </div>
              )}
            </div>

            <div>
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase">BREAKDOWN STEPS</h3>
                <span className="text-xs text-gray-600">{subtasks.filter(st => st.completed).length} / {subtasks.length} Complete</span>
              </div>
              
              <div className="space-y-2">
                {subtasks.map(st => (
                  <div key={st.id} className="flex items-center gap-3 p-3 rounded-xl bg-[#121214] border border-gray-800 group">
                    <div className={cn(
                      "w-4 h-4 rounded border flex items-center justify-center flex-shrink-0",
                      st.completed ? "bg-emerald-500 border-emerald-500 text-white" : "border-gray-600"
                    )}>
                      {st.completed && <Check size={10} />}
                    </div>
                    <span className={cn(
                      "flex-1 text-sm",
                      st.completed ? "text-gray-500 line-through" : "text-gray-300"
                    )}>{st.title}</span>
                    <button 
                      onClick={() => removeSubtask(st.id)}
                      className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ))}
                
                <div className="flex items-center gap-3 p-3 rounded-xl bg-[#121214]/50 border border-gray-800 border-dashed focus-within:border-gray-600 transition-colors">
                  <Plus className="text-gray-600" size={16} />
                  <input 
                    type="text" 
                    placeholder="Add a sub-intent..."
                    value={newSubtask}
                    onChange={(e) => setNewSubtask(e.target.value)}
                    onKeyDown={handleAddSubtask}
                    className="flex-1 bg-transparent text-sm text-white placeholder:text-gray-600 outline-none"
                  />
                  {newSubtask.trim() && (
                    <button 
                      onClick={() => {
                        setSubtasks([...subtasks, { id: crypto.randomUUID(), title: newSubtask.trim(), completed: false }]);
                        setNewSubtask('');
                      }}
                      className="text-fuchsia-400 hover:text-fuchsia-300 text-xs font-bold uppercase tracking-wider px-2 py-1"
                    >
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">CONTEXT & NUANCE</h3>
              <textarea 
                placeholder="Write down any thoughts to clear your headspace..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full h-32 bg-[#121214] border border-gray-800 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors resize-none"
              />
            </div>
          </div>

          <div className="p-6 border-t border-gray-800/50 bg-[#09090b]">
            <button 
              onClick={handleSave}
              disabled={!title.trim()}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-purple-600/50 disabled:to-pink-500/50 disabled:text-white/50 text-white py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
            >
              <Check size={20} />
              {existingTask ? 'Save Changes' : `Commit Task`}
            </button>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}

function CalendarIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
      <line x1="16" x2="16" y1="2" y2="6" />
      <line x1="8" x2="8" y1="2" y2="6" />
      <line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  )
}
