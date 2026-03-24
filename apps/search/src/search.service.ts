import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { SearchProduct, SearchProductDocument } from './search/search-index-schema';
import { Model } from 'mongoose';

@Injectable()
export class SearchService {

  constructor(
    @InjectModel(SearchProduct.name) private readonly model: Model<SearchProductDocument>
  ) { }

  normalizeText(input: { name: string; description: string }) {
    return `${input.name} ${input.description}`.toLocaleLowerCase()
  }

  async upsertFromCatalogEvent(input: {
    productId: string,
    name: string,
    description: string,
    status: 'DRAFT' | 'ACTIVE',
    price: number
  }) {

    const normalizedText = this.normalizeText({
      name: input.name,
      description: input.description
    })

    try {

      await this.model.findOneAndUpdate(
        { productId: input.productId },
        {
          $set: {
            name: input.name,
            normalizedText,
            status: input.name,
            price: input.price
          }
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true
        }
      )
    } catch (error) {
      console.log(error);
    }
  }

  async query(input: { q: string; limit?: number }) {
    const q = (input.q ?? "").trim().toLocaleLowerCase()

    if (!q) {
      return []
    }

    const limit = Math.min(Math.max(input.limit ?? 10, 1), 20)

    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    return this.model
      .find({ normalizedText: { $regex: regex } })
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }

  ping() {
    return {
      ok: true,
      service: 'media',
      now: new Date().toISOString(),
    };
  }
}
