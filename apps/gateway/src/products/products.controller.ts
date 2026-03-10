import { Body, Controller, Get, Inject, Param, Post } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { CurrentUser } from "../auth/current-user.decorator";
import type { UserContext } from "../auth/auth.types";
import { mapRcpErrorToHttp } from "@app/rpc";
import { firstValueFrom } from "rxjs";
import { AdminOnly } from "../auth/admin.decorator";
import { Public } from "../auth/public.decorator";

type Product = {
  _id: string;
  name: string;
  description: string;
  price: number;
  status: 'DRAFT' | 'ACTIVE';
  imageUrl: string | undefined;
  createdByClerkUserId: string | undefined;
};

@Controller()
export class ProductsHttpController {
    constructor(
        @Inject('CATALOG_CLIENT') private readonly catalogClient: ClientProxy
    ) {}


    @Post('products')
    @AdminOnly()
    async createProduct(
        @CurrentUser() user: UserContext,
        @Body()
        body: {
            name: string
            description: string
            price: number
            status?: string
            imageUrl?: string
        }
    ) {

        let product : Product

        const payload = {
            name : body.name,
            description: body.description,
            price: Number(body.price),
            status: body.status,
            imageUrl: '',
            createdByClerkUserId: user.clerkUserId
        }

        try {
            
            product = await firstValueFrom(
                this.catalogClient.send('product.create', payload)
            )
        } catch (error) {
            mapRcpErrorToHttp(error)
        }

        return product

    }


    @Get('products')
    @Public()
    async listProducts() {
        try {
            return await firstValueFrom(this.catalogClient.send('product.list', {}))
        } catch (error) {
            mapRcpErrorToHttp(error)
        }
    }

    @Get('products/:id')
    @Public()
    async getProduct(@Param('id') id: string) {
        try {
            return await firstValueFrom(this.catalogClient.send('product.getById', { id }))
        } catch (error) {
            mapRcpErrorToHttp(error)
        }
    }
}