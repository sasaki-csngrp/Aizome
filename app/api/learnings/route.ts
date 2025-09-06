import { NextResponse } from 'next/server';
import { createLearningContent, getAllLearningContents } from '@/app/lib/services';

export async function POST(request: Request) {
  try {
    const { title, content, question, answer, difficulty, prerequisite_content_id, is_public } = await request.json();

    if (!title || !content || !question || !answer || !difficulty) {
      return NextResponse.json({ error: 'Title, content, question, answer, and difficulty are required.' }, { status: 400 });
    }

    if (difficulty < 1 || difficulty > 3) {
      return NextResponse.json({ error: 'Difficulty must be between 1 and 3.' }, { status: 400 });
    }

    const learningContent = await createLearningContent(title, content, question, answer, difficulty, prerequisite_content_id, is_public);
    return NextResponse.json(learningContent, { status: 201 }); // 201 Created
  } catch (error: unknown) {
    console.error('Error creating learning content:', error);
    let errorMessage = 'Failed to create learning content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET() {
  try {
    const learningContents = await getAllLearningContents();
    return NextResponse.json(learningContents, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching learning contents:', error);
    let errorMessage = 'Failed to fetch learning contents.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
