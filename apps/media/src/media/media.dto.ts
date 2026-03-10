import { IsString } from "class-validator"


export class UploadProductImageDto {
    @IsString()
    fileName: string

    @IsString()
    mimeType: string

    @IsString()
    base64: string

    @IsString()
    uploadByUserId: string
}

export class AttachToProductDto {
    mediaId: string

    productID: string

    attachedByUserId: string
}