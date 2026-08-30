"use client";

import { TrakzeeShell } from '@/components/layout/trakzee-shell';

export default function TestLayoutPage() {
  return (
    <TrakzeeShell user={{ name: "Test User", email: "test@example.com" }}>
      <div className="flex h-[100vh] w-full items-center justify-center">
        <div className="text-gray-500 text-xs">
          (Please use the navigation tree)
        </div>
      </div>
    </TrakzeeShell>
  );
}
