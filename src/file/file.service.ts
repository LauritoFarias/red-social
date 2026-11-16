import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary } from 'cloudinary';
import 'multer';

@Injectable()
export class FileService {
  constructor(private readonly configService: ConfigService) {}

  cloudinaryUploader(file: Express.Multer.File): Promise<string> {
    delete process.env.CLOUDINARY_URL;

    const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME')?.trim();
    const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY')?.trim();
    const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET')?.trim();

    console.log('Verificando credenciales Cloudinary al subir:', {
      cloudName,
      apiKey: apiKey ? `${apiKey.slice(0, 4)}...` : 'UNDEFINED',
      apiSecret: apiSecret ? 'DEFINIDO' : 'UNDEFINED',
    });

    cloudinary.config({
      cloud_name: cloudName,
      api_key: apiKey,
      api_secret: apiSecret,
      secure: true,
    });

    return new Promise<string>((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          folder: 'usuarios',
          resource_type: 'image',
        },
        (error, result) => {
          if (error) {
            console.error('Cloudinary error callback:', error);
            reject(new Error('No se pudo subir la foto a Cloudinary'));
          } else if (!result?.secure_url) {
            reject(new Error('Cloudinary no devolvió la URL de la foto'));
          } else {
            resolve(result.secure_url);
          }
        },
      );

      stream.on('error', (err: Error) => {
        console.error('Stream error:', err);
        reject(new Error('No se pudo enviar la foto a Cloudinary'));
      });

      stream.end(file.buffer);
    });
  }
}