'use client';
import React, { useRef, useState } from 'react';
import { useCreatePresignedPost, useCreateAttachment } from '@/hooks/useAttachment';
export function AttachmentUploader() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [progress] = useState(0);
  const { presignedPost, loading: presigning } = useCreatePresignedPost();
  const { createAttachment, loading: saving } = useCreateAttachment();

  const upload = async () => {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    // 1) Presigned PUT URL を取得
    const { url, objectKey } = await presignedPost(file.name);
    
    // 2) R2 presigned PUT では file を直接 body に送る
    await fetch(url, { 
      method: 'PUT', 
      body: file,
      headers: {
        'Content-Type': file.type || 'application/octet-stream'
      }
    });

    // 4) メタ情報を GraphQL 経由で保存
    await createAttachment({
        s3Key: objectKey,
        title: file.name,
        amount: 0,
    });

    alert('アップロード & メタ保存 完了！');
  };

  return (
    <div>
      <input type="file" ref={fileInputRef} />
      <button onClick={upload} disabled={presigning || saving}>
        {presigning ? '準備中…' : saving ? '保存中…' : 'アップロード'}
      </button>
      {progress > 0 && <p>進捗: {progress}%</p>}
    </div>
  );
}
