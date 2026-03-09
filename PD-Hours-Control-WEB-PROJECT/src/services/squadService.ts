import api from '../api/api';
import type { Squad, SquadCreate, MemberHours, SquadTotalHours, SquadAverageHours } from '../types';

export const getSquads = () => api.get<Squad[]>('/squad');

export const createSquad = (data: SquadCreate) => api.post<{ id: number }>('/squad', data);

export const getSquadById = (id: number) => api.get<Squad>(`/squad/${id}`);

export const getMemberHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<MemberHours[]>(`/squad/${squadId}/hours`, { params: { startDate, endDate } });

export const getTotalHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<SquadTotalHours>(`/squad/${squadId}/total-hours`, { params: { startDate, endDate } });

export const getAverageHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<SquadAverageHours>(`/squad/${squadId}/average-hours-per-day`, { params: { startDate, endDate } });
