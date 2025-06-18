import { Test, TestingModule } from '@nestjs/testing';
import { ElasticsearchMockService } from './elasticsearch-mock.service';

describe('ElasticsearchMockService', () => {
  let service: ElasticsearchMockService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElasticsearchMockService],
    }).compile();

    service = module.get<ElasticsearchMockService>(ElasticsearchMockService);
    service.clearMockData(); // Reset mock data before each test
  });

  it('should index a document', async () => {
    const mockDocument = { id: '1', title: 'Test Movie' };
    const result = await service.index({ body: mockDocument });
    
    expect(result.body._id).toBeDefined();
    const mockData = service.getMockData();
    expect(mockData).toContainEqual(mockDocument);
  });

  it('should search documents', async () => {
    // Prepare mock data
    await service.index({ body: { id: '1', title: 'Inception' } });
    await service.index({ body: { id: '2', title: 'Interstellar' } });

    const searchResult = await service.search({ 
      body: { query: { match: { _source: 'Inception' } } } 
    });

    expect(searchResult.body.hits.hits.length).toBe(1);
    expect(searchResult.body.hits.hits[0].title).toBe('Inception');
  });

  it('should delete a document', async () => {
    // Prepare mock data
    await service.index({ body: { id: '1', title: 'Test Movie' } });

    const deleteResult = await service.delete({ id: '1' });
    
    expect(deleteResult.body.result).toBe('deleted');
    const mockData = service.getMockData();
    expect(mockData.length).toBe(0);
  });

  it('should update a document', async () => {
    // Prepare mock data
    await service.index({ body: { id: '1', title: 'Original Title' } });

    const updateResult = await service.update({ 
      id: '1', 
      body: { title: 'Updated Title' } 
    });
    
    expect(updateResult.body.result).toBe('updated');
    const mockData = service.getMockData();
    expect(mockData[0].title).toBe('Updated Title');
  });
});