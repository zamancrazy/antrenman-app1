import * as SQLite from 'expo-sqlite';

let db: any = null;

export const initDatabase = async () => {
  try {
    // For web, use a mock database
    if (Platform.OS === 'web' || !SQLite) {
      console.log('Running in web mode - using mock database');
      db = {
        execAsync: async () => {},
        getAllAsync: async () => [],
        getFirstAsync: async () => null,
        runAsync: async () => ({ lastInsertRowId: 1 })
      };
      return db;
    }
    
    db = await SQLite.openDatabaseAsync('fitness_app.db');
    
    // Create tables
    await db.execAsync(`
      PRAGMA journal_mode = WAL;
      
      CREATE TABLE IF NOT EXISTS workout_programs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_tr TEXT NOT NULL,
        difficulty TEXT NOT NULL,
        description TEXT,
        description_tr TEXT,
        duration_weeks INTEGER DEFAULT 4
      );
      
      CREATE TABLE IF NOT EXISTS exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        name_tr TEXT NOT NULL,
        description TEXT,
        description_tr TEXT,
        instructions TEXT,
        instructions_tr TEXT,
        muscle_group TEXT,
        muscle_group_tr TEXT,
        difficulty TEXT,
        image_url TEXT,
        video_url TEXT
      );
      
      CREATE TABLE IF NOT EXISTS weekly_plans (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        program_id INTEGER NOT NULL,
        week_number INTEGER NOT NULL,
        day_number INTEGER NOT NULL,
        day_name TEXT,
        day_name_tr TEXT,
        is_rest_day INTEGER DEFAULT 0,
        FOREIGN KEY (program_id) REFERENCES workout_programs (id)
      );
      
      CREATE TABLE IF NOT EXISTS plan_exercises (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        exercise_id INTEGER NOT NULL,
        sets INTEGER DEFAULT 3,
        reps TEXT DEFAULT '10-12',
        rest_seconds INTEGER DEFAULT 60,
        order_index INTEGER DEFAULT 0,
        FOREIGN KEY (plan_id) REFERENCES weekly_plans (id),
        FOREIGN KEY (exercise_id) REFERENCES exercises (id)
      );
      
      CREATE TABLE IF NOT EXISTS water_logs (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL,
        amount_ml INTEGER NOT NULL,
        timestamp TEXT NOT NULL
      );
      
      CREATE TABLE IF NOT EXISTS workout_completions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        plan_id INTEGER NOT NULL,
        completed_date TEXT NOT NULL,
        duration_minutes INTEGER,
        notes TEXT,
        FOREIGN KEY (plan_id) REFERENCES weekly_plans (id)
      );
      
      CREATE TABLE IF NOT EXISTS user_settings (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        setting_key TEXT UNIQUE NOT NULL,
        setting_value TEXT NOT NULL
      );
      
      CREATE INDEX IF NOT EXISTS idx_water_date ON water_logs(date);
      CREATE INDEX IF NOT EXISTS idx_workout_date ON workout_completions(completed_date);
    `);
    
    console.log('Database initialized successfully');
    return db;
  } catch (error) {
    console.error('Database initialization error:', error);
    throw error;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const seedInitialData = async () => {
  // Skip seeding on web platform
  if (Platform.OS === 'web' || !db || !db.getAllAsync) {
    console.log('Skipping seed data for web platform');
    return;
  }
  
  const database = getDatabase();
  
  // Check if data already exists
  const existingPrograms = await database.getAllAsync('SELECT * FROM workout_programs');
  if (existingPrograms.length > 0) {
    console.log('Data already seeded');
    return;
  }
  
  // Insert workout programs
  await database.runAsync(
    'INSERT INTO workout_programs (name, name_tr, difficulty, description_tr) VALUES (?, ?, ?, ?)',
    ['Beginner Full Body', 'Başlangıç Tüm Vücut', 'easy', 'Yeni başlayanlar için tasarlanmış hafif ve etkili tam vücut antrenmanı']
  );
  
  await database.runAsync(
    'INSERT INTO workout_programs (name, name_tr, difficulty, description_tr) VALUES (?, ?, ?, ?)',
    ['Intermediate Strength', 'Orta Seviye Güç', 'medium', 'Kas kütlesi ve güç kazanımı için orta seviye program']
  );
  
  await database.runAsync(
    'INSERT INTO workout_programs (name, name_tr, difficulty, description_tr) VALUES (?, ?, ?, ?)',
    ['Advanced HIIT', 'İleri Seviye HIIT', 'hard', 'Maksimum yağ yakımı ve dayanıklılık için ileri seviye yüksek yoğunluklu interval antrenman']
  );
  
  // Insert exercises
  const exercises = [
    {
      name: 'Push-ups',
      name_tr: 'Şınav',
      description_tr: 'Göğüs, omuz ve triceps kaslarını çalıştıran temel egzersiz',
      instructions_tr: '1. Plank pozisyonunda başlayın\n2. Elleri omuz genişliğinde yerleştirin\n3. Vücudu düz tutarak aşağı inin\n4. Göğüs yere yakın olduğunda geri itin\n5. Tekrarlayın',
      muscle_group_tr: 'Göğüs, Omuz, Triceps',
      difficulty: 'easy'
    },
    {
      name: 'Squats',
      name_tr: 'Squat',
      description_tr: 'Bacak ve kalça kaslarını güçlendiren temel egzersiz',
      instructions_tr: '1. Ayaklar omuz genişliğinde durun\n2. Kollar öne uzatın\n3. Kalçayı geriye doğru iterek çömelin\n4. Dizler ayak parmaklarını geçmemeli\n5. Topuklardan iterek kalkın',
      muscle_group_tr: 'Bacak, Kalça, Core',
      difficulty: 'easy'
    },
    {
      name: 'Plank',
      name_tr: 'Plank',
      description_tr: 'Core kaslarını güçlendiren izometrik egzersiz',
      instructions_tr: '1. Dirsekler omuz hizasında yere koyun\n2. Vücudu düz bir çizgi oluşturun\n3. Core kaslarını sıkın\n4. Pozisyonu sürdürün\n5. Derin nefes alın',
      muscle_group_tr: 'Core, Omuz',
      difficulty: 'easy'
    },
    {
      name: 'Lunges',
      name_tr: 'Hamle',
      description_tr: 'Bacak ve denge geliştiren tek ayak egzersizi',
      instructions_tr: '1. Dik duruşta başlayın\n2. Bir adım öne atın\n3. Ön diz 90 derece bükün\n4. Arka diz yere yaklaşsın\n5. Başlangıç pozisyonuna dönün',
      muscle_group_tr: 'Bacak, Kalça, Core',
      difficulty: 'medium'
    },
    {
      name: 'Burpees',
      name_tr: 'Burpee',
      description_tr: 'Tüm vücudu çalıştıran yüksek yoğunluklu egzersiz',
      instructions_tr: '1. Ayakta durun\n2. Çömelerek elleri yere koyun\n3. Plank pozisyonuna atlayın\n4. Bir şınav çekin\n5. Ayaklara atlayıp zıplayın',
      muscle_group_tr: 'Tüm Vücut',
      difficulty: 'hard'
    },
    {
      name: 'Mountain Climbers',
      name_tr: 'Dağcı',
      description_tr: 'Kardiyo ve core için dinamik egzersiz',
      instructions_tr: '1. Plank pozisyonunda başlayın\n2. Bir dizi göğse doğru çekin\n3. Hızla bacakları değiştirin\n4. Core sıkı tutun\n5. Tempolu devam edin',
      muscle_group_tr: 'Core, Kardiyovasküler',
      difficulty: 'medium'
    },
    {
      name: 'Jumping Jacks',
      name_tr: 'Atlama Jakı',
      description_tr: 'Isınma ve kardiyo için temel egzersiz',
      instructions_tr: '1. Ayaklar bitişik, eller yanlarda durun\n2. Zıplayarak ayakları açın\n3. Kolları başın üstünde çırpın\n4. Zıplayarak başlangıca dönün\n5. Ritmik tekrarlayın',
      muscle_group_tr: 'Kardiyovasküler, Tüm Vücut',
      difficulty: 'easy'
    },
    {
      name: 'Dips',
      name_tr: 'Dips',
      description_tr: 'Triceps ve göğüs için ileri seviye egzersiz',
      instructions_tr: '1. Paralel barlar veya sandalye kullanın\n2. Kollar düz, vücut asılı\n3. Dirsekleri bükün ve aşağı inin\n4. 90 derece olduğunda durdurun\n5. Kolları düzelterek itin',
      muscle_group_tr: 'Triceps, Göğüs, Omuz',
      difficulty: 'hard'
    }
  ];
  
  for (const exercise of exercises) {
    await database.runAsync(
      `INSERT INTO exercises (name, name_tr, description_tr, instructions_tr, muscle_group_tr, difficulty) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [exercise.name, exercise.name_tr, exercise.description_tr, exercise.instructions_tr, exercise.muscle_group_tr, exercise.difficulty]
    );
  }
  
  // Create weekly plans for Beginner program (Program ID: 1)
  const days = [
    { day: 1, name_tr: 'Pazartesi', exercises: [1, 2, 3] },
    { day: 2, name_tr: 'Salı', rest: true },
    { day: 3, name_tr: 'Çarşamba', exercises: [7, 2, 3] },
    { day: 4, name_tr: 'Perşembe', rest: true },
    { day: 5, name_tr: 'Cuma', exercises: [1, 4, 3] },
    { day: 6, name_tr: 'Cumartesi', rest: true },
    { day: 7, name_tr: 'Pazar', rest: true }
  ];
  
  for (const day of days) {
    const result = await database.runAsync(
      'INSERT INTO weekly_plans (program_id, week_number, day_number, day_name_tr, is_rest_day) VALUES (?, ?, ?, ?, ?)',
      [1, 1, day.day, day.name_tr, day.rest ? 1 : 0]
    );
    
    if (!day.rest && day.exercises) {
      const planId = result.lastInsertRowId;
      for (let i = 0; i < day.exercises.length; i++) {
        await database.runAsync(
          'INSERT INTO plan_exercises (plan_id, exercise_id, sets, reps, rest_seconds, order_index) VALUES (?, ?, ?, ?, ?, ?)',
          [planId, day.exercises[i], 3, '10-12', 60, i]
        );
      }
    }
  }
  
  // Set default water goal
  await database.runAsync(
    'INSERT INTO user_settings (setting_key, setting_value) VALUES (?, ?)',
    ['daily_water_goal', '2000']
  );
  
  console.log('Initial data seeded successfully');
};