import Homepage from '../../pages/index';

test('Check App component render', () => {
  expect(Homepage).toBeDefined();
  expect(typeof Homepage).toBe('function');
});
