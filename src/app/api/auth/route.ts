import { prisma } from "@/libs/prisma";
import type { UserProfile } from "@/app/_types/UserProfile";
import type { ApiResponse } from "@/app/_types/ApiResponse";
import { NextResponse, NextRequest } from "next/server";
import { verifySession } from "@/app/api/_helper/verifySession";
// 👈 verifyJwt と AUTH の import を削除しました

// キャッシュを無効化して常に最新情報を取得
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";
export const revalidate = 0;

export const GET = async (req: NextRequest) => {
  try {
    // ■■ JWTの分岐を消して、セッション認証のみに固定 ■■
    const userId = await verifySession(); 

    if (!userId) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "認証情報が無効です。再度ログインしてください。",
      };
      return NextResponse.json(res); 
    }

    // userId から userProfile を取得（👈 これは絶対に必要なので残します！）
    const user = (await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    })) as UserProfile | null;

    if (!user) {
      const res: ApiResponse<null> = {
        success: false,
        payload: null,
        message: "ユーザ情報の取得に失敗しました。",
      };
      return NextResponse.json(res);
    }

    // ユーザ情報をレスポンスする
    const res: ApiResponse<UserProfile> = {
      success: true,
      payload: user,
      message: "",
      metadata: JSON.stringify({ publishedAt: new Date() }),
    };
    return NextResponse.json(res);
  } catch (e) {
    const errorMsg = e instanceof Error ? e.message : "Internal Server Error";
    console.error(errorMsg);
    const res: ApiResponse<null> = {
      success: false,
      payload: null,
      message: "認証に関するバックエンド処理に失敗しました。",
    };
    return NextResponse.json(res);
  }
};