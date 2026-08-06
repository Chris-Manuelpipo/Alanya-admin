import { NextRequest, NextResponse } from 'next/server';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://www.alanya237.com/api';

const BACKEND_PATHS: Record<string, string> = {
  users: '/admin/users/export',
  analytics: '/admin/analytics/export',
};

async function proxyExport(request: NextRequest, resource: string) {
  const backendPath = BACKEND_PATHS[resource];
  if (!backendPath) {
    return NextResponse.json({ error: 'Ressource d\'export inconnue' }, { status: 404 });
  }

  const auth = request.headers.get('authorization');
  if (!auth) {
    return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
  }

  const incoming = new URL(request.url);
  const target = new URL(`${API_BASE}${backendPath}`);
  incoming.searchParams.forEach((value, key) => {
    target.searchParams.set(key, value);
  });

  let backendRes: Response;
  try {
    backendRes = await fetch(target.toString(), {
      headers: { Authorization: auth },
      cache: 'no-store',
    });
  } catch {
    return NextResponse.json(
      { error: 'Impossible de joindre le serveur API. Vérifiez que le backend est en ligne.' },
      { status: 502 },
    );
  }

  if (!backendRes.ok) {
    const contentType = backendRes.headers.get('content-type') || '';
    if (contentType.includes('application/json')) {
      const body = await backendRes.json();
      return NextResponse.json(
        { error: body.error || `Export échoué (${backendRes.status})` },
        { status: backendRes.status },
      );
    }
    const text = (await backendRes.text()).slice(0, 200);
    if (backendRes.status === 404) {
      return NextResponse.json(
        {
          error:
            'Endpoint d\'export introuvable sur le backend. Redéployez Alanya-Backend avec les routes /admin/users/export et /admin/analytics/export.',
        },
        { status: 404 },
      );
    }
    return NextResponse.json(
      { error: text || `Export échoué (${backendRes.status})` },
      { status: backendRes.status },
    );
  }

  const buffer = await backendRes.arrayBuffer();
  const headers = new Headers();
  const contentType = backendRes.headers.get('content-type');
  const disposition = backendRes.headers.get('content-disposition');
  if (contentType) headers.set('Content-Type', contentType);
  if (disposition) headers.set('Content-Disposition', disposition);

  return new NextResponse(buffer, { status: 200, headers });
}

export async function GET(
  request: NextRequest,
  { params }: { params: { resource: string } },
) {
  return proxyExport(request, params.resource);
}
