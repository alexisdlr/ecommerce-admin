import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"
export async function POST(req:Request, {params}: {params: {storeId: string}}) {
  try {
    const {userId} = auth()
    const body = await req.json()

    const {name, value} = body
    if(!userId) return new NextResponse('Unauthenticated', {status: 401})

    if(!name) return new NextResponse('Name missing', {status: 400})
    
    if(!value) return new NextResponse('Value url missing', {status: 400})

    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId
      }
    })
    if(!existingStore) return new NextResponse('Store not exists in this user', {status: 400})
    const size = await prismadb.size.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    })
    return NextResponse.json(size)
  } catch (error) {
    console.log('[Billboards POST]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}
export async function GET(req:Request, {params}: {params: {storeId: string}}) {
  try {
   
    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const sizes = await prismadb.size.findMany({     
      where: {
        storeId: params.storeId
      }
    })
    return NextResponse.json(sizes)
  } catch (error) {
    console.log('[SIZES GET]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}