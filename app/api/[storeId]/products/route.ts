import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"
import { URLSearchParams } from "next/dist/compiled/@edge-runtime/primitives/url"
export async function POST(req:Request, {params}: {params: {storeId: string}}) {
  try {
    const {userId} = auth()
    const body = await req.json()

    const {name, price, images, colorId, sizeId, categoryId, isArchived, isFeatured} = body


    if(!userId) return new NextResponse('Unauthenticated', {status: 401})

    if(!name) return new NextResponse('Name missing', {status: 400})
    
    if(!price) return new NextResponse('Price missing', {status: 400})
    if(!images || !images.length) return new NextResponse('images url missing', {status: 400})
    if(!sizeId) return new NextResponse('Size Id missing', {status: 400})
    if(!colorId) return new NextResponse('Color id missing', {status: 400})
    if(!categoryId) return new NextResponse('Category Id missing', {status: 400})

    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })
    if(!existingStore) return new NextResponse('Store not exists in this user', {status: 400})
    const product = await prismadb.product.create({
      data: {
        name,
        price,
        images: {
          createMany: {
            data: [...images.map((image: {url:string}) => image)]
          }
        },
        storeId: params.storeId,
        colorId,
        sizeId,
        categoryId,
        isArchived,
        isFeatured
      }
    })
    return NextResponse.json(product)
  } catch (error) {
    console.log('[PRODUCTS POST]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}
export async function GET(req:Request, {params}: {params: {storeId: string}}) {
  try {
    const {searchParams} = new URL(req.url)
    const categoryId = searchParams.get('categoryId') || undefined
    const colorId = searchParams.get('colorId') || undefined
    const sizeId = searchParams.get('sizeId') || undefined
    const isFeatured = searchParams.get('isFeatured') 

   
    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const products = await prismadb.product.findMany({     
      where: {
        categoryId,
        sizeId,
        colorId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
        storeId: params.storeId
      },
      include: {
        category: true,
        size: true,
        color: true,
        images: true,

      },
      orderBy: {
        createdAt: 'desc'
      }
    })
    return NextResponse.json(products)
  } catch (error) {
    console.log('[PRODUCTS GET]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}