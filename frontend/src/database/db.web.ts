// Web fallback for SQLite - uses localStorage
// This allows the app to work in web preview, but full functionality is on native

let mockData = {
  programs: [],
  exercises: [],
  weeklyPlans: [],
  waterLogs: [],
  workouts: [],
  settings: { daily_water_goal: '2000' }
};

export const initDatabase = async () => {
  console.log('Using web database fallback (localStorage)');
  
  // Try to load from localStorage
  const stored = localStorage.getItem('fitness_app_data');
  if (stored) {
    mockData = JSON.parse(stored);
  }
  
  return {
    execAsync: async () => {},
    getAllAsync: async (query: string) => {
      if (query.includes('workout_programs')) return [];
      if (query.includes('exercises')) return [];
      if (query.includes('water_logs')) return [];
      if (query.includes('workout_completions')) return [];
      return [];
    },
    getFirstAsync: async (query: string) => {
      if (query.includes('daily_water_goal')) {
        return { setting_value: '2000' };
      }
      if (query.includes('SUM(amount_ml)')) {
        return { total: 0 };
      }
      if (query.includes('COUNT(*)')) {
        return { count: 0 };
      }
      return null;
    },
    runAsync: async () => ({ lastInsertRowId: 1 })
  };
};

export const getDatabase = () => {
  return {
    execAsync: async () => {},
    getAllAsync: async (query: string) => {
      if (query.includes('workout_programs')) return [];
      if (query.includes('exercises')) return [];
      if (query.includes('water_logs')) return [];
      if (query.includes('workout_completions')) return [];
      return [];
    },
    getFirstAsync: async (query: string) => {
      if (query.includes('daily_water_goal')) {
        return { setting_value: '2000' };
      }
      if (query.includes('SUM(amount_ml)')) {
        return { total: 0 };
      }
      if (query.includes('COUNT(*)')) {
        return { count: 0 };
      }
      return null;
    },
    runAsync: async () => ({ lastInsertRowId: 1 })
  };
};

export const seedInitialData = async () => {
  console.log('Web mode: Seed data not available in web preview. Use Expo Go app for full functionality.');
};
