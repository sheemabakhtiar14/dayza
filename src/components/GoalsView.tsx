import React, { useState, useMemo } from 'react';
import { useStore } from '../store/useStore';
import { Plus, Target, Trash2, Edit2, TrendingUp, CheckCircle2, X } from 'lucide-react';
import { cn } from '../lib/utils';
import { format, startOfWeek, isSameWeek, parseISO } from 'date-fns';
import * as Dialog from '@radix-ui/react-dialog';
import { Goal } from '../types';

export function GoalsView() {
  const goals = useStore(state => state.goals);
  const tasks = useStore(state => state.tasks);
  const completionState = useStore(state => state.completionState);
  const addGoal = useStore(state => state.addGoal);
  const updateGoal = useStore(state => state.updateGoal);
  const deleteGoal = useStore(state => state.deleteGoal);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [totalUnits, setTotalUnits] = useState<number | ''>(0);
  const [unitName, setUnitName] = useState('units');
  const [initialCompletedUnits, setInitialCompletedUnits] = useState<number | ''>('');

  const openAddModal = () => {
    setEditingGoal(null);
    setTitle('');
    setDescription('');
    setTotalUnits(0);
    setUnitName('units');
    setInitialCompletedUnits('');
    setIsModalOpen(true);
  };

  const openEditModal = (goal: Goal) => {
    setEditingGoal(goal);
    setTitle(goal.title);
    setDescription(goal.description || '');
    setTotalUnits(goal.totalUnits);
    setUnitName(goal.unitName);
    setInitialCompletedUnits(goal.initialCompletedUnits ?? '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!title.trim()) return;
    
    const payload = {
      title: title.trim(),
      description: description.trim() || undefined,
      totalUnits: Number(totalUnits) || 0,
      unitName: unitName.trim() || 'units',
      initialCompletedUnits: initialCompletedUnits === '' ? 0 : Number(initialCompletedUnits)
    };

    if (editingGoal) {
      updateGoal(editingGoal.id, payload);
    } else {
      addGoal(payload);
    }
    setIsModalOpen(false);
  };

  // Calculate goal progress
  const goalsProgress = useMemo(() => {
    const now = new Date();
    
    return goals.map(goal => {
      let completedUnits = goal.initialCompletedUnits || 0;
      let weeklyCompletedUnits = 0;
      let weeklyTasksCompleted = 0;

      // Find all tasks linked to this goal
      const goalTasks = tasks.filter(t => t.goalId === goal.id);
      
      // Iterate over completion state to find completed instances of these tasks
      Object.entries(completionState).forEach(([dateString, dateTasks]) => {
        const date = parseISO(dateString);
        const isThisWeek = isSameWeek(date, now, { weekStartsOn: 1 });

        goalTasks.forEach(task => {
          if (dateTasks[task.id]?.completed) {
            const units = task.goalUnits || 0;
            completedUnits += units;
            
            if (isThisWeek) {
              weeklyCompletedUnits += units;
              weeklyTasksCompleted += 1;
            }
          }
        });
      });

      const percentage = goal.totalUnits > 0 
        ? Math.min(100, Math.round((completedUnits / goal.totalUnits) * 100)) 
        : 0;

      return {
        ...goal,
        completedUnits,
        remainingUnits: Math.max(0, goal.totalUnits - completedUnits),
        percentage,
        weeklyCompletedUnits,
        weeklyTasksCompleted
      };
    });
  }, [goals, tasks, completionState]);

  return (
    <div className="p-6">
      <header className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-white">Goals</h1>
          <p className="text-gray-400 text-sm mt-1">Track your long-term progress</p>
        </div>
        <button 
          onClick={openAddModal}
          className="w-10 h-10 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center transition-colors"
        >
          <Plus size={20} className="text-white" />
        </button>
      </header>

      <div className="space-y-6">
        {goalsProgress.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-gray-800/50 rounded-3xl mx-auto mb-6 flex items-center justify-center">
              <Target className="text-fuchsia-400" size={40} />
            </div>
            <h3 className="text-xl font-bold mb-2">No goals yet</h3>
            <p className="text-gray-500 mb-8 max-w-xs mx-auto">
              Create a long-term goal and link your daily tasks to track your progress.
            </p>
            <button 
              onClick={openAddModal}
              className="bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 text-white px-6 py-3 rounded-full font-medium transition-colors flex items-center gap-2 mx-auto"
            >
              <Plus size={20} />
              Create your first goal
            </button>
          </div>
        ) : (
          goalsProgress.map(goal => (
            <div key={goal.id} className="bg-[#121214] border border-gray-800 rounded-3xl p-6 relative overflow-hidden">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-xl font-bold text-white mb-1">{goal.title}</h3>
                  {goal.description && (
                    <p className="text-gray-400 text-sm">{goal.description}</p>
                  )}
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => openEditModal(goal)}
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-white transition-colors"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button 
                    onClick={() => deleteGoal(goal.id)}
                    className="w-8 h-8 rounded-full bg-gray-800 hover:bg-gray-700 flex items-center justify-center text-gray-400 hover:text-red-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <Target size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">Overall</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-white">{goal.completedUnits}</span>
                    <span className="text-sm text-gray-400 mb-1">/ {goal.totalUnits} {goal.unitName}</span>
                  </div>
                </div>
                
                <div className="bg-gray-900/50 rounded-2xl p-4 border border-gray-800/50">
                  <div className="flex items-center gap-2 text-gray-500 mb-2">
                    <TrendingUp size={16} />
                    <span className="text-xs font-bold tracking-widest uppercase">This Week</span>
                  </div>
                  <div className="flex items-end gap-2">
                    <span className="text-2xl font-bold text-fuchsia-400">+{goal.weeklyCompletedUnits}</span>
                    <span className="text-sm text-gray-400 mb-1">{goal.unitName}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {goal.weeklyTasksCompleted} tasks completed
                  </div>
                </div>
              </div>

              <div>
                <div className="flex justify-between items-end mb-2">
                  <span className="text-xs font-bold tracking-widest text-gray-500 uppercase">Progress</span>
                  <span className="text-sm font-bold text-white">{goal.percentage}%</span>
                </div>
                <div className="h-2 w-full bg-gray-800 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-pink-500 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${goal.percentage}%` }}
                  />
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <Dialog.Root open={isModalOpen} onOpenChange={setIsModalOpen}>
        <Dialog.Portal>
          <Dialog.Overlay className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50" />
          <Dialog.Content className="fixed inset-0 md:inset-auto md:left-[50%] md:top-[50%] md:-translate-x-[50%] md:-translate-y-[50%] md:w-full md:max-w-md md:h-auto md:max-h-[85vh] h-full bg-[#09090b] md:rounded-[32px] md:border border-gray-800 z-50 flex flex-col overflow-hidden">
            
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
                {editingGoal ? 'Edit Goal' : 'New Goal'}
                <div className="w-6 h-6 rounded-full bg-fuchsia-500/20 flex items-center justify-center text-fuchsia-400 text-xs">
                  {editingGoal ? 'E' : 'N'}
                </div>
              </div>
            </div>

            <Dialog.Title className="sr-only">{editingGoal ? 'Edit Goal' : 'New Goal'}</Dialog.Title>

            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div>
                <h2 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-2">GOAL TITLE</h2>
                <input 
                  type="text" 
                  placeholder="e.g., Complete React Course"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-transparent text-2xl font-bold text-white placeholder:text-gray-600 outline-none"
                  autoFocus
                />
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">DESCRIPTION (OPTIONAL)</h3>
                <textarea 
                  placeholder="Why is this goal important?"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 bg-[#121214] border border-gray-800 rounded-2xl p-4 text-sm text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">TOTAL UNITS</h3>
                  <input 
                    type="number" 
                    min="0"
                    value={totalUnits}
                    onChange={(e) => setTotalUnits(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                    className="w-full bg-[#121214] border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-gray-600 transition-colors"
                  />
                </div>
                <div>
                  <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">UNIT NAME</h3>
                  <input 
                    type="text" 
                    placeholder="e.g., videos, pages"
                    value={unitName}
                    onChange={(e) => setUnitName(e.target.value)}
                    className="w-full bg-[#121214] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors"
                  />
                </div>
              </div>

              <div>
                <h3 className="text-xs font-bold tracking-widest text-gray-500 uppercase mb-3">COMPLETED UNITS (SO FAR)</h3>
                <input 
                  type="number" 
                  min="0"
                  max={totalUnits}
                  value={initialCompletedUnits}
                  onChange={(e) => setInitialCompletedUnits(e.target.value === '' ? '' : parseInt(e.target.value) || 0)}
                  placeholder="0 (optional)"
                  className="w-full bg-[#121214] border border-gray-800 rounded-2xl p-4 text-white placeholder:text-gray-600 outline-none focus:border-gray-600 transition-colors"
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-800/50 bg-[#09090b]">
              <button 
                onClick={handleSave}
                disabled={!title.trim() || totalUnits === ''}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-500 hover:from-purple-500 hover:to-pink-400 disabled:from-purple-600/50 disabled:to-pink-500/50 disabled:text-white/50 text-white py-4 rounded-2xl font-medium transition-colors flex items-center justify-center gap-2"
              >
                <CheckCircle2 size={20} />
                {editingGoal ? 'Save Changes' : 'Create Goal'}
              </button>
            </div>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </div>
  );
}
