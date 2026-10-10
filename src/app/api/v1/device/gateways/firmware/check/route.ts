import { NextRequest } from 'next/server';
import { withDeviceAuth } from '@/lib/gateways/device-auth';

const LATEST_FIRMWARE_VERSION = process.env.ESP32_FIRMWARE_VERSION;
const FIRMWARE_DOWNLOAD_URL = process.env.ESP32_FIRMWARE_DOWNLOAD_URL;

export async function POST(req: NextRequest) {
  return withDeviceAuth(req, async (req, { gatewayId: _gatewayId }) => {
    try {
      const body = await req.json().catch(() => ({}));
      const currentVersion = body.currentVersion || "0.0.0";
      const hardwareModel = body.hardwareModel || "UNKNOWN";

      // Only provide updates for the ESP32 Gateway
      if (hardwareModel !== "ESP32-GSM-GW") {
        return Response.json({ updateAvailable: false, reason: "Unsupported hardware model" });
      }

      // Simple semver comparison (assuming x.y.z)
      let firmwareUrl: URL | null = null;
      try {
        firmwareUrl = FIRMWARE_DOWNLOAD_URL ? new URL(FIRMWARE_DOWNLOAD_URL) : null;
      } catch {
        firmwareUrl = null;
      }
      if (!LATEST_FIRMWARE_VERSION || !firmwareUrl || firmwareUrl.protocol !== 'https:' || firmwareUrl.username || firmwareUrl.password) {
        return Response.json({ updateAvailable: false });
      }

      const isUpdateAvailable = compareVersions(LATEST_FIRMWARE_VERSION, currentVersion) > 0;

      if (isUpdateAvailable) {
        return Response.json({
          updateAvailable: true,
          version: LATEST_FIRMWARE_VERSION,
          downloadUrl: firmwareUrl.toString(),
          releaseNotes: "Performance improvements and new OTA feature."
        });
      }

      return Response.json({ updateAvailable: false });
    } catch (error) {
      console.error('[FIRMWARE_CHECK_ERROR]', error);
      return Response.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  });
}

// Helper for basic semver comparison
function compareVersions(v1: string, v2: string) {
  const p1 = v1.split('.').map(Number);
  const p2 = v2.split('.').map(Number);
  for (let i = 0; i < Math.max(p1.length, p2.length); i++) {
    const n1 = p1[i] || 0;
    const n2 = p2[i] || 0;
    if (n1 > n2) return 1;
    if (n1 < n2) return -1;
  }
  return 0;
}
