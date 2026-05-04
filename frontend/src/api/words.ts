import api from './client';

export const getWordsByWordbookApi = (wordbookId: number) =>
  api.get(`/words/wordbook/${wordbookId}`);

export const previewWordApi = (text: string) =>
  api.get('/words/preview', { params: { text } });

export const createWordApi = (wordbookId: number, data: {
  text: string;
  part_of_speech?: string;
  phonetic?: string;
  meaning?: string;
  english_definition?: string;
}) =>
  api.post(`/words/wordbook/${wordbookId}`, data);

export const updateWordApi = (wordId: number, data: {
  text?: string;
  meaning?: string;
  part_of_speech?: string;
  phonetic?: string;
  example?: string;
}) =>
  api.put(`/words/${wordId}`, data);

export const deleteWordApi = (wordId: number) =>
  api.delete(`/words/${wordId}`);

export const markWordApi = (wordId: number, status: 'new' | 'learning' | 'mastered') =>
  api.put(`/words/${wordId}`, { status });
