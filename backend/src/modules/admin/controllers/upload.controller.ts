import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { randomUUID } from 'crypto';
import fs from 'fs';
import { env } from '../../../config/env';

// Memory storage for dual Azure SAS upload or local disk fallback
const storage = multer.memoryStorage();

const fileFilter = (_req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  const allowed = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif', 'application/pdf'];
  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image and document files are allowed (jpeg, png, webp, gif, pdf)'));
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2 MB limit
});

export const uploadImage = async (req: Request, res: Response): Promise<void> => {
  if (!req.file) {
    res.status(400).json({ data: null, error: { code: 'NO_FILE', message: 'No file uploaded' } });
    return;
  }

  const moduleName = (req.params.module || 'general').replace(/[^a-zA-Z0-9_-]/g, '');
  const ext = path.extname(req.file.originalname).toLowerCase() || '.png';
  const filename = `${randomUUID()}${ext}`;

  const sasToken = env.AZURE_STORAGE_SAS_TOKEN;

  if (sasToken) {
    try {
      const cleanSas = sasToken.startsWith('?') ? sasToken : `?${sasToken}`;
      const accountName = env.AZURE_STORAGE_ACCOUNT;
      const containerName = env.AZURE_STORAGE_CONTAINER;

      const blobUrl = `https://${accountName}.blob.core.windows.net/${containerName}/${moduleName}/${filename}`;
      const uploadUrl = `${blobUrl}${cleanSas}`;

      const response = await fetch(uploadUrl, {
        method: 'PUT',
        headers: {
          'x-ms-blob-type': 'BlockBlob',
          'Content-Type': req.file.mimetype,
        },
        body: req.file.buffer,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('[Azure Upload Error]', response.status, errorText);
        throw new Error(`Azure upload failed: ${response.statusText}`);
      }

      res.json({
        data: {
          imagePath: blobUrl,
          filename,
          storage: 'azure',
        },
        error: null,
      });
      return;
    } catch (err: any) {
      console.error('[Azure Blob Upload Failed, falling back to disk]', err.message);
    }
  }

  // Local disk storage fallback
  try {
    const dir = path.join(process.cwd(), 'uploads', 'images', moduleName);
    fs.mkdirSync(dir, { recursive: true });
    const localFilePath = path.join(dir, filename);
    fs.writeFileSync(localFilePath, req.file.buffer);

    const protocol = req.protocol || 'http';
    const host = req.get('host') || 'localhost:3500';
    const fullLocalUrl = `${protocol}://${host}/uploads/images/${moduleName}/${filename}`;

    res.json({ data: { imagePath: fullLocalUrl, filename, storage: 'local' }, error: null });
  } catch (err: any) {
    res.status(500).json({ data: null, error: { code: 'SAVE_FAILED', message: err.message } });
  }
};
