import { TablePageSkeleton } from "@/components/blocks/ui/skeleton-layouts";

export default function Loading() {
  return (
    <TablePageSkeleton
      titleWidth="w-44"
      subtitleWidth="w-80"
      actionButtons={1}
      columns={6}
      rows={6}
    />
  );
}
