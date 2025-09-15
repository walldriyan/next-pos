// file: app/api/2fa/disable/route.ts

import { prisma } from "@/app/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import { authOptions } from "@/app/(auth)/authOptions";
import { compare } from "bcrypt";

/**
 * @description පරිශීලකයාගේ මුරපදය තහවුරු කර 2FA අක්‍රීය කරයි.
 * @method POST
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ message: "Password is required to disable 2FA." }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
    });

    if (!user || !user.password) {
      return NextResponse.json({ message: "User not found." }, { status: 404 });
    }

    // 1. අනන්‍යතාවය තහවුරු කිරීමට මුරපදය පරීක්ෂා කිරීම
    const isPasswordCorrect = await compare(password, user.password);
    if (!isPasswordCorrect) {
      return NextResponse.json({ message: "Incorrect password." }, { status: 400 });
    }

    // 2. Database එකේ 2FA තත්ත්වය update කිරීම
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        is2FAEnabled: false, // This property should exist on the User model
        twoFactorSecret: null, // This property should exist on the User model
      },
    });

    return NextResponse.json({ message: "2FA disabled successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Error disabling 2FA:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
