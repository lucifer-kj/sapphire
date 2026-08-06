import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const mockAccounts = [
      {
        id: 'acc-linkedin-1',
        workspace_id: 'default-workspace',
        platform: 'linkedin',
        account_name: 'Connected User (LinkedIn)',
        token_expires_at: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
        scopes: ['openid', 'profile', 'w_member_social'],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];

    return NextResponse.json({ accounts: mockAccounts });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Account ID is required' }, { status: 400 });
    }

    return NextResponse.json({ success: true, message: `Disconnected account ${id}` });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Internal error';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
