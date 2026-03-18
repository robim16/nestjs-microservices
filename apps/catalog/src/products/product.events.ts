
export type ProductCreatedEvent = {
    productId: string;
    name: string;
    description: string;
    status: 'DRAFT' | 'ACTIVE';
    price: number;
    imageUrl?: string;
    createdByClerkUserId: string
}