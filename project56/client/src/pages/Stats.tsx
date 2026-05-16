import React, { useState, useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import { readingAPI } from '../api/client';
import { ReadingStats } from '../types';

const Stats: React.FC = () => {
  const [stats, setStats] = useState<ReadingStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await readingAPI.getStats();
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444'];

  const statusData = stats ? [
    { name: 'Want to Read', value: stats.booksByStatus['want_to_read'] || 0, color: '#F59E0B' },
    { name: 'Reading', value: stats.booksByStatus['reading'] || 0, color: '#3B82F6' },
    { name: 'Read', value: stats.booksByStatus['read'] || 0, color: '#10B981' },
    { name: 'Abandoned', value: stats.booksByStatus['abandoned'] || 0, color: '#9CA3AF' },
  ] : [];

  const mockMonthlyData = Array.from({ length: 12 }, (_, i) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
    books: Math.floor(Math.random() * 5),
    pages: Math.floor(Math.random() * 200),
    hours: Math.round(Math.random() * 10),
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading stats...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Reading Statistics
          </h2>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl">📚</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Total Books</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.totalBooks || 0}</p>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl">🔥</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Current Streak</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.currentStreak || 0} days</p>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl">🏆</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Longest Streak</p>
            <p className="text-3xl font-bold text-gray-900">{stats?.longestStreak || 0} days</p>
          </div>
        </div>
      </div>

      <div className="bg-white overflow-hidden shadow rounded-lg p-6">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <span className="text-3xl">📄</span>
          </div>
          <div className="ml-4 flex-1">
            <p className="text-sm font-medium text-gray-500 truncate">Avg Reading Speed</p>
            <p className="text-3xl font-bold text-gray-900">
              {stats?.averageReadingSpeed ? Math.round(stats.averageReadingSpeed) : 0}
            </p>
            <p className="text-xs text-gray-400">pages/hour</p>
          </div>
        </div>
      </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Books by Status</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={statusData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {statusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Reading Activity</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={mockMonthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="books" fill="#3B82F6" name="Books Read" />
          </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>

    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Reading Progress Over Time</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={mockMonthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="pages" stroke="#10B981" name="Pages Read" strokeWidth={2} />
            <Line type="monotone" dataKey="hours" stroke="#3B82F6" name="Hours Read" strokeWidth={2} />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>

    {stats?.favoriteTags && stats.favoriteTags.length > 0 && (
      <div className="bg-white shadow rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Favorite Tags</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {stats.favoriteTags.slice(0, 8).map((tagData, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-900">{tagData.tag}</p>
              <p className="text-2xl font-bold text-blue-600">{tagData.count} books</p>
            </div>
          ))}
        </div>
      </div>
    )}

    <div className="bg-gradient-to-r from-blue-500 to-blue-600 shadow rounded-lg p-6 text-white">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium">Generate Annual Reading Report</h3>
          <p className="text-blue-100 mt-1">View your complete reading history and insights</p>
        </div>
        <a
          href="/annual-report"
          className="px-4 py-2 bg-white text-blue-600 rounded-md font-medium hover:bg-blue-50 transition-colors"
        >
          View Report
        </a>
      </div>
    </div>
  </div>
  );
};

export default Stats;
