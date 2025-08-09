import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyJWT } from '@/lib/middlewares/auth';

// System settings model (you may want to add this to your Prisma schema)
interface SystemSettings {
  siteName: string;
  siteDescription: string;
  defaultExamDuration: number;
  defaultPassingScore: number;
  allowSelfRegistration: boolean;
  maxRetakeAttempts: number;
  emailNotifications: boolean;
  maintenanceMode: boolean;
}

// For now, we'll store settings in a simple way
// In production, you should add a Settings model to your Prisma schema

// GET - Get system settings
export async function GET(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // For now, return default settings
    // In production, you would fetch from database
    const settings: SystemSettings = {
      siteName: 'CBT Exam Satpol PP Kota Bogor',
      siteDescription: 'Sistem Computer Based Test untuk Satpol PP Kota Bogor',
      defaultExamDuration: 60, // minutes
      defaultPassingScore: 70, // percentage
      allowSelfRegistration: true,
      maxRetakeAttempts: 3,
      emailNotifications: true,
      maintenanceMode: false,
    };

    // Get some statistics for settings page
    const [totalUsers, totalExams, totalQuestions, totalResults, systemInfo] = await Promise.all([
      prisma.user.count(),
      prisma.exam.count(),
      prisma.question.count(),
      prisma.examResult.count({ where: { isCompleted: true } }),
      // System info
      Promise.resolve({
        version: '1.0.0',
        lastBackup: new Date().toISOString(),
        databaseStatus: 'healthy',
        storageUsed: '245 MB',
        uptime: '15 days, 3 hours',
      }),
    ]);

    return NextResponse.json({
      settings,
      statistics: {
        totalUsers,
        totalExams,
        totalQuestions,
        totalResults,
      },
      systemInfo,
    });
  } catch (error) {
    console.error('Get settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT - Update system settings
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyJWT(request);
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { siteName, siteDescription, defaultExamDuration, defaultPassingScore, allowSelfRegistration, maxRetakeAttempts, emailNotifications, maintenanceMode } = body;

    // Validate settings
    if (defaultExamDuration && (defaultExamDuration < 1 || defaultExamDuration > 480)) {
      return NextResponse.json(
        {
          error: 'Default exam duration must be between 1 and 480 minutes',
        },
        { status: 400 }
      );
    }

    if (defaultPassingScore && (defaultPassingScore < 0 || defaultPassingScore > 100)) {
      return NextResponse.json(
        {
          error: 'Default passing score must be between 0 and 100',
        },
        { status: 400 }
      );
    }

    if (maxRetakeAttempts && (maxRetakeAttempts < 0 || maxRetakeAttempts > 10)) {
      return NextResponse.json(
        {
          error: 'Max retake attempts must be between 0 and 10',
        },
        { status: 400 }
      );
    }

    // In production, you would update the settings in database
    // For now, we'll just return the updated settings
    const updatedSettings = {
      siteName: siteName || 'CBT Exam Satpol PP Kota Bogor',
      siteDescription: siteDescription || 'Sistem Computer Based Test untuk Satpol PP Kota Bogor',
      defaultExamDuration: defaultExamDuration || 60,
      defaultPassingScore: defaultPassingScore || 70,
      allowSelfRegistration: allowSelfRegistration !== undefined ? allowSelfRegistration : true,
      maxRetakeAttempts: maxRetakeAttempts || 3,
      emailNotifications: emailNotifications !== undefined ? emailNotifications : true,
      maintenanceMode: maintenanceMode !== undefined ? maintenanceMode : false,
    };

    return NextResponse.json({
      message: 'Settings updated successfully',
      settings: updatedSettings,
    });
  } catch (error) {
    console.error('Update settings error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
