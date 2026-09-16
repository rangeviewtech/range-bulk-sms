import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Upload, Database, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ContactImportPage() {
  return (
    <div className="flex flex-col gap-6 p-6 max-w-4xl mx-auto w-full">
      <div className="mb-4">
        <h1 className="text-3xl font-bold tracking-tight">Import Contacts</h1>
        <p className="text-muted-foreground">Upload a CSV or Excel file to bulk import contacts.</p>
      </div>

      <div className="grid gap-6">
        <div className="flex items-center justify-between pb-4 border-b">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">1</div>
            <span className="font-medium text-lg">Upload File</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">2</div>
            <span className="font-medium text-lg">Map Columns</span>
          </div>
          <div className="flex items-center gap-3 opacity-50">
            <div className="w-8 h-8 rounded-full border-2 flex items-center justify-center font-bold">3</div>
            <span className="font-medium text-lg">Import</span>
          </div>
        </div>

        <Card className="border-dashed border-2">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Upload className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Drag & Drop your file here</h3>
            <p className="text-sm text-muted-foreground max-w-md mb-6">
              Supported formats: .csv, .xls, .xlsx. Maximum file size: 10MB. 
              The file should include a header row.
            </p>
            <Button size="lg">Browse Files</Button>
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
