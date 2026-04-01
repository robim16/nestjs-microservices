import { Injectable } from '@nestjs/common';
import { initCloudinary } from './cloudinary/cloudinary.client';
import { InjectModel } from '@nestjs/mongoose';
import { Media, MediaDocument } from './media/media.schema';
import { Model } from 'mongoose';
import { rpcBadRequest, rpcNotFound } from '@app/rpc';
import { UploadApiResponse } from 'cloudinary';
import * as streamifier from 'streamifier';


@Injectable()
export class MediaService {

  private readonly cloudinary = initCloudinary()

  constructor(
    @InjectModel(Media.name) private readonly mediaModel: Model<MediaDocument>) { }


  async uploadProductImage(input: {
    fileName: string;
    mimeType: string;
    base64: string;
    uploadByUserId: string;
  }) {
    // 1. Validaciones de entrada
    if (!input.base64) {
      rpcBadRequest('Image base64 data is required');
    }

    if (!input.mimeType.startsWith('image/')) {
      rpcBadRequest('Only images are allowed');
    }

    const currentConfig = this.cloudinary.config();
    console.log('--- CLOUDINARY DEBUG START ---');
    console.log('Cloud Name:', currentConfig.cloud_name);
    console.log('API Key:', currentConfig.api_key);
    console.log('API Secret (4 primeros chars):', currentConfig.api_secret?.substring(0, 4) + '****');
    console.log('Base64 Length:', input.base64?.length);
    console.log('--- CLOUDINARY DEBUG END ---');

    // Limpiar el string base64 por si viene con el prefijo data:image/...
    const base64Data = input.base64.replace(/^data:image\/\w+;base64,/, '');
    const buffer = Buffer.from(base64Data, 'base64');

    if (buffer.length === 0) {
      rpcBadRequest('Invalid image data: empty buffer');
    }

    try {
      // 2. Proceso de subida a Cloudinary envuelto en Promesa
      const uploadResult = await new Promise<UploadApiResponse>((resolve, reject) => {
        const uploadStream = this.cloudinary.uploader.upload_stream(
          {
            // folder: 'nestjs-microservice/products',
            // resource_type: 'image',
            upload_preset: 'nestjs-micros',
            // public_id: input.fileName.split('.')[0]
          },
          (error, result) => {
            if (error) {
              console.error('DETALLE COMPLETO DEL ERROR 403:');
              console.dir(error, { depth: null });
              return reject(error);
            }
            if (!result) {
              return reject(new Error('Cloudinary returned an empty result'));
            }
            resolve(result);
          }
        );

        // Convertir buffer a stream y enviarlo a Cloudinary
        streamifier.createReadStream(buffer).pipe(uploadStream);
      });

      // 3. Extracción de datos
      const url = uploadResult.secure_url || uploadResult.url;
      const publicId = uploadResult.public_id;

      if (!url || !publicId) {
        rpcBadRequest('Cloudinary upload did not return proper response!');
      }

      // 4. Persistencia en Base de Datos
      const mediaDoc = await this.mediaModel.create({
        url,
        publicId,
        uploadByUserId: input.uploadByUserId,
        productId: undefined
      });

      return {
        mediaId: String(mediaDoc._id),
        url,
        publicId
      };

    } catch (error) {
      console.error('Error in uploadProductImage:', error);
      throw error;
    }
  }

  async attachToProduct(input: { mediaId: string, productId: string }) {
    const updated = await this.mediaModel
      .findByIdAndUpdate(
        input.mediaId,
        {
          $set: {
            productId: input.productId,
          },
        },
        {
          new: true,
        },
      )
      .exec();

    if (!updated) {
      rpcNotFound('media not found');
    }

    return {
      mediaId: String(updated._id),
      productId: updated.productId,
      url: updated.url,
      publicId: updated.publicId,
    };
  }

  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }
}
