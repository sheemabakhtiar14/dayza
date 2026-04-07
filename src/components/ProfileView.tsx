import React, { useMemo } from 'react';
import { useStore } from '../store/useStore';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth, eachWeekOfInterval, getWeekOfMonth } from 'date-fns';
import { Task, CompletionState, DayOfWeek } from '../types';
import { Activity, Calendar, TrendingUp } from 'lucide-react';

function calculateProgressForDate(date: Date, allTasks: Task[], completionState: CompletionState): number {
  const dayName = format(date, 'EEEE') as DayOfWeek;
  const dateString = format(date, 'yyyy-MM-dd');
  
  const dayTasks = allTasks.filter(t => (t.days || [t.day]).includes(dayName));
  if (dayTasks.length === 0) return 0;
  
  const totalProgress = dayTasks.reduce((acc, task) => {
    const taskCompletion = completionState[dateString]?.[task.id];
    if (task.subtasks && task.subtasks.length > 0) {
      const completedSubtasks = task.subtasks.filter(st => taskCompletion?.subtasks?.[st.id]).length;
      return acc + (completedSubtasks / task.subtasks.length);
    }
    return acc + (taskCompletion?.completed ? 1 : 0);
  }, 0);

  return Math.round((totalProgress / dayTasks.length) * 100);
}

export function ProfileView() {
  const allTasks = useStore(state => state.tasks);
  const completionState = useStore(state => state.completionState);
  
  const now = new Date();
  const weekLabel = `Week ${getWeekOfMonth(now)} of ${format(now, 'MMMM')}`;
  const monthLabel = format(now, 'MMMM yyyy');

  // Weekly Overview
  const weeklyData = useMemo(() => {
    const startOfCurrentWeek = startOfWeek(now, { weekStartsOn: 1 });
    const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(startOfCurrentWeek, i));

    const percentages = weekDays.map(date => ({
      date,
      dayName: format(date, 'EEEE'),
      shortName: format(date, 'EEE'),
      percentage: calculateProgressForDate(date, allTasks, completionState)
    }));

    const overall = Math.round(percentages.reduce((acc, curr) => acc + curr.percentage, 0) / 7);

    return { percentages, overall };
  }, [allTasks, completionState, now]);

  // Monthly Overview
  const monthlyData = useMemo(() => {
    const startOfCurrentMonth = startOfMonth(now);
    const endOfCurrentMonth = endOfMonth(now);
    const weeksInMonth = eachWeekOfInterval({ start: startOfCurrentMonth, end: endOfCurrentMonth }, { weekStartsOn: 1 });

    const weeks = weeksInMonth.map((weekStart, index) => {
      const weekDays = Array.from({ length: 7 }).map((_, i) => addDays(weekStart, i));
      const weekPercentages = weekDays.map(date => calculateProgressForDate(date, allTasks, completionState));
      const weekAverage = Math.round(weekPercentages.reduce((acc, curr) => acc + curr, 0) / 7);
      
      return {
        weekNumber: index + 1,
        percentage: weekAverage
      };
    });

    const overall = weeks.length > 0 ? Math.round(weeks.reduce((acc, curr) => acc + curr.percentage, 0) / weeks.length) : 0;

    return { weeks, overall };
  }, [allTasks, completionState, now]);

  return (
    <div className="p-6 pb-24 h-full overflow-y-auto">
      <header className="mb-8">
        <h1 className="text-2xl font-bold text-white mb-1">Analytics</h1>
        <p className="text-gray-400 text-sm">Track your consistency over time</p>
      </header>

      <div className="space-y-8">
        {/* Weekly Overview */}
        <section className="bg-[#121214] border border-gray-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
              <Activity size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Weekly Overview</h2>
              <p className="text-sm text-gray-400">{weekLabel}</p>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-white">{weeklyData.overall}%</span>
            <span className="text-sm text-gray-500 font-medium tracking-widest uppercase mb-1">Overall</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {weeklyData.percentages.map((day, i) => (
              <div key={i} className="flex flex-col items-center gap-2">
                <div className="w-full h-24 bg-gray-900 rounded-lg relative overflow-hidden flex items-end">
                  <div 
                    className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-lg transition-all duration-1000 ease-out"
                    style={{ height: `${day.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-gray-500">{day.shortName}</span>
                <span className="text-[10px] text-gray-400">{day.percentage}%</span>
              </div>
            ))}
          </div>
        </section>

        {/* Monthly Overview */}
        <section className="bg-[#121214] border border-gray-800 rounded-3xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-400">
              <Calendar size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Monthly Overview</h2>
              <p className="text-sm text-gray-400">{monthLabel}</p>
            </div>
          </div>

          <div className="flex items-end gap-3 mb-8">
            <span className="text-4xl font-bold text-white">{monthlyData.overall}%</span>
            <span className="text-sm text-gray-500 font-medium tracking-widest uppercase mb-1">Overall</span>
          </div>

          <div className="space-y-4">
            {monthlyData.weeks.map((week) => (
              <div key={week.weekNumber} className="flex items-center gap-4">
                <span className="text-xs font-bold text-gray-500 w-12">WK {week.weekNumber}</span>
                <div className="flex-1 h-3 bg-gray-900 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full transition-all duration-1000 ease-out"
                    style={{ width: `${week.percentage}%` }}
                  />
                </div>
                <span className="text-xs font-bold text-white w-8 text-right">{week.percentage}%</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
