import { PaginationParams, SortParams } from '@/types/api';

export interface IBaseService<T, CreateDTO, UpdateDTO> {
  findAll(pagination?: PaginationParams, sort?: SortParams, filter?: Record<string, unknown>): Promise<{ data: T[], total: number }>;
  findById(id: string): Promise<T | null>;
  create(data: CreateDTO): Promise<T>;
  update(id: string, data: UpdateDTO): Promise<T>;
  delete(id: string): Promise<boolean>;
}

export abstract class BaseService<T, CreateDTO, UpdateDTO> implements IBaseService<T, CreateDTO, UpdateDTO> {
  abstract findAll(pagination?: PaginationParams, sort?: SortParams, filter?: Record<string, unknown>): Promise<{ data: T[], total: number }>;
  abstract findById(id: string): Promise<T | null>;
  abstract create(data: CreateDTO): Promise<T>;
  abstract update(id: string, data: UpdateDTO): Promise<T>;
  abstract delete(id: string): Promise<boolean>;
}
