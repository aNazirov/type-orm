import {
  ArgumentMetadata,
  Injectable,
  Logger,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class ParseQueryPipe implements PipeTransform {
  private readonly logger = new Logger('ParseQueryPipe');

  transform(value: any, metadata: ArgumentMetadata) {
    const { type } = metadata;
    // Make sure to only run your logic on queries

    if (type === 'query') return this.transformQuery(value);

    return value;
  }

  transformQuery(query: any) {
    try {
      const value = JSON.parse(query);

      if (typeof value !== 'object' || !query) return query;

      return value;
    } catch {
      return query;
    }
  }
}
