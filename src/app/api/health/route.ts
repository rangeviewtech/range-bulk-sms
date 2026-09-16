import { NextResponse } from 'next/server';
/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: System health check
 *     description: Returns the health status, timestamp, and version of the API.
 *     tags:
 *       - System
 *     responses:
 *       200:
 *         description: System is healthy
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 version:
 *                   type: string
 *                   example: 1.0.0
 */
export async function GET() {
  return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString(), version: '1.0.0' });
}
