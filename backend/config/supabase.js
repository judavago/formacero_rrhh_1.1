import dotenv from "dotenv";
dotenv.config();

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY;

if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
  console.warn(
    "⚠️ No se encontró SUPABASE_SERVICE_ROLE_KEY. El backend usará la clave anon, lo cual puede bloquear inserciones en tablas con RLS como contactos_emergencia."
  );
}

console.log("SUPABASE_URL:", supabaseUrl);
console.log("SUPABASE_KEY_TYPE:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "service_role" : "anon");

export const supabase = createClient(supabaseUrl, supabaseKey);