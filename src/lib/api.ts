import { ApiResponse, PaginatedResponse, ApiError } from '@/types/api';
import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/constants/http-status';

export const successResponse = <T>(data: T, message?: string, status = HTTP_STATUS.OK): NextResponse<ApiResponse<T>> => {
  return NextResponse.json({
    success: true,
    data,
    message,
    timestamp: new Date().toISOString()
  }, { status });
};

export const paginatedResponse = <T>(
  data: T[], 
  total: number, 
  page: number, 
  limit: number, 
  message?: string
): NextResponse<PaginatedResponse<T>> => {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPrevPage: page > 1
    },
    message,
    timestamp: new Date().toISOString()
  });
};

export const errorResponse = (error: ApiError | string, status = HTTP_STATUS.INTERNAL_SERVER_ERROR): NextResponse<ApiResponse<null>> => {
  const err = typeof error === 'string' ? { code: 'INTERNAL_ERROR', message: error } : error;
  return NextResponse.json({
    success: false,
    error: err,
    timestamp: new Date().toISOString()
  }, { status });
};
