import { NextResponse } from 'next/server';
import { updateLearningContent, deleteLearningContent, getLearningContentById } from '@/app/lib/services';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const { title, content, question, answer, difficulty, prerequisite_content_id, is_public } = await request.json();

    if (!title || !content || !question || !answer || !difficulty) {
      return NextResponse.json({ error: 'Title, content, question, answer, and difficulty are required.' }, { status: 400 });
    }

    if (difficulty < 1 || difficulty > 3) {
      return NextResponse.json({ error: 'Difficulty must be between 1 and 3.' }, { status: 400 });
    }

    const existingLearningContent = await getLearningContentById(id);
    if (!existingLearningContent) {
      return NextResponse.json({ error: 'Learning content not found.' }, { status: 404 });
    }

    const updatedLearningContent = await updateLearningContent({
      ...existingLearningContent,
      title,
      content,
      question,
      answer,
      difficulty,
      prerequisite_content_id,
      is_public,
    });

    return NextResponse.json(updatedLearningContent, { status: 200 });
  } catch (error: unknown) {
    console.error('Error updating learning content:', error);
    let errorMessage = 'Failed to update learning content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const result = await deleteLearningContent(id);
    return NextResponse.json(result, { status: 200 });
  } catch (error: unknown) {
    console.error('Error deleting learning content:', error);
    let errorMessage = 'Failed to delete learning content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const learningContent = await getLearningContentById(id);
    if (!learningContent) {
      return NextResponse.json({ error: 'Learning content not found.' }, { status: 404 });
    }
    return NextResponse.json(learningContent, { status: 200 });
  } catch (error: unknown) {
    console.error('Error fetching learning content:', error);
    let errorMessage = 'Failed to fetch learning content.';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
