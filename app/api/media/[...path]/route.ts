import { NextRequest, NextResponse } from 'next/server';
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Readable } from 'stream';

// S3クライアントの初期化
const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-northeast-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// 環境変数の検証
function validateEnvVars() {
  const required = ['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_S3_BUCKET_NAME'];
  const missing = required.filter(key => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

// Content-Typeをファイル拡張子から推測
function getContentType(path: string): string {
  const ext = path.toLowerCase().split('.').pop();
  const contentTypes: Record<string, string> = {
    'mp4': 'video/mp4',
    'webm': 'video/webm',
    'ogv': 'video/ogg',
    'mov': 'video/quicktime',
    'mp3': 'audio/mpeg',
    'wav': 'audio/wav',
    'ogg': 'audio/ogg',
    'aac': 'audio/aac',
    'm4a': 'audio/mp4',
    'flac': 'audio/flac',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg',
    'png': 'image/png',
    'gif': 'image/gif',
    'webp': 'image/webp',
  };
  return contentTypes[ext || ''] || 'application/octet-stream';
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    // 環境変数の検証
    validateEnvVars();

    // パラメータの取得
    const { path: pathSegments } = await params;
    const objectKey = pathSegments.join('/');

    if (!objectKey) {
      return NextResponse.json(
        { error: 'Object key is required' },
        { status: 400 }
      );
    }

    const bucketName = process.env.AWS_S3_BUCKET_NAME!;

    // S3からオブジェクトを取得
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: objectKey,
    });

    const response = await s3Client.send(command);

    // レスポンスボディが存在しない場合
    if (!response.Body) {
      return NextResponse.json(
        { error: 'Object not found or empty' },
        { status: 404 }
      );
    }

    // ストリームを取得（Readable型として扱う）
    const stream = response.Body as Readable;
    const chunks: Uint8Array[] = [];

    // ストリームを読み込む
    for await (const chunk of stream) {
      chunks.push(chunk);
    }

    // バイナリデータを結合
    const buffer = Buffer.concat(chunks);

    // Content-Typeを設定
    const contentType = response.ContentType || getContentType(objectKey);

    // レスポンスを返す
    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'public, max-age=3600, immutable',
        // ダウンロードを許可するためのヘッダー
        'Accept-Ranges': 'bytes',
        // CORSヘッダー（必要に応じて）
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
      },
    });
  } catch (error: unknown) {
    console.error('Error fetching from S3:', error);

    let errorMessage = 'Failed to fetch media from S3';
    let statusCode = 500;

    if (error instanceof Error) {
      errorMessage = error.message;

      // AWS SDKのエラーコードに基づいてステータスコードを設定
      if (errorMessage.includes('NoSuchKey') || errorMessage.includes('NotFound')) {
        statusCode = 404;
      } else if (errorMessage.includes('AccessDenied') || errorMessage.includes('Forbidden')) {
        statusCode = 403;
      }
    }

    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    );
  }
}

// OPTIONSリクエストの処理（CORS用）
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

