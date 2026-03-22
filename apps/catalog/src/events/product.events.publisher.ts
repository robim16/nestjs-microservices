import { Inject, Injectable, Logger, OnModuleInit } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { ProductCreatedEvent } from "../products/product.events";
import { firstValueFrom } from "rxjs";

@Injectable()
export class ProductEventsPublisher implements OnModuleInit {
    
    private readonly logger = new Logger(ProductEventsPublisher.name)

    constructor(
        @Inject('SEARCH_EVENTS_CLIENT') private readonly searchEventsClient : ClientProxy
    ){}

    async onModuleInit() {
        await this.searchEventsClient.connect()
        this.logger.log('Connected to search queue')
    }

    async productCreated(event: ProductCreatedEvent) {
        try {
            console.log(event, 'Event is now logging here');

            await firstValueFrom(
                this.searchEventsClient.emit('product.created', event)
            )
        } catch (error) {
            this.logger.warn('Failed to publish product created event')
        }
    }
}