import { expect } from 'chai';
import { findLastCommonParent, insertToArray, removeItem, mergeArray } from '../app/helpers/merge';

describe('merge tests', () => {
  describe('findLastCommonParent', () => {
    it('should get 2', () => {
      const A = [1, 2, 3, 4];
      const B = [1, 2, 7, 9, 10];
      expect(findLastCommonParent(3, A, B)).to.equal(2);
    });
    it('should get -1', () => {
      const A = [1, 2, 3, 4];
      const B = [7, 9, 10];
      expect(findLastCommonParent(3, A, B)).to.equal(-1);
    });

    it('should get 5', () => {
      const A = [1, 2, 3, 4];
      const B = [20, 30, 1, 2, 3, 4, 47, 9, 10];
      expect(findLastCommonParent(8, A, B)).to.equal(4);
    });

    it('should get -1 for empty local array', () => {
      const A = [];
      const B = [20, 30, 1, 2, 3, 4, 47, 9, 10];
      expect(findLastCommonParent(8, A, B)).to.equal(-1);
    });
  });

  describe('insertToArray', () => {
    it('should return correct array middle', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const item = { key: '7z' };
      const key = '25';
      insertToArray(item, key, array);
      expect(array[1]).to.deep.equal({ key: '25' });
      expect(array[2]).to.deep.equal({ key: '7z' });
    });

    it('should return correct array first item', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const item = { key: '7z' };
      const key = '2a';
      insertToArray(item, key, array);
      expect(array[1]).to.deep.equal({ key: '7z' });
      expect(array[0]).to.deep.equal({ key: '2a' });
    });

    it('should return correct array if key not in array', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const item = { key: '7z' };
      const key = '2f';
      insertToArray(item, key, array);
      expect(array[array.length - 1]).to.deep.equal({ key: '7z' });
    });

    it('should return correct array last item', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const item = { key: '7z' };
      const key = 'zz';
      insertToArray(item, key, array);
      expect(array[array.length - 1]).to.deep.equal({ key: '7z' });
    });
  });

  describe('removeItem', () => {
    it('should remove item', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const key = '2a';
      removeItem(key, array);
      expect(array.length).to.equal(3);
      expect(array[0]).to.deep.equal({ key: '25' });
    });
    it('should not remove item', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const key = '2e';
      removeItem(key, array);
      expect(array.length).to.equal(4);
      expect(array[0]).to.deep.equal({ key: '2a' });
    });

    it('should not remove item', () => {
      const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
      const key = 'zz';
      removeItem(key, array);
      expect(array.length).to.equal(3);
      expect(array[0]).to.deep.equal({ key: '2a' });
      expect(array[2]).to.deep.equal({ key: '4a' });
      expect(array[3]).to.equal(undefined);
    });
  });

  describe('mergeArray', () => {
    const foo = (a, b) => {
      if (b.count === -1 && a.count !== -1) {
        return -1;
      }
      return b.count > a.count ? b : a;
    };


    it('should work correctly remove the line 4f and change data of 7a', () => {
      const A = [
        { key: '3a', count: 1 },
        { key: '4f', count: 2 },
        { key: '7a', count: 1, data: 'beck' },
        { key: '9d', count: -1 },
        { key: '3c', count: 2 },
      ];
      const B = [
        { key: '3a', count: 1 },
        { key: '4f', count: -1 },
        { key: '7a', count: 2, data: 'check' },
        { key: '9d', count: -1 },
        { key: '3c', count: 2 },
      ];

      const merged = mergeArray(A, B, foo);
      expect(merged).to.deep.equal([
        { key: '3a', count: 1 },
        { key: '7a', count: 2, data: 'check' },
        { key: '9d', count: -1 },
        { key: '3c', count: 2 },
      ]);
    });

    it('should update new lines added', () => {
      const A = [
        { key: '3a', count: 1 },
        { key: '4f', count: 2 },
        { key: '7a', count: 1, data: 'beck' },
        { key: '9d', count: -1 },
        { key: '3c', count: 2 },
      ];
      const B = [
        { key: '3a', count: 1 },
        { key: '4f', count: 2 },
        { key: '3d', count: 1, data: 'beck' },
        { key: '4d', count: 1, data: '44beck' },
        { key: '5d', count: 1, data: '44beck' },
        { key: '9d', count: -1 },
        { key: '3c', count: 2 },
      ];

      const merged = mergeArray(A, B, foo);
      expect(merged).to.deep.equal([
         { key: '3a', count: 1 },
          { key: '4f', count: 2 },
          { key: '3d', count: 1, data: 'beck' },
          { key: '4d', count: 1, data: '44beck' },
          { key: '5d', count: 1, data: '44beck' },
          { key: '7a', count: 1, data: 'beck' },
          { key: '9d', count: -1 },
          { key: '3c', count: 2 },
      ]);
    });

    it.skip('should update new lines added if no common parent', () => {
      const A = [
        { key: '3a', count: 1 },
        { key: '4f', count: 2 },
        { key: '7a', count: 1, data: 'beck' },
      ];
      const B = [
        { key: '3d', count: 1, data: 'beck' },
        { key: '4d', count: 1, data: '44beck' },
        { key: '5d', count: 1, data: '44beck' },
        // { key: '9d', count: -1 },
        // { key: '3c', count: 2 },
      ];

      const merged = mergeArray(A, B, foo);
      expect(merged).to.deep.equal([
        { key: '3a', count: 1 },
        { key: '4f', count: 2 },
        { key: '7a', count: 1, data: 'beck' },
        { key: '3d', count: 1, data: 'beck' },
        { key: '4d', count: 1, data: '44beck' },
        { key: '5d', count: 1, data: '44beck' },
      ]);
    });

    it('should retain deleted lines', () => {
      const A = [
        { key: '3a', count: 1 },
        { key: '4f', count: -1 },
        { key: '7a', count: -1},
      ];
      const B = [
        { key: '3a', count: 1 },
        { key: '4d', count: 1, data: '44beck' },
        { key: '5d', count: 1, data: '44beck' },
      ];

      const merged = mergeArray(A, B, foo);
      expect(merged).to.deep.equal([
        { key: '3a', count: 1 },
        { key: '4d', count: 1, data: '44beck' },
        { key: '5d', count: 1, data: '44beck' },
        { key: '4f', count: -1 },
        { key: '7a', count: -1},
      ]);
    });

    it('should retain deleted lines', () => {
      const A = [
        { key: '3a', count: 1 },
        { key: '4f', count: -1 },
        { key: '7a', count: 1},
      ];
      const B = [
        { key: '3a', count: 1 },
        { key: '4d', count: 1, data: '44beck' },
        { key: '7a', count: -1, data: '44beck' },
      ];

      const merged = mergeArray(A, B, foo);
      console.log(merged);
      expect(merged).to.deep.equal([
        { key: '3a', count: 1 },
        { key: '4d', count: 1, data: '44beck' },
        { key: '4f', count: -1 },
      ]);
    });
  });
});
