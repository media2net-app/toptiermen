'use client';

import { useState } from 'react';
import { 
  AcademicCapIcon,
  FireIcon,
  ChatBubbleLeftRightIcon,
  BookOpenIcon,
  ChartBarIcon,
  EyeIcon,
  ClockIcon,
  StarIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

// Mock data voor gedetailleerde analytics
const analyticsData = {
  academy: {
    modules: [
      { name: 'Brotherhood', completionRate: 85, views: 1247, avgTime: 45, satisfaction: 4.8 },
      { name: 'Discipline & Identiteit', completionRate: 78, views: 1156, avgTime: 38, satisfaction: 4.6 },
      { name: 'Fysieke Dominantie', completionRate: 72, views: 987, avgTime: 52, satisfaction: 4.4 },
      { name: 'Financiële Meestery', completionRate: 68, views: 856, avgTime: 41, satisfaction: 4.7 },
      { name: 'Mindset & Focus', completionRate: 65, views: 743, avgTime: 35, satisfaction: 4.5 }
    ],
    trends: {
      totalCompletions: +15,
      avgCompletionRate: +8,
      userSatisfaction: +12
    }
  },
  training: {
    workouts: [
      { name: 'Alpha Strength', completionRate: 89, favorites: 234, avgDuration: 65, difficulty: 'Advanced' },
      { name: 'Endurance Builder', completionRate: 82, favorites: 189, avgDuration: 45, difficulty: 'Intermediate' },
      { name: 'Core Dominance', completionRate: 76, favorites: 156, avgDuration: 30, difficulty: 'Beginner' },
      { name: 'Power Lifting', completionRate: 71, favorites: 123, avgDuration: 75, difficulty: 'Advanced' },
      { name: 'Cardio Blast', completionRate: 68, favorites: 98, avgDuration: 40, difficulty: 'Intermediate' }
    ],
    trends: {
      totalWorkouts: +22,
      avgCompletionRate: +5,
      userEngagement: +18
    }
  },
  forum: {
    topics: [
      { name: 'Fitness & Training', posts: 456, views: 2341, avgResponseTime: 6.2, engagement: 89 },
      { name: 'Mindset & Discipline', posts: 389, views: 1987, avgResponseTime: 8.5, engagement: 76 },
      { name: 'Finance & Business', posts: 234, views: 1456, avgResponseTime: 12.1, engagement: 65 },
      { name: 'Brotherhood & Community', posts: 198, views: 1234, avgResponseTime: 4.8, engagement: 92 },
      { name: 'Nutrition & Health', posts: 167, views: 987, avgResponseTime: 9.3, engagement: 58 }
    ],
    contributors: [
      { name: '@discipline_daniel', posts: 46, helpfulVotes: 89, avgResponseTime: 3.2, influence: 95 },
      { name: '@alpha_mike', posts: 38, helpfulVotes: 67, avgResponseTime: 4.1, influence: 87 },
      { name: '@warrior_tom', posts: 32, helpfulVotes: 54, avgResponseTime: 5.8, influence: 76 },
      { name: '@elite_james', posts: 28, helpfulVotes: 43, avgResponseTime: 6.2, influence: 68 },
      { name: '@veteran_paul', posts: 25, helpfulVotes: 38, avgResponseTime: 7.1, influence: 62 }
    ],
    trends: {
      totalPosts: +34,
      avgResponseTime: -2.1,
      userEngagement: +15
    }
  },
  books: {
    popularBooks: [
      { name: 'Can\'t Hurt Me', reads: 234, completionRate: 78, avgRating: 4.8, category: 'Mindset' },
      { name: 'Atomic Habits', reads: 198, completionRate: 82, avgRating: 4.7, category: 'Productivity' },
      { name: 'Rich Dad Poor Dad', reads: 167, completionRate: 71, avgRating: 4.5, category: 'Finance' },
      { name: 'The 4-Hour Workweek', reads: 145, completionRate: 68, avgRating: 4.3, category: 'Lifestyle' },
      { name: 'Think and Grow Rich', reads: 123, completionRate: 75, avgRating: 4.6, category: 'Success' }
    ],
    trends: {
      totalReads: +28,
      avgCompletionRate: +6,
      userSatisfaction: +9
    }
  }
};

export default function AnalyticsPage() {
  const [selectedCategory, setSelectedCategory] = useState<'academy' | 'training' | 'forum' | 'books'>('academy');
  const [selectedPeriod, setSelectedPeriod] = useState('30d');

  const getTrendIcon = (trend: number) => {
    if (trend > 0) return <ArrowUpIcon className="w-4 h-4 text-green-400" />;
    return <ArrowDownIcon className="w-4 h-4 text-red-400" />;
  };

  const getTrendColor = (trend: number) => {
    if (trend > 0) return 'text-green-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#8BAE5A]">Content Analytics</h1>
          <p className="text-[#B6C948] mt-2">Gedetailleerde prestaties van je content</p>
        </div>
        <div className="flex items-center gap-4">
          <select 
            value={selectedPeriod} 
            onChange={(e) => setSelectedPeriod(e.target.value)}
            className="px-4 py-2 rounded-xl bg-[#232D1A] text-[#8BAE5A] border border-[#3A4D23] focus:outline-none focus:ring-2 focus:ring-[#8BAE5A]"
          >
            <option value="7d">Laatste 7 dagen</option>
            <option value="30d">Laatste 30 dagen</option>
            <option value="90d">Laatste 90 dagen</option>
          </select>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="flex space-x-1 bg-[#181F17] rounded-lg p-1">
        <button
          onClick={() => setSelectedCategory('academy')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            selectedCategory === 'academy'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <AcademicCapIcon className="w-5 h-5" />
          Academy
        </button>
        <button
          onClick={() => setSelectedCategory('training')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            selectedCategory === 'training'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <FireIcon className="w-5 h-5" />
          Training
        </button>
        <button
          onClick={() => setSelectedCategory('forum')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            selectedCategory === 'forum'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <ChatBubbleLeftRightIcon className="w-5 h-5" />
          Forum
        </button>
        <button
          onClick={() => setSelectedCategory('books')}
          className={`flex-1 py-3 px-4 rounded-md font-medium transition-colors flex items-center justify-center gap-2 ${
            selectedCategory === 'books'
              ? 'bg-[#8BAE5A] text-black'
              : 'text-white/60 hover:text-white'
          }`}
        >
          <BookOpenIcon className="w-5 h-5" />
          Boekenkamer
        </button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {selectedCategory === 'academy' && (
          <>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.academy.trends.totalCompletions)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.academy.trends.totalCompletions)}`}>
                    {analyticsData.academy.trends.totalCompletions}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">1,247</h3>
                <p className="text-[#B6C948] text-sm">Module Voltooiingen</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <EyeIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.academy.trends.avgCompletionRate)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.academy.trends.avgCompletionRate)}`}>
                    {analyticsData.academy.trends.avgCompletionRate}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">73.6%</h3>
                <p className="text-[#B6C948] text-sm">Gem. Completion Rate</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.academy.trends.userSatisfaction)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.academy.trends.userSatisfaction)}`}>
                    {analyticsData.academy.trends.userSatisfaction}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">4.6/5</h3>
                <p className="text-[#B6C948] text-sm">Gem. Tevredenheid</p>
              </div>
            </div>
          </>
        )}

        {selectedCategory === 'training' && (
          <>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <FireIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.training.trends.totalWorkouts)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.training.trends.totalWorkouts)}`}>
                    {analyticsData.training.trends.totalWorkouts}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">2,456</h3>
                <p className="text-[#B6C948] text-sm">Workout Voltooiingen</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.training.trends.avgCompletionRate)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.training.trends.avgCompletionRate)}`}>
                    {analyticsData.training.trends.avgCompletionRate}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">77.2%</h3>
                <p className="text-[#B6C948] text-sm">Gem. Completion Rate</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.training.trends.userEngagement)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.training.trends.userEngagement)}`}>
                    {analyticsData.training.trends.userEngagement}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">800</h3>
                <p className="text-[#B6C948] text-sm">Favorieten Toegevoegd</p>
              </div>
            </div>
          </>
        )}

        {selectedCategory === 'forum' && (
          <>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.forum.trends.totalPosts)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.forum.trends.totalPosts)}`}>
                    {analyticsData.forum.trends.totalPosts}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">1,444</h3>
                <p className="text-[#B6C948] text-sm">Nieuwe Posts</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <ClockIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.forum.trends.avgResponseTime)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.forum.trends.avgResponseTime)}`}>
                    {analyticsData.forum.trends.avgResponseTime}min
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">7.2min</h3>
                <p className="text-[#B6C948] text-sm">Gem. Response Time</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.forum.trends.userEngagement)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.forum.trends.userEngagement)}`}>
                    {analyticsData.forum.trends.userEngagement}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">76%</h3>
                <p className="text-[#B6C948] text-sm">Gem. Engagement</p>
              </div>
            </div>
          </>
        )}

        {selectedCategory === 'books' && (
          <>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <BookOpenIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.books.trends.totalReads)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.books.trends.totalReads)}`}>
                    {analyticsData.books.trends.totalReads}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">867</h3>
                <p className="text-[#B6C948] text-sm">Boek Voltooiingen</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <ChartBarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.books.trends.avgCompletionRate)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.books.trends.avgCompletionRate)}`}>
                    {analyticsData.books.trends.avgCompletionRate}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">74.8%</h3>
                <p className="text-[#B6C948] text-sm">Gem. Completion Rate</p>
              </div>
            </div>
            <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-xl bg-[#8BAE5A]/20">
                  <StarIcon className="w-6 h-6 text-[#8BAE5A]" />
                </div>
                <div className="flex items-center gap-1">
                  {getTrendIcon(analyticsData.books.trends.userSatisfaction)}
                  <span className={`text-sm font-medium ${getTrendColor(analyticsData.books.trends.userSatisfaction)}`}>
                    {analyticsData.books.trends.userSatisfaction}%
                  </span>
                </div>
              </div>
              <div>
                <h3 className="text-2xl font-bold text-[#8BAE5A]">4.6/5</h3>
                <p className="text-[#B6C948] text-sm">Gem. Rating</p>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Detailed Performance Table */}
      <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-[#8BAE5A]">
            {selectedCategory === 'academy' && 'Top Modules'}
            {selectedCategory === 'training' && 'Top Workouts'}
            {selectedCategory === 'forum' && 'Top Topics'}
            {selectedCategory === 'books' && 'Populaire Boeken'}
          </h2>
          <button className="text-[#8BAE5A] text-sm font-medium hover:text-[#B6C948] transition">
            Bekijk alle
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-[#181F17]">
              <tr>
                <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Naam</th>
                {selectedCategory === 'academy' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Completion Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Avg. Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Satisfaction</th>
                  </>
                )}
                {selectedCategory === 'training' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Completion Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Favorieten</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Duration</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Difficulty</th>
                  </>
                )}
                {selectedCategory === 'forum' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Posts</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Views</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Response Time</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Engagement</th>
                  </>
                )}
                {selectedCategory === 'books' && (
                  <>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Reads</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Completion Rate</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Rating</th>
                    <th className="px-6 py-4 text-left text-sm font-medium text-[#8BAE5A]">Category</th>
                  </>
                )}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#3A4D23]">
              {selectedCategory === 'academy' && analyticsData.academy.modules.map((module, index) => (
                <tr key={index} className="hover:bg-[#181F17]/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#8BAE5A]">{module.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{module.completionRate}%</span>
                      <div className="w-16 h-2 bg-[#374151] rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full"
                          style={{ width: `${module.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{module.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{module.avgTime}min</td>
                  <td className="px-6 py-4 text-white">{module.satisfaction}/5</td>
                </tr>
              ))}
              
              {selectedCategory === 'training' && analyticsData.training.workouts.map((workout, index) => (
                <tr key={index} className="hover:bg-[#181F17]/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#8BAE5A]">{workout.name}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{workout.completionRate}%</span>
                      <div className="w-16 h-2 bg-[#374151] rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full"
                          style={{ width: `${workout.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{workout.favorites}</td>
                  <td className="px-6 py-4 text-white">{workout.avgDuration}min</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      workout.difficulty === 'Advanced' ? 'bg-red-900/30 text-red-400' :
                      workout.difficulty === 'Intermediate' ? 'bg-yellow-900/30 text-yellow-400' :
                      'bg-green-900/30 text-green-400'
                    }`}>
                      {workout.difficulty}
                    </span>
                  </td>
                </tr>
              ))}
              
              {selectedCategory === 'forum' && analyticsData.forum.topics.map((topic, index) => (
                <tr key={index} className="hover:bg-[#181F17]/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#8BAE5A]">{topic.name}</div>
                  </td>
                  <td className="px-6 py-4 text-white">{topic.posts}</td>
                  <td className="px-6 py-4 text-white">{topic.views.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white">{topic.avgResponseTime}min</td>
                  <td className="px-6 py-4 text-white">{topic.engagement}%</td>
                </tr>
              ))}
              
              {selectedCategory === 'books' && analyticsData.books.popularBooks.map((book, index) => (
                <tr key={index} className="hover:bg-[#181F17]/50">
                  <td className="px-6 py-4">
                    <div className="font-medium text-[#8BAE5A]">{book.name}</div>
                  </td>
                  <td className="px-6 py-4 text-white">{book.reads}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-white">{book.completionRate}%</span>
                      <div className="w-16 h-2 bg-[#374151] rounded-full">
                        <div 
                          className="h-full bg-gradient-to-r from-[#8BAE5A] to-[#B6C948] rounded-full"
                          style={{ width: `${book.completionRate}%` }}
                        ></div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-white">{book.avgRating}/5</td>
                  <td className="px-6 py-4 text-white">{book.category}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Top Contributors (Forum only) */}
      {selectedCategory === 'forum' && (
        <div className="bg-[#232D1A] rounded-2xl p-6 border border-[#3A4D23]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[#8BAE5A]">Top Contributors</h2>
            <button className="text-[#8BAE5A] text-sm font-medium hover:text-[#B6C948] transition">
              Bekijk alle
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {analyticsData.forum.contributors.map((contributor, index) => (
              <div key={index} className="bg-[#181F17] rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-semibold text-[#8BAE5A]">{contributor.name}</h3>
                  <span className="text-xs text-[#B6C948]">#{index + 1}</span>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-[#B6C948]">Posts:</span>
                    <span className="text-white">{contributor.posts}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#B6C948]">Helpful Votes:</span>
                    <span className="text-white">{contributor.helpfulVotes}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#B6C948]">Response Time:</span>
                    <span className="text-white">{contributor.avgResponseTime}min</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-[#B6C948]">Influence:</span>
                    <span className="text-white">{contributor.influence}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 