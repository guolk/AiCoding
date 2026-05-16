import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { readingAPI } from '../api/client';
import { AnnualReport } from '../types';

const AnnualReportPage: React.FC = () => {
  const [year, setYear] = useState(new Date().getFullYear());
  const [report, setReport] = useState<AnnualReport | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadReport();
  }, [year]);

  const loadReport = async () => {
    setLoading(true);
    try {
      const res = await readingAPI.getAnnualReport(year);
      setReport(res.data);
    } catch (error) {
      console.error('Failed to load annual report:', error);
    } finally {
      setLoading(false);
    }
  };

  const years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i);

  const monthlyData = report?.monthlyBreakdown.map((item) => ({
    month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][item.month - 1],
    books: item.books,
    pages: item.pages,
  })) || [];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Generating report...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            {year} Reading Report
          </h2>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <select
            value={year}
            onChange={(e) => setYear(parseInt(e.target.value))}
            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {years.map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-gradient-to-r from-purple-600 to-blue-600 shadow rounded-lg p-8 text-white">
        <div className="text-center">
          <h3 className="text-xl font-medium mb-6">Your Reading Year in Review</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div>
              <p className="text-4xl font-bold">{report?.totalBooksRead || 0}</p>
              <p className="text-purple-200">Books Read</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{report?.totalPagesRead || 0}</p>
              <p className="text-purple-200">Pages Read</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{report?.totalReadingHours || 0}h</p>
              <p className="text-purple-200">Reading Time</p>
            </div>
            <div>
              <p className="text-4xl font-bold">{report?.longestStreak || 0}</p>
              <p className="text-purple-200">Day Streak</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Monthly Reading Breakdown</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="books" fill="#8B5CF6" name="Books" />
                <Bar dataKey="pages" fill="#3B82F6" name="Pages" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Reading Insights</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-blue-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Favorite Genre</p>
                <p className="text-2xl font-bold text-blue-600">{report?.favoriteGenre || 'N/A'}</p>
              </div>
              <span className="text-3xl">🎭</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-green-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Average Rating</p>
                <p className="text-2xl font-bold text-green-600">
                  {report?.averageRating ? `${report.averageRating.toFixed(1)}` : 'N/A'}</p>
              </div>
              <span className="text-3xl">⭐</span>
            </div>
            <div className="flex items-center justify-between p-4 bg-yellow-50 rounded-lg">
              <div>
                <p className="text-sm font-medium text-gray-700">Average per Book</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {report?.totalBooksRead ? Math.round(report.totalReadingHours * 60 / report.totalBooksRead) : 0} min</p>
              </div>
              <span className="text-3xl">⏱️</span>
            </div>
          </div>
        </div>
      </div>

      {report?.topBooks && report.topBooks.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Top Rated Books</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {report.topBooks.slice(0, 5).map((item, index) => (
              <div key={index} className="flex items-center space-x-4 p-4 bg-gray-50 rounded-lg">
                <div className="flex-shrink-0">
                  {item.book.coverUrl ? (
                    <img
                      src={item.book.coverUrl}
                      alt={item.book.title}
                      className="h-16 w-12 object-cover rounded shadow"
                    />
                  ) : (
                    <div className="h-16 w-12 bg-gray-200 rounded flex items-center justify-center text-2xl">📖</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{item.book.title}</p>
                  <p className="text-sm text-gray-500">{item.book.author || 'Unknown Author'}</p>
                  {item.rating && (
                    <div className="flex items-center mt-1">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={i < item.rating! ? 'text-yellow-400' : 'text-gray-300'}>★</span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Reading Goals for Next Year</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🎯</span>
              <div>
                <p className="font-medium text-gray-900">Read More Books</p>
                <p className="text-sm text-gray-500">
                  Target: {(report?.totalBooksRead || 0) + 10} books</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">📖</span>
              <div>
                <p className="font-medium text-gray-900">Expand Genres</p>
                <p className="text-sm text-gray-500">Try 3 new genres</p>
              </div>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-3">
              <span className="text-2xl">🔥</span>
              <div>
                <p className="font-medium text-gray-900">Maintain Streak</p>
                <p className="text-sm text-gray-500">Keep reading every day</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AnnualReportPage;
