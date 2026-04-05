/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Layout } from './components/Layout';
import { TodayView } from './components/TodayView';
import { WeekView } from './components/WeekView';
import { AddTaskModal } from './components/AddTaskModal';
import { DayOfWeek } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState<'today' | 'week' | 'focus' | 'profile'>('today');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [initialAddDay, setInitialAddDay] = useState<DayOfWeek>('Monday');

  const handleAddTask = (day: DayOfWeek) => {
    setInitialAddDay(day);
    setIsAddModalOpen(true);
  };

  return (
    <Layout activeTab={activeTab} onTabChange={setActiveTab}>
      {activeTab === 'today' && <TodayView onAddTask={handleAddTask} />}
      {activeTab === 'week' && <WeekView onAddTask={handleAddTask} />}
      {activeTab === 'focus' && (
        <div className="p-6 flex items-center justify-center h-full text-gray-500">
          Focus mode coming soon...
        </div>
      )}
      {activeTab === 'profile' && (
        <div className="p-6 flex items-center justify-center h-full text-gray-500">
          Profile settings coming soon...
        </div>
      )}

      <AddTaskModal 
        isOpen={isAddModalOpen} 
        onClose={() => setIsAddModalOpen(false)} 
        initialDay={initialAddDay}
      />
    </Layout>
  );
}
