import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { categoryId: string } }
) {
  try {

    if (!params.categoryId) {
      return new NextResponse("Category ID missing", { status: 400 });
    }
   
    const category = await prismadb.store.findUnique({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const { name, billboardId } = body;
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!name) return new NextResponse("Name missing", { status: 400 });

    if (!billboardId)
      return new NextResponse("Billboard ID missing", { status: 400 });

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

    const category = await prismadb.category.updateMany({
      where: {
        id: params.categoryId,
      },
      data: {
        name,
        billboardId,
      },
    });
    return NextResponse.json(category);
  } catch (error) {
    console.log("[Billboards PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; categoryId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Not signed in", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID missing", { status: 400 });
    }
    if (!params.categoryId) {
      return new NextResponse("Category ID missing", { status: 400 });
    }
    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!existingStore)
      return new NextResponse("Store not exists in this user", { status: 400 });

    const category = await prismadb.category.deleteMany({
      where: {
        id: params.categoryId,
      },
    });

    return NextResponse.json(category);
  } catch (error) {
    console.log("[CATEGORY DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
