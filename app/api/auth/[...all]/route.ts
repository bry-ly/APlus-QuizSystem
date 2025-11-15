import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";
import { NextRequest, NextResponse } from "next/server";

const handler = toNextJsHandler(auth);

// Add CORS headers helper
function addCorsHeaders(
  response: NextResponse | Response,
  origin?: string | null
): NextResponse {
  // Convert Response to NextResponse if needed
  let nextResponse: NextResponse;
  
  if (response instanceof NextResponse) {
    nextResponse = response;
  } else {
    // Create NextResponse from Response
    const body = response.body;
    nextResponse = new NextResponse(body, {
      status: response.status,
      statusText: response.statusText,
      headers: new Headers(response.headers),
    });
  }

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3000",
    "https://localhost:3001",
    process.env.NEXT_PUBLIC_APP_URL,
    process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : undefined,
    "https://a-plus-quiz.vercel.app",
  ].filter(Boolean);

  const requestOrigin = origin || "";

  // In development, allow any localhost origin
  if (
    process.env.NODE_ENV === "development" &&
    requestOrigin.includes("localhost")
  ) {
    nextResponse.headers.set("Access-Control-Allow-Origin", requestOrigin);
  } else {
    // In production, only allow from allowed origins
    const corsOrigin = allowedOrigins.includes(requestOrigin)
      ? requestOrigin
      : allowedOrigins[0] || "*";
    nextResponse.headers.set("Access-Control-Allow-Origin", corsOrigin);
  }

  nextResponse.headers.set(
    "Access-Control-Allow-Methods",
    "GET, POST, PUT, DELETE, OPTIONS, PATCH"
  );
  nextResponse.headers.set(
    "Access-Control-Allow-Headers",
    "Content-Type, Authorization, Cookie, X-Requested-With"
  );
  nextResponse.headers.set("Access-Control-Allow-Credentials", "true");
  nextResponse.headers.set("Access-Control-Max-Age", "86400");

  return nextResponse;
}

export async function GET(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> }
) {
  try {
    const response = await handler.GET(request);
    return addCorsHeaders(response, request.headers.get("origin"));
  } catch (error) {
    console.error("Auth GET error:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request.headers.get("origin"));
  }
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ all?: string[] }> }
) {
  try {
    const response = await handler.POST(request);
    return addCorsHeaders(response, request.headers.get("origin"));
  } catch (error) {
    console.error("Auth POST error:", error);
    const errorResponse = NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
    return addCorsHeaders(errorResponse, request.headers.get("origin"));
  }
}

// Handle OPTIONS for CORS preflight
export async function OPTIONS(request: NextRequest) {
  const response = new NextResponse(null, { status: 200 });
  return addCorsHeaders(response, request.headers.get("origin"));
}
