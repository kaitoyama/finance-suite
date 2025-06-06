"use client";

import * as React from "react";
import { useParams } from "next/navigation";
import { useGetInvoiceById, useGetPresignedS3Url } from "@/hooks/useInvoice";
import { Button } from "@/components/ui/button";
import { ArrowDownToLine, RotateCw, CreditCard } from "lucide-react";
import { PageHeader } from "@/components/layout/PageHeader";
import Link from "next/link";

export default function InvoicePreviewPage() {
  const params = useParams();
  const id = parseInt(params.id as string, 10);
  const { invoice, fetching: fetchingInvoice, error: invoiceError } = useGetInvoiceById(id);

  const {
    presignedUrlData,
    fetchingUrl,
    fetchUrlError,
    retryFetchUrl
  } = useGetPresignedS3Url(invoice?.pdfKey);

  const [iframeSrc, setIframeSrc] = React.useState<string | null>(null);
  const [downloadUrl, setDownloadUrl] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (presignedUrlData?.url) {
      setIframeSrc(presignedUrlData.url);
      setDownloadUrl(presignedUrlData.url);
    }
  }, [presignedUrlData]);
  
  React.useEffect(() => {
    if (invoice?.pdfKey && !presignedUrlData?.url && !fetchingUrl && !fetchUrlError) {
        retryFetchUrl();
    }
  }, [invoice?.pdfKey, presignedUrlData?.url, fetchingUrl, fetchUrlError, retryFetchUrl]);

  if (fetchingInvoice) {
    return <div className="text-center">請求書情報を読み込み中...</div>;
  }

  if (invoiceError) {
    return (
      <div className="text-center text-red-500">
        請求書情報の読み込みエラー: {invoiceError.message}
      </div>
    );
  }

  if (!invoice) {
    return <div className="text-center">請求書が見つかりません。</div>;
  }

  return (
    <div>
      <PageHeader
        title={`請求書 #${invoice.invoiceNo || invoice.id}`}
        description="請求書の詳細とPDFプレビュー"
        actions={
          <>
            {(invoice.status === 'UNPAID' || invoice.status === 'PARTIAL') && (
              <Link href={`/invoices/${invoice.id}/pay`}>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  入金記録
                </Button>
              </Link>
            )}
            {downloadUrl && (
              <Button asChild variant="outline">
                <a href={downloadUrl} download={`invoice-${invoice.invoiceNo || invoice.id}.pdf`}>
                  <ArrowDownToLine className="mr-2 h-4 w-4" />
                  ダウンロード
                </a>
              </Button>
            )}
          </>
        }
      />

      <div className="mb-6 p-4 border rounded-lg shadow-sm bg-white">
        <h2 className="text-xl font-semibold mb-3">請求情報</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div><strong>取引先名:</strong> {invoice.partnerName}</div>
          <div><strong>件名・摘要:</strong> {invoice.description}</div>
          <div><strong>金額:</strong> ¥{invoice.amount?.toLocaleString()}</div>
          <div><strong>発行日:</strong> {invoice.issueDate ? new Date(invoice.issueDate).toLocaleDateString() : ''}</div>
          <div><strong>支払期限:</strong> {invoice.dueDate ? new Date(invoice.dueDate).toLocaleDateString() : ''}</div>
          <div><strong>ステータス:</strong> {invoice.status}</div>
        </div>
      </div>

      {fetchingUrl && <div className="text-center py-10">PDFプレビューURLを読み込み中...</div>}
      {fetchUrlError && (
        <div className="text-center py-10 text-red-500">
          <p>PDFプレビューURLの読み込みに失敗しました: {fetchUrlError.message}</p>
          <Button onClick={retryFetchUrl} variant="outline" className="mt-2">
            <RotateCw className="mr-2 h-4 w-4" />
            再試行
          </Button>
        </div>
      )}
      {iframeSrc && !fetchUrlError && !fetchingUrl && (
        <div className="w-full h-[800px] border rounded-lg overflow-hidden shadow-lg">
          <iframe
            src={iframeSrc}
            title={`請求書 ${invoice.invoiceNo || invoice.id} プレビュー`}
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        </div>
      )}
      {!iframeSrc && !fetchingUrl && !fetchUrlError && invoice?.pdfKey && (
         <div className="text-center py-10">PDFプレビューを読み込む準備ができました。</div>
      )}
      {!invoice?.pdfKey && !fetchingInvoice && (
        <div className="text-center py-10">この請求書にはPDFが関連付けられていません。</div>
      )}
    </div>
  );
} 