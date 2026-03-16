import api from '../api/api';
import type { Squad, SquadCreate, MemberHours, SquadTotalHours, SquadAverageHours } from '../types';

const BASE_URL = '/Squad';

export const getSquads = () =>
  api.get<Squad[]>(BASE_URL);

export const createSquad = (data: SquadCreate) =>
  api.post<{ id: number }>(BASE_URL, data);

export const getSquadById = (id: number) =>
  api.get<Squad>(`${BASE_URL}/${id}`);

export const getMemberHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<MemberHours[]>(`${BASE_URL}/${squadId}/hours`, { params: { startDate, endDate } });

export const getTotalHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<SquadTotalHours>(`${BASE_URL}/${squadId}/total-hours`, { params: { startDate, endDate } });

export const getAverageHours = (squadId: number, startDate: string, endDate: string) =>
  api.get<SquadAverageHours>(`${BASE_URL}/${squadId}/average-hours-per-day`, { params: { startDate, endDate } });