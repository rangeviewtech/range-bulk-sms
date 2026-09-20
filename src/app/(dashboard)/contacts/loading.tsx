import { TablePageSkeleton } from "@/components/blocks/ui/skeleton-layouts";

export default function Loading() {
  return (
    <TablePageSkeleton
      titleWidth="w-36"
      subtitleWidth="w-80"
      actionButtons={2}
      columns={5}
      rows={6}
    />
  );
}
