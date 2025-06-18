import { Injectable } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchMockService {
  private mockData: any[] = [];

  constructor() {}

  async index(params: any) {
    this.mockData.push(params.body);
    return { body: { _id: this.mockData.length } };
  }

  async search(params: any) {
    const searchTerm = params.body.query.match?._source || '';
    const results = this.mockData.filter(item => 
      JSON.stringify(item).includes(searchTerm)
    );
    return { body: { hits: { hits: results } } };
  }

  async delete(params: any) {
    const index = this.mockData.findIndex(item => item.id === params.id);
    if (index !== -1) {
      this.mockData.splice(index, 1);
      return { body: { result: 'deleted' } };
    }
    return { body: { result: 'not_found' } };
  }

  async update(params: any) {
    const index = this.mockData.findIndex(item => item.id === params.id);
    if (index !== -1) {
      this.mockData[index] = { ...this.mockData[index], ...params.body };
      return { body: { result: 'updated' } };
    }
    return { body: { result: 'not_found' } };
  }

  // Clear mock data (useful for resetting between tests)
  clearMockData() {
    this.mockData = [];
  }

  // Get current mock data (useful for assertions)
  getMockData() {
    return this.mockData;
  }
}