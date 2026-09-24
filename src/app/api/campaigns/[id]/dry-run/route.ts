import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { DryRunSimulator } from "@/lib/campaigns/dry-run-simulator";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const campaign = await prisma.campaign.findUnique({
      where: { id },
      include: {
        groups: true,
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const groupIds = campaign.groups.map((g) => g.contactGroupId);

    const report = await DryRunSimulator.simulate({
      userId: campaign.userId,
      messageText: campaign.message,
      contactGroupIds: groupIds,
      purpose: "MARKETING",
    });

    return NextResponse.json({
      success: true,
      campaignId: campaign.id,
      campaignName: campaign.name,
      report,
    });
  } catch (error) {
    console.error("[CAMPAIGN_DRY_RUN_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to execute campaign dry-run simulation" },
      { status: 500 }
    );
  }
}
