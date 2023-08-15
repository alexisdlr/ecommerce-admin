import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"
export async function POST(req:Request, {params}: {params: {storeId: string}}) {
  try {
    const {userId} = auth()
    const body = await req.json()

    const {label, imageUrl} = body
    if(!userId) return new NextResponse('Unauthenticated', {status: 401})

    if(!label) return new NextResponse('Label missing', {status: 400})
    
    if(!imageUrl) return new NextResponse('Image url missing', {status: 400})

    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })
    if(!existingStore) return new NextResponse('Store not exists in this user', {status: 400})
    const billboard = await prismadb.billboard.create({
      data: {
        label,
        imageUrl,
        storeId: params.storeId
      }
    })
    return NextResponse.json(billboard)
  } catch (error) {
    console.log('[Billboards POST]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}
export async function GET(req:Request, {params}: {params: {storeId: string}}) {
  try {
   
    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const billboards = await prismadb.billboard.findMany({     
      where: {
        storeId: params.storeId
      }
    })
    return NextResponse.json(billboards)
  } catch (error) {
    console.log('[Billboards GET]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}