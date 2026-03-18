import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
    
    private readonly logger = new Logger(ProductEventsPublisher.name)
    onModuleInit() {
    }
}