import { NextRequest } from 'next/server';
import { withDeviceAuth } from '@/lib/gateways/device-auth';

// For production, you could read this from a database or a config file
const LATEST_FIRMWARE_VERSION = "1.0.1"; // Increment this to trigger an OTA
const FIRMWARE_DOWNLOAD_URL = "https://your-firmware-bucket.s3.amazonaws.com/firmware-v1.0.1.bin";
// Alternatively, serve it from your public folder:
// const FIRMWARE_DOWNLOAD_URL = "https://your-domain.com/firmware.bin";

export const POST = withDeviceAuth(async (req: NextRequest, { gateway }) => {
  try {
    const body = await req.json().catch(() => ({}));
    const currentVersion = body.currentVersion || "0.0.0";
    const hardwareModel = body.hardwareModel || "UNKNOWN";

    // Only provide updates for the ESP32 Gateway
    if (hardwareModel !== "ESP32-GSM-GW") {
      return Response.json({ updateAvailable: false, reason: "Unsupported hardware model" });
    }

    // Simple semver comparison (assuming x.y.z)
    const isUpdateAvailable = compareVersions(LATEST_FIRMWARE_VERSION, currentVersion) > 0;

    if (isUpdateAvailable) {
      return Response.json({
        updateAvailable: true,
        version: LATEST_FIRMWARE_VERSION,
        downloadUrl: FIRMWARE_DOWNLOAD_URL,
        releaseNotes: "Performance improvements and new OTA feature."
      });
    }

    return Response.json({ updateAvailable: false });
  } catch (error) {
    console.error('[FIRMWARE_CHECK_ERROR]', error);
    return Response.json({ error: 'Internal Server Error' }, { status: 500 });
  }
});

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
