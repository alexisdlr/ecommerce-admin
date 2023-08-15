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
    const color = await prismadb.color.create({
      data: {
        name,
        value,
        storeId: params.storeId
      }
    })
    return NextResponse.json(color)
  } catch (error) {
    console.log('[COLOR POST]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}
export async function GET(req:Request, {params}: {params: {storeId: string}}) {
  try {
   
    if(!params.storeId) return new NextResponse('Store id missing', {status: 400})

    const sizes = await prismadb.color.findMany({     
      where: {
        storeId: params.storeId
      }
    })
    return NextResponse.json(sizes)
  } catch (error) {
    console.log('[COLOR GET]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}