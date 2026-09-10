import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Requested-With",
};

const CF_ACCOUNT_ID = process.env.CLOUDFLARE_ACCOUNT_ID || "8b4cf30cd85d25da2d64bd3e7f54b74d";
const CF_API_TOKEN = process.env.CLOUDFLARE_API_TOKEN || "cfat_Dfb48Gcovs6OUTrUv1QHD0rpRrv20i2kh9DTAulq39bb3362";
const R2_BUCKET = "gamernotfound";

export async function OPTIONS() {
  return new NextResponse(null, { status: 204, headers: corsHeaders });
}

// POST /api/admin/banners/upload
// Accepts multipart/form-data or JSON { imageBase64, fileName, contentType }
export async function POST(request: Request) {
  try {
    const contentType = request.headers.get("content-type") || "";
    let fileBuffer: Buffer | null = null;
    let fileName = "banner-" + Date.now() + ".png";
    let mimeType = "image/png";

    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData();
      const file = formData.get("file") as File | null;
      if (!file) {
        return NextResponse.json({ success: false, error: "No file provided in form data" }, { status: 400, headers: corsHeaders });
      }
      const arrayBuffer = await file.arrayBuffer();
      fileBuffer = Buffer.from(arrayBuffer);
      const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, "_");
      fileName = Date.now() + "-" + safeName;
      mimeType = file.type || "image/png";
    } else {
      const body = await request.json();
      if (!body.imageBase64) {
        return NextResponse.json({ success: false, error: "Missing imageBase64 or file payload" }, { status: 400, headers: corsHeaders });
      }
      const base64Data = body.imageBase64.replace(/^data:image\/\w+;base64,/, "");
      fileBuffer = Buffer.from(base64Data, "base64");
      if (body.fileName) {
        fileName = Date.now() + "-" + body.fileName.replace(/[^a-zA-Z0-9._-]/g, "_");
      }
      if (body.contentType) {
        mimeType = body.contentType;
      }
    }

    if (!fileBuffer || fileBuffer.length === 0) {
      return NextResponse.json({ success: false, error: "Empty file content" }, { status: 400, headers: corsHeaders });
    }

    // 1. Generate base64 data URL for 100% immediate reliable client rendering
    const base64DataUrl = `data:${mimeType};base64,${fileBuffer.toString("base64")}`;

    // 2. Save locally into Next.js public uploads directory
    let publicPathUrl = "";
    try {
      const uploadDir = path.join(process.cwd(), "public", "uploads", "banners");
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      const filePath = path.join(uploadDir, fileName);
      fs.writeFileSync(filePath, fileBuffer);
      publicPathUrl = `/uploads/banners/${fileName}`;
    } catch (fsErr) {
      console.warn("Local disk write note (serverless/edge environment):", fsErr);
    }

    const uniqueKey = "banners/" + fileName;
    let r2Uploaded = false;
    let r2DirectUrl = `https://${CF_ACCOUNT_ID}.r2.cloudflarestorage.com/${R2_BUCKET}/${uniqueKey}`;

    // 3. Attempt Cloudflare R2 direct bucket upload via Cloudflare API
    try {
      const r2UploadUrl = `https://api.cloudflare.com/client/v4/accounts/${CF_ACCOUNT_ID}/r2/buckets/${R2_BUCKET}/objects/${encodeURIComponent(uniqueKey)}`;
      const r2Res = await fetch(r2UploadUrl, {
        method: "PUT",
        headers: {
          "Authorization": `Bearer ${CF_API_TOKEN}`,
          "Content-Type": mimeType,
        },
        body: fileBuffer,
      });

      if (r2Res.ok) {
        r2Uploaded = true;
      } else {
        console.warn("Cloudflare R2 API response status:", r2Res.status, await r2Res.text().catch(() => ""));
      }
    } catch (r2Err) {
      console.warn("Cloudflare R2 upload note:", r2Err);
    }

    // Return the best working image URL:
    // Prefer publicPathUrl or base64DataUrl for universal display
    const finalImageUrl = publicPathUrl || base64DataUrl;

    return NextResponse.json(
      {
        success: true,
        imageUrl: finalImageUrl,
        publicUrl: publicPathUrl,
        dataUrl: base64DataUrl,
        r2S3Url: r2DirectUrl,
        r2Uploaded,
        key: uniqueKey,
        bucket: R2_BUCKET,
        fileName: fileName,
        size: fileBuffer.length,
        message: r2Uploaded
          ? "Uploaded successfully to Cloudflare R2 bucket gamernotfound & local cache"
          : "Uploaded and processed image successfully",
      },
      { headers: corsHeaders }
    );
  } catch (error: any) {
    console.error("Banner upload error:", error);
    return NextResponse.json(
      { success: false, error: error?.message || "Upload failed" },
      { status: 500, headers: corsHeaders }
    );
  }
}
