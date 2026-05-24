import * as SQLite from 'expo-sqlite';

let db: any = null;

export const initDatabase = async () => {
  try {
    // For web, use a mock database (SQLite shim is loaded via metro config)
    db = await SQLite.openDatabaseAsync('fitness_app.db');
    
    // Check if db has the methods (native) or is the web shim
    if (!db || typeof db.execAsync !== 'function') {
      console.log('Running with mock database (web mode)');
      db = {
        execAsync: async () => {},
        getAllAsync: async () => [],
        getFirstAsync: async () => null,
        runAsync: async () => ({ lastInsertRowId: 1 })
      };
      return db;
    }

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
        duration_weeks INTEGER DEFAULT 4,
        icon TEXT
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
        icon TEXT,
        emoji TEXT,
        calories_per_min INTEGER DEFAULT 8
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
    // Fallback to mock
    db = {
      execAsync: async () => {},
      getAllAsync: async () => [],
      getFirstAsync: async () => null,
      runAsync: async () => ({ lastInsertRowId: 1 })
    };
    return db;
  }
};

export const getDatabase = () => {
  if (!db) {
    throw new Error('Database not initialized. Call initDatabase first.');
  }
  return db;
};

export const seedInitialData = async () => {
  const database = getDatabase();
  
  // Check if data already exists
  try {
    const existingPrograms: any = await database.getAllAsync('SELECT * FROM workout_programs');
    if (existingPrograms && existingPrograms.length > 0) {
      console.log('Data already seeded');
      return;
    }
  } catch (e) {
    console.log('Skipping seed (web mode)');
    return;
  }
  
  // ============ EXERCISES ============
  const exercises = [
    // Easy exercises
    {
      name: 'Push-ups', name_tr: 'Şınav',
      description_tr: 'Göğüs, omuz ve triceps kaslarını çalıştıran temel egzersiz',
      instructions_tr: '1. Plank pozisyonunda başlayın\n2. Elleri omuz genişliğinde yerleştirin\n3. Vücudu düz tutarak aşağı inin\n4. Göğüs yere yakın olduğunda geri itin\n5. Tekrarlayın',
      muscle_group_tr: 'Göğüs, Omuz, Triceps', difficulty: 'easy', emoji: '💪', icon: 'arm-flex', calories: 8
    },
    {
      name: 'Squats', name_tr: 'Squat',
      description_tr: 'Bacak ve kalça kaslarını güçlendiren temel egzersiz',
      instructions_tr: '1. Ayaklar omuz genişliğinde durun\n2. Kollar öne uzatın\n3. Kalçayı geriye doğru iterek çömelin\n4. Dizler ayak parmaklarını geçmemeli\n5. Topuklardan iterek kalkın',
      muscle_group_tr: 'Bacak, Kalça, Core', difficulty: 'easy', emoji: '🦵', icon: 'human-handsdown', calories: 9
    },
    {
      name: 'Plank', name_tr: 'Plank',
      description_tr: 'Core kaslarını güçlendiren izometrik egzersiz',
      instructions_tr: '1. Dirsekler omuz hizasında yere koyun\n2. Vücudu düz bir çizgi oluşturun\n3. Core kaslarını sıkın\n4. Pozisyonu sürdürün\n5. Derin nefes alın',
      muscle_group_tr: 'Core, Omuz', difficulty: 'easy', emoji: '🧘', icon: 'meditation', calories: 5
    },
    {
      name: 'Jumping Jacks', name_tr: 'Atlama Jakı',
      description_tr: 'Isınma ve kardiyo için temel egzersiz',
      instructions_tr: '1. Ayaklar bitişik, eller yanlarda durun\n2. Zıplayarak ayakları açın\n3. Kolları başın üstünde çırpın\n4. Zıplayarak başlangıca dönün\n5. Ritmik tekrarlayın',
      muscle_group_tr: 'Kardiyovasküler, Tüm Vücut', difficulty: 'easy', emoji: '🤸', icon: 'human', calories: 10
    },
    {
      name: 'Wall Push-ups', name_tr: 'Duvar Şınavı',
      description_tr: 'Yeni başlayanlar için kolay şınav varyasyonu',
      instructions_tr: '1. Duvarın bir kol mesafesinde durun\n2. Ellerinizi duvara koyun\n3. Vücudunuzu düz tutun\n4. Yavaşça duvara doğru eğilin\n5. Geri itin',
      muscle_group_tr: 'Göğüs, Omuz', difficulty: 'easy', emoji: '🙌', icon: 'hand-back-right', calories: 6
    },
    {
      name: 'Glute Bridge', name_tr: 'Köprü',
      description_tr: 'Kalça ve arka bacak kasları için harika egzersiz',
      instructions_tr: '1. Sırt üstü yatın\n2. Dizleri bükün, ayakları yerde tutun\n3. Kalçayı yukarı kaldırın\n4. Üstte 2 saniye tutun\n5. Yavaşça indirin',
      muscle_group_tr: 'Kalça, Arka Bacak', difficulty: 'easy', emoji: '🍑', icon: 'human-handsup', calories: 7
    },
    {
      name: 'Crunches', name_tr: 'Mekik',
      description_tr: 'Karın kaslarını çalıştıran klasik egzersiz',
      instructions_tr: '1. Sırt üstü yatın, dizler bükük\n2. Elleri başın arkasına koyun\n3. Omuzları yerden kaldırın\n4. Karın kaslarını sıkın\n5. Yavaşça indirin',
      muscle_group_tr: 'Karın, Core', difficulty: 'easy', emoji: '🔥', icon: 'fire', calories: 7
    },
    // Medium exercises
    {
      name: 'Lunges', name_tr: 'Hamle',
      description_tr: 'Bacak ve denge geliştiren tek ayak egzersizi',
      instructions_tr: '1. Dik duruşta başlayın\n2. Bir adım öne atın\n3. Ön diz 90 derece bükün\n4. Arka diz yere yaklaşsın\n5. Başlangıç pozisyonuna dönün',
      muscle_group_tr: 'Bacak, Kalça, Core', difficulty: 'medium', emoji: '🏃', icon: 'run', calories: 11
    },
    {
      name: 'Mountain Climbers', name_tr: 'Dağcı',
      description_tr: 'Kardiyo ve core için dinamik egzersiz',
      instructions_tr: '1. Plank pozisyonunda başlayın\n2. Bir dizi göğse doğru çekin\n3. Hızla bacakları değiştirin\n4. Core sıkı tutun\n5. Tempolu devam edin',
      muscle_group_tr: 'Core, Kardiyovasküler', difficulty: 'medium', emoji: '⛰️', icon: 'image-filter-hdr', calories: 12
    },
    {
      name: 'Bicycle Crunches', name_tr: 'Bisiklet Mekiği',
      description_tr: 'Yan karın kaslarını çalıştıran dinamik egzersiz',
      instructions_tr: '1. Sırt üstü yatın\n2. Elleri başın arkasına koyun\n3. Dizleri 90 derece bükün\n4. Sağ dirseği sol dize değdirin\n5. Pedal çevirir gibi değiştirin',
      muscle_group_tr: 'Karın, Yan Karın', difficulty: 'medium', emoji: '🚴', icon: 'bike', calories: 10
    },
    {
      name: 'Russian Twists', name_tr: 'Rus Dönüşü',
      description_tr: 'Yan karın kaslarını hedefleyen rotasyon egzersizi',
      instructions_tr: '1. Oturun, dizleri bükün\n2. Hafif geriye yaslanın\n3. Ayakları yerden kaldırın\n4. Vücudu sağa-sola döndürün\n5. Core sürekli sıkı tutun',
      muscle_group_tr: 'Yan Karın, Core', difficulty: 'medium', emoji: '🌀', icon: 'rotate-3d-variant', calories: 9
    },
    {
      name: 'High Knees', name_tr: 'Yüksek Diz',
      description_tr: 'Yüksek tempolu kardiyo egzersizi',
      instructions_tr: '1. Yerinde duruşta başlayın\n2. Sağ dizinizi göğse doğru kaldırın\n3. Hızla sol dize geçin\n4. Kolları zıt yönde sallayın\n5. Tempolu devam edin',
      muscle_group_tr: 'Kardiyo, Bacak', difficulty: 'medium', emoji: '🦵', icon: 'run-fast', calories: 13
    },
    // Hard exercises
    {
      name: 'Burpees', name_tr: 'Burpee',
      description_tr: 'Tüm vücudu çalıştıran yüksek yoğunluklu egzersiz',
      instructions_tr: '1. Ayakta durun\n2. Çömelerek elleri yere koyun\n3. Plank pozisyonuna atlayın\n4. Bir şınav çekin\n5. Ayaklara atlayıp zıplayın',
      muscle_group_tr: 'Tüm Vücut', difficulty: 'hard', emoji: '🔥', icon: 'lightning-bolt', calories: 15
    },
    {
      name: 'Dips', name_tr: 'Dips',
      description_tr: 'Triceps ve göğüs için ileri seviye egzersiz',
      instructions_tr: '1. Paralel barlar veya sandalye kullanın\n2. Kollar düz, vücut asılı\n3. Dirsekleri bükün ve aşağı inin\n4. 90 derece olduğunda durdurun\n5. Kolları düzelterek itin',
      muscle_group_tr: 'Triceps, Göğüs', difficulty: 'hard', emoji: '💪', icon: 'weight-lifter', calories: 11
    },
    {
      name: 'Pistol Squats', name_tr: 'Tek Bacak Squat',
      description_tr: 'Tek bacakla yapılan ileri seviye squat',
      instructions_tr: '1. Bir bacak üstünde durun\n2. Diğer bacağı öne uzatın\n3. Kollarınızı dengeleyin\n4. Yavaşça çömelin\n5. Tek bacakla geri kalkın',
      muscle_group_tr: 'Bacak, Denge', difficulty: 'hard', emoji: '🦿', icon: 'human-handsdown', calories: 14
    },
    {
      name: 'Jump Squats', name_tr: 'Sıçramalı Squat',
      description_tr: 'Patlayıcı güç için zorlu squat varyasyonu',
      instructions_tr: '1. Squat pozisyonunda başlayın\n2. Aşağı çömelin\n3. Patlayıcı şekilde zıplayın\n4. Yumuşak iniş yapın\n5. Hemen tekrar çömelin',
      muscle_group_tr: 'Bacak, Patlayıcı Güç', difficulty: 'hard', emoji: '🚀', icon: 'rocket-launch', calories: 14
    },
    {
      name: 'Pull-ups', name_tr: 'Barfiks',
      description_tr: 'Sırt ve kol kasları için klasik üst vücut egzersizi',
      instructions_tr: '1. Bara avuçlar dışa bakacak şekilde tutunun\n2. Kolları tamamen uzatın\n3. Çeneyi barın üzerine çıkarın\n4. Sırt kaslarını sıkın\n5. Kontrollü inin',
      muscle_group_tr: 'Sırt, Biceps', difficulty: 'hard', emoji: '🏋️', icon: 'weight', calories: 12
    },
  ];
  
  for (const ex of exercises) {
    await database.runAsync(
      `INSERT INTO exercises (name, name_tr, description_tr, instructions_tr, muscle_group_tr, difficulty, emoji, icon, calories_per_min) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [ex.name, ex.name_tr, ex.description_tr, ex.instructions_tr, ex.muscle_group_tr, ex.difficulty, ex.emoji, ex.icon, ex.calories]
    );
  }
  
  // ============ WORKOUT PROGRAMS ============
  const programs = [
    { name: 'Beginner Full Body', name_tr: 'Başlangıç Tam Vücut', difficulty: 'easy',
      description_tr: 'Yeni başlayanlar için tasarlanmış hafif ve etkili tam vücut antrenmanı', icon: '🌱' },
    { name: 'Intermediate Strength', name_tr: 'Orta Seviye Güç', difficulty: 'medium',
      description_tr: 'Kas kütlesi ve güç kazanımı için orta seviye program', icon: '⚡' },
    { name: 'Advanced HIIT', name_tr: 'İleri Seviye HIIT', difficulty: 'hard',
      description_tr: 'Maksimum yağ yakımı ve dayanıklılık için ileri seviye program', icon: '🔥' },
  ];
  
  for (const p of programs) {
    await database.runAsync(
      'INSERT INTO workout_programs (name, name_tr, difficulty, description_tr, icon) VALUES (?, ?, ?, ?, ?)',
      [p.name, p.name_tr, p.difficulty, p.description_tr, p.icon]
    );
  }
  
  // ============ WEEKLY PLANS ============
  // Day names in Turkish
  const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];
  
  // Exercise IDs mapping (based on insertion order):
  // 1: Push-ups, 2: Squats, 3: Plank, 4: Jumping Jacks, 5: Wall Push-ups
  // 6: Glute Bridge, 7: Crunches, 8: Lunges, 9: Mountain Climbers, 10: Bicycle Crunches
  // 11: Russian Twists, 12: High Knees, 13: Burpees, 14: Dips, 15: Pistol Squats
  // 16: Jump Squats, 17: Pull-ups
  
  // Easy program (Program ID: 1)
  const easyPlan = [
    { day: 1, exercises: [{ id: 4, sets: 3, reps: '30 saniye', rest: 30 }, { id: 5, sets: 3, reps: '10-12', rest: 60 }, { id: 2, sets: 3, reps: '12-15', rest: 60 }, { id: 3, sets: 3, reps: '20 saniye', rest: 45 }] },
    { day: 2, rest: true },
    { day: 3, exercises: [{ id: 4, sets: 3, reps: '30 saniye', rest: 30 }, { id: 6, sets: 3, reps: '12-15', rest: 60 }, { id: 7, sets: 3, reps: '10-15', rest: 45 }, { id: 3, sets: 3, reps: '20 saniye', rest: 45 }] },
    { day: 4, rest: true },
    { day: 5, exercises: [{ id: 4, sets: 3, reps: '30 saniye', rest: 30 }, { id: 1, sets: 3, reps: '8-10', rest: 60 }, { id: 2, sets: 3, reps: '12-15', rest: 60 }, { id: 6, sets: 3, reps: '12-15', rest: 60 }, { id: 7, sets: 3, reps: '15', rest: 45 }] },
    { day: 6, rest: true },
    { day: 7, rest: true },
  ];
  
  // Medium program (Program ID: 2)
  const mediumPlan = [
    { day: 1, exercises: [{ id: 4, sets: 3, reps: '45 saniye', rest: 30 }, { id: 1, sets: 4, reps: '12-15', rest: 60 }, { id: 8, sets: 3, reps: '10 her bacak', rest: 60 }, { id: 9, sets: 3, reps: '30 saniye', rest: 45 }, { id: 3, sets: 3, reps: '45 saniye', rest: 45 }] },
    { day: 2, exercises: [{ id: 12, sets: 4, reps: '30 saniye', rest: 30 }, { id: 2, sets: 4, reps: '15-20', rest: 60 }, { id: 10, sets: 3, reps: '20', rest: 45 }, { id: 11, sets: 3, reps: '20', rest: 45 }] },
    { day: 3, rest: true },
    { day: 4, exercises: [{ id: 4, sets: 3, reps: '45 saniye', rest: 30 }, { id: 1, sets: 4, reps: '12-15', rest: 60 }, { id: 6, sets: 4, reps: '15-20', rest: 60 }, { id: 9, sets: 3, reps: '40 saniye', rest: 45 }] },
    { day: 5, exercises: [{ id: 12, sets: 4, reps: '40 saniye', rest: 30 }, { id: 8, sets: 4, reps: '12 her bacak', rest: 60 }, { id: 10, sets: 4, reps: '25', rest: 45 }, { id: 3, sets: 3, reps: '60 saniye', rest: 45 }] },
    { day: 6, rest: true },
    { day: 7, rest: true },
  ];
  
  // Hard program (Program ID: 3)
  const hardPlan = [
    { day: 1, exercises: [{ id: 13, sets: 4, reps: '10', rest: 45 }, { id: 1, sets: 4, reps: '15-20', rest: 60 }, { id: 14, sets: 4, reps: '8-12', rest: 60 }, { id: 9, sets: 4, reps: '45 saniye', rest: 45 }, { id: 3, sets: 3, reps: '60 saniye', rest: 45 }] },
    { day: 2, exercises: [{ id: 16, sets: 5, reps: '15', rest: 45 }, { id: 15, sets: 3, reps: '5 her bacak', rest: 60 }, { id: 8, sets: 4, reps: '15 her bacak', rest: 45 }, { id: 12, sets: 4, reps: '45 saniye', rest: 30 }] },
    { day: 3, exercises: [{ id: 13, sets: 5, reps: '12', rest: 45 }, { id: 17, sets: 4, reps: '6-10', rest: 90 }, { id: 10, sets: 4, reps: '30', rest: 45 }, { id: 11, sets: 4, reps: '30', rest: 45 }] },
    { day: 4, rest: true },
    { day: 5, exercises: [{ id: 4, sets: 4, reps: '60 saniye', rest: 30 }, { id: 16, sets: 5, reps: '15', rest: 45 }, { id: 1, sets: 4, reps: '20', rest: 60 }, { id: 9, sets: 4, reps: '60 saniye', rest: 45 }, { id: 3, sets: 3, reps: '90 saniye', rest: 45 }] },
    { day: 6, exercises: [{ id: 13, sets: 4, reps: '15', rest: 45 }, { id: 14, sets: 3, reps: '10-15', rest: 60 }, { id: 12, sets: 4, reps: '60 saniye', rest: 30 }, { id: 11, sets: 3, reps: '40', rest: 45 }] },
    { day: 7, rest: true },
  ];
  
  const plans: any = { 1: easyPlan, 2: mediumPlan, 3: hardPlan };
  
  for (const programId of [1, 2, 3]) {
    const plan = plans[programId];
    for (const dayData of plan) {
      const result: any = await database.runAsync(
        'INSERT INTO weekly_plans (program_id, week_number, day_number, day_name_tr, is_rest_day) VALUES (?, ?, ?, ?, ?)',
        [programId, 1, dayData.day, dayNames[dayData.day - 1], dayData.rest ? 1 : 0]
      );
      
      if (!dayData.rest && dayData.exercises) {
        const planId = result.lastInsertRowId;
        for (let i = 0; i < dayData.exercises.length; i++) {
          const ex = dayData.exercises[i];
          await database.runAsync(
            'INSERT INTO plan_exercises (plan_id, exercise_id, sets, reps, rest_seconds, order_index) VALUES (?, ?, ?, ?, ?, ?)',
            [planId, ex.id, ex.sets, ex.reps, ex.rest, i]
          );
        }
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
