"use client";
import { PageHeader } from '@/components/layout/page-header';
import { exampleData } from '@/features/example/data';

export default function ExamplesPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <PageHeader heading="Examples" description="Manage your example items." />
      <div className="border rounded-lg bg-card overflow-hidden">
        <div className="w-full overflow-x-auto">
          <table className="w-full text-sm text-left min-w-[500px]">
            <thead className="bg-muted/50 border-b">
              <tr>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Priority</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {exampleData.map((item) => (
                <tr key={item.id} className="hover:bg-muted/50">
                  <td className="px-6 py-4">{item.title}</td>
                  <td className="px-6 py-4">{item.status}</td>
                  <td className="px-6 py-4">{item.priority}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
