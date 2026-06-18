const getToday = () => new Date().toISOString().slice(0, 10);

interface DailyProgress {
  learned: number;
  reviewed: number;
}

function key(wordbookId: number) {
  return `progress-${wordbookId}-${getToday()}`;
}

export function getDailyProgress(wordbookId: number): DailyProgress {
  try {
    const stored = localStorage.getItem(key(wordbookId));
    if (stored) return JSON.parse(stored) as DailyProgress;
  } catch { /* ignore */ }
  return { learned: 0, reviewed: 0 };
}

export function incrementLearned(wordbookId: number) {
  const current = getDailyProgress(wordbookId);
  current.learned++;
  localStorage.setItem(key(wordbookId), JSON.stringify(current));
}

export function incrementReviewed(wordbookId: number) {
  const current = getDailyProgress(wordbookId);
  current.reviewed++;
  localStorage.setItem(key(wordbookId), JSON.stringify(current));
}
