import { TablePageSkeleton } from "@/components/blocks/ui/skeleton-layouts";

export default function Loading() {
  return (
    <TablePageSkeleton
      titleWidth="w-56"
      subtitleWidth="w-96"
      actionButtons={2}
      columns={7}
      rows={6}
    />
  );
}
