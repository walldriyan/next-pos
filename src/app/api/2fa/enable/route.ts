// file: app/api/2fa/enable/route.ts

import { prisma } from "@/app/lib/prisma/prisma";
import { getServerSession } from "next-auth";
import { NextRequest, NextResponse } from "next/server";
import * as speakeasy from "speakeasy";
import * as qrcode from "qrcode";
import { authOptions } from "@/app/(auth)/authOptions"; // ඔබගේ authOptions ගොනුවේ path එක

/**
 * @description 2FA සක්‍රීය කිරීමේ ක්‍රියාවලිය ආරම්භ කරයි.
 * රහස් යතුරක් ජනනය කර, එය QR කේතයක් ලෙස ආපසු ලබා දෙයි.
 * @method GET
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    // 1. රහස් යතුරක් ජනනය කිරීම
    const secret = speakeasy.generateSecret({
      name: `YourAppName (${session.user.email})`, // Authenticator app එකේ පෙන්වන නම
    });

    // 2. otpauth URL එක නිර්මාණය කිරීම
    const otpauthUrl = speakeasy.otpauthURL({
      secret: secret.base32,
      label: encodeURIComponent(session.user.email!),
      issuer: "YourAppName",
      encoding: "base32",
    });

    // 3. QR කේතය සඳහා data URL එකක් සෑදීම
    const qrCodeDataUrl = await qrcode.toDataURL(otpauthUrl);

    // වැදගත්: මෙම රහස් යතුර තාවකාලිකව ගබඩා කළ යුතුයි (උදා: session, cache, or a temporary DB field).
    // මෙහිදී අපි එය client එකට යවා, verify කරන විට නැවත ලබා ගන්නවා.
    // නිෂ්පාදන පරිසරයකදී, මෙය session එකේ හෝ encrypted cookie එකක ගබඩා කිරීම වඩාත් සුදුසුයි.
    return NextResponse.json({
      secret: secret.base32, // මෙම රහස client එකට යවා verify කිරීමේදී නැවත ලබාගන්නවා
      qrCodeUrl: qrCodeDataUrl,
    });

  } catch (error) {
    console.error("Error generating 2FA secret:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * @description පරිශීලකයා ලබා දෙන OTP එක තහවුරු කර 2FA සක්‍රීය කරයි.
 * @method POST
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user?.id) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const { otp, secret } = await req.json();

    if (!otp || !secret) {
      return NextResponse.json({ message: "OTP and secret are required" }, { status: 400 });
    }

    // 4. OTP එක තහවුරු කිරීම
    const isVerified = speakeasy.totp.verify({
      secret: secret,
      encoding: "base32",
      token: otp,
      window: 1,
    });

    if (!isVerified) {
      return NextResponse.json({ message: "Invalid OTP. Please try again." }, { status: 400 });
    }

    // 5. Database එකේ රහස් යතුර සහ 2FA තත්ත්වය update කිරීම
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        twoFactorSecret: secret,
        is2FAEnabled: true,
      },
    });

    return NextResponse.json({ message: "2FA enabled successfully!" }, { status: 200 });

  } catch (error) {
    console.error("Error verifying 2FA OTP:", error);
    return NextResponse.json({ message: "Internal Server Error" }, { status: 500 });
  }
}
