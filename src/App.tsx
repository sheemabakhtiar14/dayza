/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { GoalsView } from './components/GoalsView';
import { ProfileView } from './components/ProfileView';
import { AddTaskModal } from './components/AddTaskModal';
import { DayOfWeek, Task } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'goals' | 'profile'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialAddDay, setInitialAddDay] = useState<DayOfWeek>('Monday');
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const handleAddTask = (day: DayOfWeek) => {
    setEditingTask(null);
    setInitialAddDay(day);
    setIsAddModalOpen(true);
  };

  const handleEditTask = (task: Task) => {
    setEditingTask(task);
    setInitialAddDay(task.day);
    setIsAddModalOpen(true);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayView onAddTask={handleAddTask} onEditTask={handleEditTask} />}
      {activeTab === 'week' && <WeekView onAddTask={handleAddTask} onEditTask={handleEditTask} />}
      {activeTab === 'goals' && <GoalsView />}
      {activeTab === 'profile' && <ProfileView />}

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => {
          setIsAddModalOpen(false);
          setTimeout(() => setEditingTask(null), 300); // clear after animation
        }} 
        initialDay={initialAddDay}
        existingTask={editingTask}
      />
    </Layout>
  );
}
