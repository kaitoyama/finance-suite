'use client';

import React from 'react';
import { useGetPresignedS3Url } from '@/hooks/useInvoice'; // Assuming this hook is suitable
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';

interface PaymentAttachmentLinkRendererProps {
  s3Key: string | null | undefined;
  title: string;
}

export const PaymentAttachmentLinkRenderer: React.FC<PaymentAttachmentLinkRendererProps> = ({ s3Key, title }) => {
  const { 
    presignedUrlData, 
    fetchingUrl, 
    fetchUrlError, 
    retryFetchUrl 
  } = useGetPresignedS3Url(s3Key); // Hook will pause if s3Key is null/undefined

  if (!s3Key) {
    return <span className="text-sm text-muted-foreground">Attachment has no S3 key.</span>;
  }

  return (
    <div className="mt-1">
      {fetchingUrl && <Skeleton className="h-8 w-32" />}
      {fetchUrlError && (
        <div>
          <p className="text-xs text-red-500">Error generating link: {fetchUrlError.message}</p>
          <Button onClick={retryFetchUrl} variant="outline" size="sm" className="text-xs mt-1">
            Retry Link
          </Button>
        </div>
      )}
      {presignedUrlData?.url && (
        <Button asChild variant="link" className="p-0 h-auto text-sm font-normal">
          <Link href={presignedUrlData.url} target="_blank" rel="noopener noreferrer">
            View/Download {title}
          </Link>
        </Button>
      )}
      {!presignedUrlData?.url && !fetchingUrl && !fetchUrlError && (
        <Button onClick={retryFetchUrl} variant="outline" size="sm" className="text-xs">
          Generate Link for {title}
        </Button>
      )}
    </div>
  );
}; 