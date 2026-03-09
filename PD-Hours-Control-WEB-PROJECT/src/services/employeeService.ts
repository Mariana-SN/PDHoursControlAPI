import api from '../api/api';
import type { Employee, EmployeeCreate } from '../types';

const BASE_URL = '/Employee';

export const getEmployees = async (): Promise<Employee[]> => {
  const response = await api.get<Employee[]>(BASE_URL);
  return response.data;
};

export const getEmployeeById = async (id: number): Promise<Employee> => {
  const response = await api.get<Employee>(`${BASE_URL}/${id}`);
  return response.data;
};

export const getEmployeesBySquad = async (squadId: number): Promise<Employee[]> => {
  const response = await api.get<Employee[]>(`${BASE_URL}/bysquad/${squadId}`);
  return response.data;
};

export const createEmployee = async (employee: EmployeeCreate): Promise<{ id: number; message: string }> => {
  const response = await api.post<{ id: number; message: string }>(BASE_URL, employee);
  return response.data;
};