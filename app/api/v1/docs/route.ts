import { NextRequest, NextResponse } from 'next/server';
import swaggerConfig from './swagger.config';

// Serve o JSON da documentação OpenAPI
export async function GET(request: NextRequest) {
  return NextResponse.json(swaggerConfig);
}