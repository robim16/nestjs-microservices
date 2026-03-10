import { Controller } from "@nestjs/common";
import { ProductService } from "./products.service";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { CreateProductDto, GetProductByIdDto } from "./product.dto";


@Controller()
export class ProductController {
    constructor(
        private readonly productService: ProductService
    ) {

    }

    @MessagePattern('product.create')
    create(@Payload() payload: CreateProductDto) {
        return this.productService.createNewProduct(payload)
    }

    @MessagePattern('product.list')
    list() {
        return this.productService.listProducts()
    }

    @MessagePattern('product.getById')
    getbyId(@Payload() payload: GetProductByIdDto) {
        return this.productService.getProductById(payload)
    }
}