import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Upload, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ContactImportPage() {
  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6 max-w-4xl mx-auto w-full">
      <div className="mb-2">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Import Contacts</h1>
        <p className="text-sm text-muted-foreground mt-0.5">Upload a CSV or Excel file to bulk import contacts.</p>
      </div>

      <div className="grid gap-4 sm:gap-6">
        <div className="flex items-center justify-between pb-4 border-b gap-2">
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold text-xs sm:text-sm">1</div>
            <span className="font-medium text-xs sm:text-sm md:text-base">Upload File</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 opacity-50">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm">2</div>
            <span className="font-medium text-xs sm:text-sm md:text-base">Map Columns</span>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 opacity-50">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center font-bold text-xs sm:text-sm">3</div>
            <span className="font-medium text-xs sm:text-sm md:text-base">Import</span>
          </div>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-10 sm:py-16 text-center px-4">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-7 h-7 sm:w-8 sm:h-8 text-muted-foreground" />
            </div>
            <h3 className="text-base sm:text-lg font-semibold mb-2">Drag & Drop your file here</h3>
            <p className="text-xs sm:text-sm text-muted-foreground max-w-md mb-6">
              Supported formats: .csv, .xls, .xlsx. Maximum file size: 10MB. 
              The file should include a header row.
            </p>
            <Button size="lg" className="w-full sm:w-auto">Browse Files</Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium flex items-center">
              <AlertTriangle className="w-4 h-4 mr-2 text-amber-500" />
              Import Requirements
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">
            <ul className="list-disc pl-5 space-y-1">
              <li>Phone number column is absolutely required.</li>
              <li>Phone numbers should ideally include country codes (e.g., +256...).</li>
              <li>First name, last name, and email are optional.</li>
              <li>Duplicate phone numbers will be automatically ignored.</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
