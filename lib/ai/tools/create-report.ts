import { generateUUID } from '@/lib/utils';
import { DataStreamWriter, tool } from 'ai';
import { z } from 'zod';
import { Session } from 'next-auth';
import {
  artifactKinds,
  documentHandlersByArtifactKind,
} from '@/lib/artifacts/server';

interface CreateDocumentProps {
  session: Session;
  dataStream: DataStreamWriter;
}

export const createReport = ({ session, dataStream }: CreateDocumentProps) =>
  tool({
    description:
      'Create a report for a given incident and recommended products. This tool will call other functions that will generate the contents of the report based on the incident and products.',
    parameters: z.object({
      eventId: z.string(),
      title: z.string(),
      products: z.array(z.object({
        itemCode: z.string(),
        quantity: z.number(),
      })),
    }),
    execute: async ({ eventId, products, title }) => {
      const id = generateUUID();
      const kind = 'report' as const;
      console.log('Some products', products);
      console.log('kind', kind);

      dataStream.writeData({
        type: 'kind',
        content: kind,
      });

      dataStream.writeData({
        type: 'id',
        content: id,
      });

      dataStream.writeData({
        type: 'title',
        content: title,
      });

      dataStream.writeData({
        type: 'clear',
        content: '',
      });

      const documentHandler = documentHandlersByArtifactKind.find(
        (documentHandlerByArtifactKind) =>
          documentHandlerByArtifactKind.kind === kind,
      );

      if (!documentHandler) {
        throw new Error(`No document handler found for kind: ${kind}`);
      }
      console.log('documentHandler', documentHandler);

      await documentHandler.onCreateDocument({
        id,
        title,
        dataStream,
        session,
        options:{
          eventId,
          products,
        },
      });

      dataStream.writeData({ type: 'finish', content: '' });

      return {
        id,
        title,
        kind,
        content: 'A report was created and is now visible to the user.',
      };
    },
  });
