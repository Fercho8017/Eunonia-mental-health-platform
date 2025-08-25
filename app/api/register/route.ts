import { NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password, userType, phone } = await request.json()

    if (!email || !password || !userType) {
      return NextResponse.json({ error: "Faltan datos obligatorios" }, { status: 400 })
    }

    const hashedPassword = await bcrypt.hash(password, 10)

    const { error } = await supabase.from("user_profiles").insert({
      first_name: firstName,
      last_name: lastName,
      email,
      hashed_password: hashedPassword,  // nombre correcto de la columna
      user_type: userType,
      phone,
    })

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    return NextResponse.json({ message: "Usuario creado correctamente" })
  } catch (error) {
    return NextResponse.json({ error: "Error interno del servidor" }, { status: 500 })
  }
}
