import api from './client';

export const getWordbooksApi = () =>
  api.get('/wordbooks/');

export const getSystemWordbooksApi = () =>
  api.get('/wordbooks/system');

export const getMarketplaceWordbooksApi = () =>
  api.get('/wordbooks/marketplace');

export const getWordbookApi = (id: number) =>
  api.get(`/wordbooks/${id}`);

export const createWordbookApi = (data: { name: string; description?: string; category?: string }) =>
  api.post('/wordbooks/', data);

export const updateWordbookApi = (id: number, data: { name: string; description?: string; category?: string }) =>
  api.put(`/wordbooks/${id}`, data);

export const deleteWordbookApi = (id: number) =>
  api.delete(`/wordbooks/${id}`);

export const subscribeSystemWordbookApi = (id: number) =>
  api.post(`/wordbooks/system/${id}/subscribe`);

export const unsubscribeSystemWordbookApi = (id: number) =>
  api.delete(`/wordbooks/system/${id}/unsubscribe`);

export const subscribeWordbookApi = (id: number) =>
  api.post(`/wordbooks/${id}/subscribe`);

export const unsubscribeWordbookApi = (id: number) =>
  api.delete(`/wordbooks/${id}/unsubscribe`);

export const publishWordbookApi = (id: number) =>
  api.post(`/wordbooks/${id}/publish`);

export const unpublishWordbookApi = (id: number) =>
  api.delete(`/wordbooks/${id}/publish`);
