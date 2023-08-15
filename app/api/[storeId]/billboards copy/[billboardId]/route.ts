import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {

    if (!params.billboardId) {
      return new NextResponse("billboard ID missing", { status: 400 });
    }
   
    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { label, imageUrl } = body;
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!label) return new NextResponse("Label missing", { status: 400 });

    if (!imageUrl)
      return new NextResponse("Image url missing", { status: 400 });

    if (!params.storeId)
      return new NextResponse("Store id missing", { status: 400 });

    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!existingStore)
      return new NextResponse("Store not exists in this user", { status: 400 });

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId,
      },
      data: {
        label,
        imageUrl,
      },
    });
    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[Billboards PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; billboardId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Not signed in", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID missing", { status: 400 });
    }
    if (!params.billboardId) {
      return new NextResponse("billboard ID missing", { status: 400 });
    }
    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!existingStore)
      return new NextResponse("Store not exists in this user", { status: 400 });

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId,
      },
    });

    return NextResponse.json(billboard);
  } catch (error) {
    console.log("[BILLBOARD DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
