import { NextRequest, NextResponse } from 'next/server';
import { prisma, Prisma } from '@/lib/prisma';
import { withDeviceAuth, sendGatewayResponse } from '@/lib/gateways/device-auth';

/**
 * Enhanced Gateway Heartbeat
 *
 * Accepts rich device telemetry from both Android and ESP32 gateways.
 * Extended fields stored in Gateway.config JSON (backward compatible).
 *
 * New ESP32 fields: powerSource, batteryVoltage, connectivityMethod,
 * wifiSSID, wifiRSSI, macAddress, localIP, firmwareVersion, freeHeapBytes,
 * uptimeSeconds, cpuTempCelsius, resetReason, simSlots[], pendingQueueSize,
 * totalSmsSent/Delivered/Failed/Incoming
 */
export const POST = async (req: NextRequest) => {
  return withDeviceAuth(req, async (req, { gatewayId, gatewaySecret, body, isE2EE }) => {
    try {

      // Extract legacy fields for GatewayDevice model
      const {
        batteryLevel,
        isCharging,
        signalStrength,
        networkOperator,
        fcmToken,
      } = body;

      // Ensure device record exists
      const device = await prisma.gatewayDevice.findFirst({
        where: { gatewayId }
      });

      const simSlotCount = body.simSlotCount || body.simSlots?.length || 1;
      const ipAddress = body.localIP ||
        req.headers.get('x-forwarded-for') ||
        req.headers.get('remote-addr') ||
        undefined;

      const location = req.headers.get('x-vercel-ip-country') 
        ? `${req.headers.get('x-vercel-ip-city') || 'Unknown'}, ${req.headers.get('x-vercel-ip-country')}`
        : 'Local/Unknown';

      const deviceData = {
        batteryLevel,
        isCharging: isCharging ?? false,
        signalStrength,
        networkOperator,
        simSlotCount,
        fcmToken: fcmToken !== undefined ? fcmToken : undefined,
        appVersion: body.firmwareVersion || undefined,
        lastHeartbeatAt: new Date(),
        ipAddress,
        location,
      };

      if (device) {
        await prisma.gatewayDevice.update({
          where: { id: device.id },
          data: deviceData,
        });
      } else {
        await prisma.gatewayDevice.create({
          data: { gatewayId, ...deviceData },
        });
      }

      // Store extended telemetry in Gateway.config JSON
      const gateway = await prisma.gateway.findUnique({
        where: { id: gatewayId },
        select: { config: true, status: true },
      });

      const existingConfig = (gateway?.config && typeof gateway.config === 'object' && !Array.isArray(gateway.config))
        ? { ...(gateway.config as Record<string, unknown>) }
        : {};

      // Build device telemetry snapshot (merged with existing config)
      const telemetry: Record<string, unknown> = {
        ...existingConfig,
        lastHeartbeat: new Date().toISOString(),
      };

      // Power info
      if (body.powerSource !== undefined) telemetry.powerSource = body.powerSource;
      if (body.batteryVoltage !== undefined) telemetry.batteryVoltage = body.batteryVoltage;

      // Connectivity
      if (body.connectivityMethod !== undefined) telemetry.connectivityMethod = body.connectivityMethod;
      if (body.wifiSSID !== undefined) telemetry.wifiSSID = body.wifiSSID;
      if (body.wifiRSSI !== undefined) telemetry.wifiRSSI = body.wifiRSSI;
      if (body.macAddress !== undefined) telemetry.macAddress = body.macAddress;
      if (body.localIP !== undefined) telemetry.localIP = body.localIP;

      // System health
      if (body.firmwareVersion !== undefined) telemetry.firmwareVersion = body.firmwareVersion;
      if (body.freeHeapBytes !== undefined) telemetry.freeHeapBytes = body.freeHeapBytes;
      if (body.uptimeSeconds !== undefined) telemetry.uptimeSeconds = body.uptimeSeconds;
      if (body.cpuTempCelsius !== undefined) telemetry.cpuTempCelsius = body.cpuTempCelsius;
      if (body.resetReason !== undefined) telemetry.resetReason = body.resetReason;

      // Per-SIM detailed status array
      if (body.simSlots !== undefined) telemetry.simSlots = body.simSlots;

      // Stats summary
      if (body.totalSmsSent !== undefined) telemetry.totalSmsSent = body.totalSmsSent;
      if (body.totalSmsDelivered !== undefined) telemetry.totalSmsDelivered = body.totalSmsDelivered;
      if (body.totalSmsFailed !== undefined) telemetry.totalSmsFailed = body.totalSmsFailed;
      if (body.totalSmsIncoming !== undefined) telemetry.totalSmsIncoming = body.totalSmsIncoming;
      if (body.pendingQueueSize !== undefined) telemetry.pendingQueueSize = body.pendingQueueSize;

      // Determine gateway status based on SIM health
      let gatewayStatus: 'ONLINE' | 'DEGRADED' = 'ONLINE';
      if (body.simSlots && Array.isArray(body.simSlots)) {
        const healthySims = body.simSlots.filter(
          (s: { health: string }) => s.health === 'HEALTHY' || s.health === 'BUSY'
        );
        const totalSims = body.simSlots.length;
        if (totalSims > 0 && healthySims.length === 0) {
          gatewayStatus = 'DEGRADED';
        }
      }

      await prisma.gateway.update({
        where: { id: gatewayId },
        data: {
          status: gatewayStatus,
          config: telemetry as Prisma.InputJsonValue,
        },
      });

      // Return admin commands (unflag SIMs, config changes) — firmware polls this
      const adminCommands: Record<string, unknown> = {};
      if (existingConfig.adminActions) {
        adminCommands.adminActions = existingConfig.adminActions;
      }

      return sendGatewayResponse({
        success: true,
        timestamp: new Date().toISOString(),
        commands: Object.keys(adminCommands).length > 0 ? adminCommands : undefined,
      }, gatewaySecret, isE2EE);
    } catch (error: unknown) {
      console.error('Gateway Heartbeat Error:', error);
      return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
  });
};
