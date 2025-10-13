import { NextResponse } from 'next/server'
import { checkDatabaseHealth } from '@/lib/db'
import { checkSystemHealth } from '@/lib/utils/analytics'

export async function GET() {
  try {
    // Check database connectivity
    const dbHealth = await checkDatabaseHealth()

    // Check system components
    const systemHealth = await checkSystemHealth()

    // Check environment variables
    const envCheck = {
      database: !!process.env.POSTGRES_URL,
      openai: !!process.env.OPENAI_API_KEY,
      anthropic: !!process.env.ANTHROPIC_API_KEY,
      nextAuth: !!process.env.NEXTAUTH_SECRET,
      vercelKV: !!process.env.KV_URL
    }

    const overallStatus = dbHealth.status === 'healthy' &&
                         systemHealth.database === 'healthy' &&
                         Object.values(envCheck).every(Boolean) ? 'healthy' : 'degraded'

    return NextResponse.json({
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: '1.0.0',
      services: {
        database: dbHealth,
        system: systemHealth,
        environment: envCheck
      },
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      platform: process.platform,
      nodeVersion: process.version
    })
  } catch (error) {
    console.error('Health check error:', error)

    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 503 })
  }
}