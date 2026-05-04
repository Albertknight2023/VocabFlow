import api from './client';

export interface SpellingCheckResponse {
  correct: boolean;
  expected: string;
  input_text: string;
}

export const getLearningCardsApi = (wordbookId: number) =>
  api.get(`/learning/cards/${wordbookId}`);

export const getReviewQueueApi = (wordbookId: number) =>
  api.get(`/learning/review-queue/${wordbookId}`);

export const recordProgressApi = (wordId: number, status: 'mastered' | 'reviewing' | 'new', isCorrect: boolean) =>
  api.post('/learning/record-progress', {
    word_id: wordId,
    status,
    is_correct: isCorrect,
  });

export const spellingCheckApi = (wordId: number, inputText: string) =>
  api.post<SpellingCheckResponse>('/learning/spelling-check', {
    word_id: wordId,
    input_text: inputText,
  });
