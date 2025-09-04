import { NextResponse } from 'next/server';
import { getReportById, updateReport, deleteReport } from '@/app/lib/services';
import { Report } from '@/app/lib/models';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const report = await getReportById(id);

    if (!report) {
      return NextResponse.json({ error: 'Report not found' }, { status: 404 });
    }

    return NextResponse.json(report);
  } catch (error: unknown) {
    let errorMessage = '予期せぬエラーが発生しました。';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error fetching report:', error);
    return NextResponse.json({ error: errorMessage || 'Failed to fetch report' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { title, content, type } = body; // typeも受け取る

    if (!title || !content || !type) { // typeも必須にする
      return NextResponse.json({ error: 'Title, content, and type are required' }, { status: 400 });
    }

    const updatedReportData: Report = {
      id,
      title,
      content,
      // These fields will be ignored by updateReportInDb, but are required by the Report type
      // They will be fetched from the existing report in the service layer for authorization
      author_id: '', // Placeholder, will be checked in service layer
      createdAt: new Date(), // Placeholder
      updatedAt: new Date(), // Placeholder
      userId: '', // Placeholder
      type: type, // 受け取ったtypeを設定
    };

    const updatedReport = await updateReport(updatedReportData);

    return NextResponse.json(updatedReport);
  } catch (error: unknown) {
    let errorMessage = '予期せぬエラーが発生しました。';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error updating report:', error);
    return NextResponse.json({ error: errorMessage || 'Failed to update report' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteReport(id);
    return NextResponse.json({ message: 'Report deleted successfully' }, { status: 200 });
  } catch (error: unknown) {
    let errorMessage = '予期せぬエラーが発生しました。';
    if (error instanceof Error) {
      errorMessage = error.message;
    }
    console.error('Error deleting report:', error);
    const status = errorMessage.includes("Unauthorized") || errorMessage.includes("not found") ? 403 : 500;
    return NextResponse.json({ error: errorMessage || 'Failed to delete report' }, { status: status });
  }
}