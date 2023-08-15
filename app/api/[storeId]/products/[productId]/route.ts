import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID missing", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        images: true,
        color: true,
        size: true,
        category: true,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCT GET]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();
    const body = await req.json();

    const {
      name,
      price,
      images,
      colorId,
      sizeId,
      categoryId,
      isArchived,
      isFeatured,
    } = body;
    if (!userId) return new NextResponse("Unauthenticated", { status: 401 });

    if (!name) return new NextResponse("Name missing", { status: 400 });

    if (!price) return new NextResponse("Price missing", { status: 400 });
    if (!images || !images.length)
      return new NextResponse("images url missing", { status: 400 });
    if (!sizeId) return new NextResponse("Size Id missing", { status: 400 });
    if (!colorId) return new NextResponse("Color id missing", { status: 400 });
    if (!categoryId)
      return new NextResponse("Category Id missing", { status: 400 });

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

    await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        name,
        price,
        images: {
          deleteMany: {},
        },
        storeId: params.storeId,
        colorId,
        sizeId,
        categoryId,
        isArchived,
        isFeatured,
      },
    });

    const product = await prismadb.product.update({
      where: {
        id: params.productId,
      },
      data: {
        images: {
          createMany: {
            data: [...images.map((image: { url: string }) => image)],
          },
        },
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[PRODUCTS PATCH]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const { userId } = auth();

    if (!userId) {
      return new NextResponse("Not signed in", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID missing", { status: 400 });
    }
    if (!params.productId) {
      return new NextResponse("product ID missing", { status: 400 });
    }
    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId,
      },
    });
    if (!existingStore)
      return new NextResponse("Store not exists in this user", { status: 400 });

    const product = await prismadb.product.deleteMany({
      where: {
        id: params.productId,
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log("[Product DELETE]", error);
    return new NextResponse("Internal Error", { status: 500 });
  }
}
