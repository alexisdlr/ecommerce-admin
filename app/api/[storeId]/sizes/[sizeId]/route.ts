import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {

    if (!params.sizeId) {
      return new NextResponse("size ID missing", { status: 400 });
    }
   
    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, value } = body;

    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!name) return new NextResponse("Name missing", { status: 400 });

    if (!value)
      return new NextResponse("value url missing", { status: 400 });

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

    const size = await prismadb.size.updateMany({
      where: {
        id: params.sizeId,
      },
      data: {
        name,
        value,
      },
    });
    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; sizeId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Not signed in", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID missing", { status: 400 });
    }
    if (!params.sizeId) {
      return new NextResponse("SIZE ID missing", { status: 400 });
    }
    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!existingStore)
      return new NextResponse("Store not exists in this user", { status: 400 });

    const size = await prismadb.billboard.deleteMany({
      where: {
        id: params.sizeId,
      },
    });

    return NextResponse.json(size);
  } catch (error) {
    console.log("[SIZE DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
