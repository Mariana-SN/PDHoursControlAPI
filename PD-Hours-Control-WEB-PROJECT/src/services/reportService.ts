import api from '../api/api';
import type { ReportCreate, ReportDetail } from '../types';

const BASE_URL = '/Report';

export const createReport = async (report: ReportCreate): Promise<{ id: number; message: string }> => {
  const response = await api.post<{ id: number; message: string }>(BASE_URL, report);
  return response.data;
};

export const getReportsBySquad = async (
  squadId: number, 
  startDate: string, 
  endDate: string
): Promise<ReportDetail[]> => {
  const params = new URLSearchParams({
    startDate: startDate,
    endDate: endDate
  });
  
  const response = await api.get<ReportDetail[]>(`${BASE_URL}/squad/${squadId}?${params}`);
  return response.data;
};