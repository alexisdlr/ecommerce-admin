import { NextResponse } from "next/server"
import { auth } from "@clerk/nextjs"
import prismadb from "@/lib/prismadb"
export async function POST(req:Request) {
  try {
    const {userId} = auth()
    const body = await req.json()
    console.log('body', body)

    const {name} = body
    console.log('name', name)
    if(!userId) return new NextResponse('No user', {status: 401})

    if(!name) return new NextResponse('Store name missing', {status: 400})

    const store = await prismadb.store.create({
      data: {
        name,
        userId
      }
    })
    return NextResponse.json(store)
  } catch (error) {
    console.log('[STORES POST]', error)
    return new NextResponse('Internal Error', {status: 500})
  }
}