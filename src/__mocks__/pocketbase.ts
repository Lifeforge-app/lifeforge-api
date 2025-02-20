const mockCollection = {
  authWithPassword: jest.fn().mockResolvedValue({}),
  getFullList: jest.fn().mockResolvedValue([]),
  getOne: jest.fn().mockResolvedValue({}),
  create: jest.fn().mockResolvedValue({}),
  update: jest.fn().mockResolvedValue({}),
  delete: jest.fn().mockResolvedValue(true),
};

const mockPocketBase = jest.fn().mockImplementation(() => ({
  collection: jest.fn(() => mockCollection),
}));

export default mockPocketBase;
