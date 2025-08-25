import bcrypt from "bcryptjs"
import { supabase } from "@/lib/supabase"

export const loginUser = async (email: string, password: string) => {
    console.log("Intentando login con:", email)

    const { data, error } = await supabase
        .from("user_profiles")
        .select("*")
        .eq("email", email)

    console.log("Resultado de búsqueda:", data, error)

    if (error || !data || data.length === 0) {
        return { user: null, error: "Usuario no encontrado." }
    }

    const user = data[0]

    if (!user.hashed_password) {
        return { user: null, error: "No se encontró la contraseña del usuario." }
    }

    const isValid = await bcrypt.compare(password, user.hashed_password)

    if (!isValid) {
        return { user: null, error: "Contraseña incorrecta." }
    }

    delete user.hashed_password
    return { user, error: null }
}
