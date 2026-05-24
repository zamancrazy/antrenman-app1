// Empty shim for expo-sqlite web with mock data for preview
// SQLite is not available in web, full functionality available in Expo Go app

const mockExercises = [
  { id: 1, name_tr: 'Şınav', emoji: '💪', muscle_group_tr: 'Göğüs, Omuz, Triceps', difficulty: 'easy',
    description_tr: 'Göğüs, omuz ve triceps kaslarını çalıştıran temel egzersiz',
    instructions_tr: '1. Plank pozisyonunda başlayın\n2. Elleri omuz genişliğinde yerleştirin\n3. Vücudu düz tutarak aşağı inin\n4. Göğüs yere yakın olduğunda geri itin\n5. Tekrarlayın' },
  { id: 2, name_tr: 'Squat', emoji: '🦵', muscle_group_tr: 'Bacak, Kalça, Core', difficulty: 'easy',
    description_tr: 'Bacak ve kalça kaslarını güçlendiren temel egzersiz',
    instructions_tr: '1. Ayaklar omuz genişliğinde durun\n2. Kollar öne uzatın\n3. Kalçayı geriye doğru iterek çömelin\n4. Dizler ayak parmaklarını geçmemeli\n5. Topuklardan iterek kalkın' },
  { id: 3, name_tr: 'Plank', emoji: '🧘', muscle_group_tr: 'Core, Omuz', difficulty: 'easy',
    description_tr: 'Core kaslarını güçlendiren izometrik egzersiz',
    instructions_tr: '1. Dirsekler omuz hizasında yere koyun\n2. Vücudu düz bir çizgi oluşturun\n3. Core kaslarını sıkın\n4. Pozisyonu sürdürün\n5. Derin nefes alın' },
  { id: 4, name_tr: 'Atlama Jakı', emoji: '🤸', muscle_group_tr: 'Kardiyo, Tüm Vücut', difficulty: 'easy',
    description_tr: 'Isınma ve kardiyo için temel egzersiz',
    instructions_tr: '1. Ayaklar bitişik durun\n2. Zıplayarak ayakları açın\n3. Kolları başın üstünde çırpın\n4. Zıplayarak başlangıca dönün\n5. Ritmik tekrarlayın' },
  { id: 5, name_tr: 'Duvar Şınavı', emoji: '🙌', muscle_group_tr: 'Göğüs, Omuz', difficulty: 'easy',
    description_tr: 'Yeni başlayanlar için kolay şınav varyasyonu', instructions_tr: '1. Duvarın bir kol mesafesinde durun\n2. Ellerinizi duvara koyun\n3. Vücudunuzu düz tutun\n4. Yavaşça duvara doğru eğilin\n5. Geri itin' },
  { id: 6, name_tr: 'Köprü', emoji: '🍑', muscle_group_tr: 'Kalça, Arka Bacak', difficulty: 'easy',
    description_tr: 'Kalça ve arka bacak kasları için harika egzersiz',
    instructions_tr: '1. Sırt üstü yatın\n2. Dizleri bükün, ayakları yerde tutun\n3. Kalçayı yukarı kaldırın\n4. Üstte 2 saniye tutun\n5. Yavaşça indirin' },
  { id: 7, name_tr: 'Mekik', emoji: '🔥', muscle_group_tr: 'Karın, Core', difficulty: 'easy',
    description_tr: 'Karın kaslarını çalıştıran klasik egzersiz',
    instructions_tr: '1. Sırt üstü yatın, dizler bükük\n2. Elleri başın arkasına koyun\n3. Omuzları yerden kaldırın\n4. Karın kaslarını sıkın\n5. Yavaşça indirin' },
  { id: 8, name_tr: 'Hamle', emoji: '🏃', muscle_group_tr: 'Bacak, Kalça, Core', difficulty: 'medium',
    description_tr: 'Bacak ve denge geliştiren tek ayak egzersizi',
    instructions_tr: '1. Dik duruşta başlayın\n2. Bir adım öne atın\n3. Ön diz 90 derece bükün\n4. Arka diz yere yaklaşsın\n5. Başlangıç pozisyonuna dönün' },
  { id: 9, name_tr: 'Dağcı', emoji: '⛰️', muscle_group_tr: 'Core, Kardiyo', difficulty: 'medium',
    description_tr: 'Kardiyo ve core için dinamik egzersiz',
    instructions_tr: '1. Plank pozisyonunda başlayın\n2. Bir dizi göğse doğru çekin\n3. Hızla bacakları değiştirin\n4. Core sıkı tutun\n5. Tempolu devam edin' },
  { id: 10, name_tr: 'Bisiklet Mekiği', emoji: '🚴', muscle_group_tr: 'Karın, Yan Karın', difficulty: 'medium',
    description_tr: 'Yan karın kaslarını çalıştıran dinamik egzersiz',
    instructions_tr: '1. Sırt üstü yatın\n2. Elleri başın arkasına koyun\n3. Dizleri 90 derece bükün\n4. Sağ dirseği sol dize değdirin\n5. Pedal çevirir gibi değiştirin' },
  { id: 11, name_tr: 'Rus Dönüşü', emoji: '🌀', muscle_group_tr: 'Yan Karın, Core', difficulty: 'medium',
    description_tr: 'Yan karın kaslarını hedefleyen rotasyon egzersizi',
    instructions_tr: '1. Oturun, dizleri bükün\n2. Hafif geriye yaslanın\n3. Ayakları yerden kaldırın\n4. Vücudu sağa-sola döndürün\n5. Core sürekli sıkı tutun' },
  { id: 12, name_tr: 'Yüksek Diz', emoji: '🦵', muscle_group_tr: 'Kardiyo, Bacak', difficulty: 'medium',
    description_tr: 'Yüksek tempolu kardiyo egzersizi',
    instructions_tr: '1. Yerinde duruşta başlayın\n2. Sağ dizinizi göğse doğru kaldırın\n3. Hızla sol dize geçin\n4. Kolları zıt yönde sallayın\n5. Tempolu devam edin' },
  { id: 13, name_tr: 'Burpee', emoji: '🔥', muscle_group_tr: 'Tüm Vücut', difficulty: 'hard',
    description_tr: 'Tüm vücudu çalıştıran yüksek yoğunluklu egzersiz',
    instructions_tr: '1. Ayakta durun\n2. Çömelerek elleri yere koyun\n3. Plank pozisyonuna atlayın\n4. Bir şınav çekin\n5. Ayaklara atlayıp zıplayın' },
  { id: 14, name_tr: 'Dips', emoji: '💪', muscle_group_tr: 'Triceps, Göğüs', difficulty: 'hard',
    description_tr: 'Triceps ve göğüs için ileri seviye egzersiz',
    instructions_tr: '1. Paralel barlar kullanın\n2. Kollar düz, vücut asılı\n3. Dirsekleri bükün ve aşağı inin\n4. 90 derece olduğunda durdurun\n5. Kolları düzelterek itin' },
  { id: 15, name_tr: 'Tek Bacak Squat', emoji: '🦿', muscle_group_tr: 'Bacak, Denge', difficulty: 'hard',
    description_tr: 'Tek bacakla yapılan ileri seviye squat',
    instructions_tr: '1. Bir bacak üstünde durun\n2. Diğer bacağı öne uzatın\n3. Kollarınızı dengeleyin\n4. Yavaşça çömelin\n5. Tek bacakla geri kalkın' },
  { id: 16, name_tr: 'Sıçramalı Squat', emoji: '🚀', muscle_group_tr: 'Bacak, Patlayıcı Güç', difficulty: 'hard',
    description_tr: 'Patlayıcı güç için zorlu squat varyasyonu',
    instructions_tr: '1. Squat pozisyonunda başlayın\n2. Aşağı çömelin\n3. Patlayıcı şekilde zıplayın\n4. Yumuşak iniş yapın\n5. Hemen tekrar çömelin' },
  { id: 17, name_tr: 'Barfiks', emoji: '🏋️', muscle_group_tr: 'Sırt, Biceps', difficulty: 'hard',
    description_tr: 'Sırt ve kol kasları için klasik üst vücut egzersizi',
    instructions_tr: '1. Bara avuçlar dışa bakacak şekilde tutunun\n2. Kolları tamamen uzatın\n3. Çeneyi barın üzerine çıkarın\n4. Sırt kaslarını sıkın\n5. Kontrollü inin' },
];

const mockPrograms = [
  { id: 1, name_tr: 'Başlangıç Tam Vücut', difficulty: 'easy', icon: '🌱',
    description_tr: 'Yeni başlayanlar için tasarlanmış hafif ve etkili tam vücut antrenmanı' },
  { id: 2, name_tr: 'Orta Seviye Güç', difficulty: 'medium', icon: '⚡',
    description_tr: 'Kas kütlesi ve güç kazanımı için orta seviye program' },
  { id: 3, name_tr: 'İleri Seviye HIIT', difficulty: 'hard', icon: '🔥',
    description_tr: 'Maksimum yağ yakımı ve dayanıklılık için ileri seviye program' },
];

const dayNames = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const mockWeeklyPlans: any[] = [];
let planIdCounter = 1;

const easyPlan = [[1,5,2,3], null, [4,6,7,3], null, [4,1,2,6,7], null, null];
const mediumPlan = [[4,1,8,9,3], [12,2,10,11], null, [4,1,6,9], [12,8,10,3], null, null];
const hardPlan = [[13,1,14,9,3], [16,15,8,12], [13,17,10,11], null, [4,16,1,9,3], [13,14,12,11], null];

const plans: any = [easyPlan, mediumPlan, hardPlan];
const mockPlanExercises: any[] = [];

plans.forEach((plan: any[], programIdx: number) => {
  plan.forEach((dayExercises: any, dayIdx: number) => {
    const planId = planIdCounter++;
    mockWeeklyPlans.push({
      id: planId,
      program_id: programIdx + 1,
      week_number: 1,
      day_number: dayIdx + 1,
      day_name_tr: dayNames[dayIdx],
      is_rest_day: dayExercises === null ? 1 : 0,
    });
    
    if (dayExercises) {
      dayExercises.forEach((exId: number, i: number) => {
        const ex = mockExercises.find(e => e.id === exId);
        if (ex) {
          mockPlanExercises.push({
            ...ex,
            plan_id: planId,
            sets: 3,
            reps: programIdx === 0 ? '10-12' : programIdx === 1 ? '12-15' : '15-20',
            rest_seconds: programIdx === 0 ? 60 : programIdx === 1 ? 45 : 30,
            order_index: i,
          });
        }
      });
    }
  });
});

let waterLogs: any[] = [];
let workoutCompletions: any[] = [];
let waterGoal = '2000';

export const openDatabaseAsync = async () => ({
  execAsync: async () => {},
  
  getAllAsync: async (query: string, params?: any[]) => {
    // Workout programs
    if (query.includes('FROM workout_programs')) {
      return mockPrograms;
    }
    
    // Weekly plans
    if (query.includes('FROM weekly_plans') && query.includes('program_id')) {
      const programId = params?.[0];
      return mockWeeklyPlans.filter(p => p.program_id === programId);
    }
    
    // Plan exercises
    if (query.includes('plan_exercises') && query.includes('exercises')) {
      const planId = params?.[0];
      return mockPlanExercises.filter(p => p.plan_id === planId);
    }
    
    // Water history (last 7 days)
    if (query.includes('water_logs') && query.includes('GROUP BY date')) {
      const today = new Date();
      const grouped: any = {};
      waterLogs.forEach(log => {
        if (!grouped[log.date]) grouped[log.date] = 0;
        grouped[log.date] += log.amount_ml;
      });
      return Object.entries(grouped).map(([date, total]) => ({ date, total })).slice(0, 7);
    }
    
    // Workout completions
    if (query.includes('workout_completions')) {
      return workoutCompletions;
    }
    
    return [];
  },
  
  getFirstAsync: async (query: string, params?: any[]) => {
    if (query.includes('daily_water_goal')) {
      return { setting_value: waterGoal };
    }
    
    // Today's workout
    if (query.includes('weekly_plans') && query.includes('day_number') && query.includes('is_rest_day')) {
      const dayNumber = params?.[0];
      const plan = mockWeeklyPlans.find(p => p.day_number === dayNumber && p.is_rest_day === 0);
      if (plan) {
        const program = mockPrograms.find(p => p.id === plan.program_id);
        return { ...plan, program_name: program?.name_tr, difficulty: program?.difficulty };
      }
      return null;
    }
    
    // Day info with program
    if (query.includes('weekly_plans') && query.includes('workout_programs')) {
      const planId = params?.[0];
      const plan = mockWeeklyPlans.find(p => p.id === planId);
      if (plan) {
        const program = mockPrograms.find(p => p.id === plan.program_id);
        return { ...plan, program_name: program?.name_tr, difficulty: program?.difficulty };
      }
      return null;
    }
    
    // Water sum
    if (query.includes('SUM(amount_ml)')) {
      const today = new Date().toISOString().split('T')[0];
      const date = params?.[0] || today;
      const total = waterLogs.filter(l => l.date === date).reduce((sum, l) => sum + l.amount_ml, 0);
      return { total: total || 0 };
    }
    
    // Count
    if (query.includes('COUNT(*)')) {
      if (query.includes('workout_completions')) {
        return { count: workoutCompletions.length };
      }
      return { count: 0 };
    }
    
    // Last water log
    if (query.includes('water_logs') && query.includes('ORDER BY timestamp DESC')) {
      const today = params?.[0];
      const todayLogs = waterLogs.filter(l => l.date === today);
      return todayLogs.length > 0 ? todayLogs[todayLogs.length - 1] : null;
    }
    
    return null;
  },
  
  runAsync: async (query: string, params?: any[]) => {
    // Insert water log
    if (query.includes('INSERT INTO water_logs')) {
      const id = waterLogs.length + 1;
      waterLogs.push({ id, date: params?.[0], amount_ml: params?.[1], timestamp: params?.[2] });
      return { lastInsertRowId: id };
    }
    
    // Delete water log
    if (query.includes('DELETE FROM water_logs') && query.includes('id')) {
      waterLogs = waterLogs.filter(l => l.id !== params?.[0]);
      return { lastInsertRowId: 0 };
    }
    
    // Insert workout completion
    if (query.includes('INSERT INTO workout_completions')) {
      const id = workoutCompletions.length + 1;
      workoutCompletions.push({ id, plan_id: params?.[0], completed_date: params?.[1], duration_minutes: params?.[2] });
      return { lastInsertRowId: id };
    }
    
    // Update water goal
    if (query.includes('UPDATE user_settings') && query.includes('daily_water_goal')) {
      waterGoal = params?.[0];
      return { lastInsertRowId: 0 };
    }
    
    // Delete all
    if (query.includes('DELETE FROM water_logs')) {
      waterLogs = [];
      return { lastInsertRowId: 0 };
    }
    if (query.includes('DELETE FROM workout_completions')) {
      workoutCompletions = [];
      return { lastInsertRowId: 0 };
    }
    
    return { lastInsertRowId: 1 };
  }
});

export default {
  openDatabaseAsync
};
