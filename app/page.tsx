import { promises as fs } from 'fs';
import path from 'path';
import MarkdownRenderer from '@/app/components/MarkdownRenderer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import HomeAuth from '@/app/components/HomeAuth';

export default async function HomePage() {
  const readmePath = path.join(process.cwd(), 'public', 'README.md');
  let readmeContent = '';

  try {
    readmeContent = await fs.readFile(readmePath, 'utf8');
  } catch (error) {
    console.error("Could not read README.md:", error);
    readmeContent = "# 説明ファイルの読み込みに失敗しました\n\n`public/README.md` ファイルが存在するか確認してください。";
  }

  return (
    <main className="container mx-auto px-4 py-12 sm:px-6 lg:px-8">
      <header className="flex justify-between items-center mb-12 border-b pb-8">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
            Aizome
          </h1>
          <p className="mt-2 text-lg text-gray-500">
            AIスキルの学習と共有を加速させるプラットフォーム
          </p>
        </div>
        <div className="flex items-center space-x-4">
            <Button asChild size="lg" className="bg-blue-600 hover:bg-blue-700">
                <Link href="/reports">レポート一覧へ</Link>
            </Button>
            <HomeAuth />
        </div>
      </header>

      <article className="prose lg:prose-xl max-w-none mx-auto bg-white shadow-md rounded-lg p-8">
        <MarkdownRenderer content={readmeContent} />
      </article>
    </main>
  );
}