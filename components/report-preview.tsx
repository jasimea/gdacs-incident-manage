import { cx } from 'class-variance-authority';
import { DocumentPreview } from './document-preview';

interface ReportPreviewProps {
  args?: {
    title?: string;
    eventId?: string;
    products?: Array<{
      itemCode: string;
      quantity: number;
    }>;
  };
  result?: {
    id: string;
    title: string;
    kind: string;
    content: string;
  };
  isReadonly?: boolean;
}

export function ReportPreview({
  args,
  result,
  isReadonly = false,
}: ReportPreviewProps) {
  if (result) {
    return <DocumentPreview result={result} isReadonly={isReadonly} />;
  }

  const title = args?.title || 'Generating Report...';

  return (
    <div className="flex flex-col items-center justify-center min-h-[200px] p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold text-muted-foreground/60 mb-4">
          {title}
        </h2>
        <div className="flex items-center justify-center space-x-2 text-muted-foreground/50">
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse"></div>
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
          <div className="w-2 h-2 bg-muted-foreground/30 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
        </div>
        <p className="text-sm text-muted-foreground/40 mt-4">
          Fetching incident data and generating report...
        </p>
      </div>
    </div>
  );
} 