import { Request, Response } from "express";
import multer from "multer";
import { createClient } from "@supabase/supabase-js";
import path from "path";

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Solo se permiten imágenes JPEG, PNG o WebP"));
    }
  },
});

function getSupabaseClient() {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL y SUPABASE_SERVICE_KEY son requeridos");
  return createClient(url, key);
}

export const uploadMiddleware = upload.single("image");

export async function uploadProductImage(req: Request, res: Response) {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ success: false, message: "No se recibió ningún archivo" });
      return;
    }

    const supabase = getSupabaseClient();
    const ext = path.extname(file.originalname) || ".jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;

    const { error } = await supabase.storage
      .from("product-images")
      .upload(filename, file.buffer, { contentType: file.mimetype, upsert: false });

    if (error) {
      res.status(500).json({ success: false, message: `Error al subir la imagen: ${error.message}` });
      return;
    }

    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(filename);

    console.log("[upload] URL generada:", urlData.publicUrl);

    res.status(200).json({ success: true, data: { url: urlData.publicUrl } });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Error interno al subir la imagen";
    res.status(500).json({ success: false, message });
  }
}
