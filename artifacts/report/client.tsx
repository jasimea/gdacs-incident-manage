import { Artifact } from '@/components/create-artifact';
import { DocumentSkeleton } from '@/components/document-skeleton';
import { Document } from '@/lib/db/schema';
import { memo } from 'react';

interface ReportArtifactMetadata {
  // Add any metadata specific to reports if needed
}

const ReportRenderer = memo(function ReportRenderer({
  content,
  document,
}: {
  content: string;
  document: Document;
}) {
  return (
    <div 
      className="max-w-none size-full overflow-auto"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
});

export const reportArtifact = new Artifact<'report', ReportArtifactMetadata>({
  kind: 'report',
  description: 'Generate beautiful HTML reports for GDACS incidents with product recommendations.',
  initialize: async ({ documentId, setMetadata }) => {
    // Initialize any report-specific metadata
    setMetadata({});
  },
  onStreamPart: ({ streamPart, setArtifact }) => {
    if (streamPart.type === 'text-delta') {
      setArtifact((draftArtifact) => {
        return {
          ...draftArtifact,
          content: draftArtifact.content + (streamPart.content as string),
          isVisible: true,
          status: 'streaming',
        };
      });
    }
  },
  content: ({
    mode,
    status,
    content,
    isCurrentVersion,
    currentVersionIndex,
    onSaveContent,
    getDocumentContentById,
    isLoading,
    metadata,
  }) => {
    if (isLoading) {
      return <DocumentSkeleton artifactKind="report" />;
    }

    if (mode === 'diff') {
      const oldContent = getDocumentContentById(currentVersionIndex - 1);
      const newContent = getDocumentContentById(currentVersionIndex);

      return (
        <div className="w-full h-full bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <div className="p-6">
            <div className="mb-4">
              <h3 className="text-lg font-semibold mb-2">Previous Version</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: oldContent }}
              />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">Current Version</h3>
              <div 
                className="prose prose-sm max-w-none"
                dangerouslySetInnerHTML={{ __html: newContent }}
              />
            </div>
          </div>
        </div>
      );
    }

    return <ReportRenderer content={content} document={{ content, title: '', id: '', createdAt: new Date(), kind: 'report', userId: '' }} />;
  },
  actions: [
    {
      icon: <span className="text-lg">📊</span>,
      description: 'Export as PDF',
      onClick: ({ content }) => {
        // Implementation for PDF export
        console.log('Exporting report as PDF...');
      },
    },
    {
      icon: <span className="text-lg">📧</span>,
      description: 'Share Report',
      onClick: ({ content }) => {
        // Implementation for sharing
        console.log('Sharing report...');
      },
    },
  ],
  toolbar: [
    {
      icon: <span className="text-lg">🔄</span>,
      description: 'Refresh Data',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Please refresh the incident data and regenerate the report with the latest information.',
        });
      },
    },
    {
      icon: <span className="text-lg">📋</span>,
      description: 'Update Products',
      onClick: ({ appendMessage }) => {
        appendMessage({
          role: 'user',
          content: 'Please update the product recommendations based on the current incident analysis.',
        });
      },
    },
  ],
}); 