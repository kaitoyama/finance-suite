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

    // 1) Presigned POST を取得
    const { url, fields, objectKey } = await presignedPost(file.name);
    
    // 2) FormData を作成
    const formData = new FormData();
    fields.forEach(({ key, value }) => formData.append(key, value));
    formData.append('file', file);

    // 3) ブラウザから直接 POST (MDN 推奨パターン)
    await fetch(url, { method: 'POST', body: formData });

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
