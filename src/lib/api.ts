import { AppError } from '@/lib/errors';
import { ApiResponse, PaginatedResponse } from '@/types/api';
import { NextResponse } from 'next/server';
import { HTTP_STATUS } from '@/constants/http-status';

export const successResponse = <T>(
  data: T,
  message?: string,
  status: number = HTTP_STATUS.OK
): NextResponse<ApiResponse<T>> => {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
      timestamp: new Date().toISOString(),
    },
    { status }
  );
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
      hasPrevPage: page > 1,
    },
    message,
    timestamp: new Date().toISOString(),
  });
};

export const errorResponse = (
  error: unknown,
  status: number = HTTP_STATUS.INTERNAL_SERVER_ERROR
): NextResponse<ApiResponse<null>> => {
  let errCode = 'INTERNAL_ERROR';
  let errMessage = 'Something went wrong. Please try again later.';

  if (process.env.NODE_ENV !== 'production') {
    // In dev, show full details
    if (typeof error === 'string') {
      errMessage = error;
    } else if (error instanceof Error) {
      errMessage = (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
      errCode = error.name;
    } else if (error !== null && typeof error === 'object' && 'message' in error) {
      errMessage = String((error as Record<string, unknown>).message);
      errCode = 'code' in error ? String(error.code) : errCode;
    }
  } else {
    // In production, only expose known safe Application Errors
    if (error instanceof AppError && error.statusCode < 500) {
      errMessage = (error instanceof Error ? (error instanceof Error ? error.message : String(error)) : String(error));
      errCode = error.code;
    }
  }

  return NextResponse.json(
    {
      success: false,
      error: {
        code: errCode,
        message: errMessage,
      },
      timestamp: new Date().toISOString(),
    },
    { status }
  );
};
