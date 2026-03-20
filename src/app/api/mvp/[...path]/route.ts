export const runtime = "nodejs";
export const dynamic = "force-dynamic";
import { type NextRequest } from "next/server";

import { proxyMvpRequest } from "@/server/mvp/proxy";

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function PATCH(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function HEAD(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}

export async function OPTIONS(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
    return proxyMvpRequest(request, context);
}
