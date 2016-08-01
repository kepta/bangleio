import { expect } from 'chai';
import { mergeContent, insertLine } from '../app/helpers/merge';
import { EditorState, convertFromRaw, convertToRaw } from 'draft-js';

describe('merge tests', () => {
  describe('replace text', () => {
    let rawContentState = {
      'entityMap': {},
      'blocks': [
          { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '23uc1', 'text': 'check1234e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '27d7a', 'text': '2211...sdsd222222', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '2fjd0', 'text': 'sdsd', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '36m6e', 'text': 'e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ao31r', 'text': 'sdsdsss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'edt0l', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ets13', 'text': 'kushanssss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b4v0e', 'text': 'random', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '5pe16', 'text': 'check', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '7jn6b', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b7b2b', 'text': 'line99', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'bq28v', 'text': 'randomness', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '38im5', 'text': 'kushanss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
      ],
    };

    let editorState = EditorState.createWithContent(convertFromRaw(rawContentState));
    it('should get editorState', () => {
      expect(editorState).to.be.object;
    });
    it('should replace text with bigger text', () => {
      const B = [{ key: '20s4l', text: 'latinrocks' }];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('20s4l').getText()).to.equal('latinrocks');
    });
    it('should replace text with bigger text', () => {
      const B = [{ key: '20s4l', text: 'kushan_rocks' }];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('20s4l').getText()).to.equal('kushan_rocks');
    });
    it('should replace empty text with bigger text', () => {
      const key = 'edt0l';
      const B = [{ key, text: 'latinrock!' }];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey(key).getText()).to.equal('latinrock!');
    });

    it('should replace text with smaller text', () => {
      const key = '38im5';
      const B = [{ key, text: '!' }];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey(key).getText()).to.equal('!');
    });

    it('should replace text with multiple texts', () => {
      const B = [
        { key: '20s4l', text: 'latinrocks' },
        { key: 'edt0l', text: 'latinrock!' },
        { key: '38im5', text: 'm' },
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('20s4l').getText()).to.equal('latinrocks');
      expect(contentState.getBlockForKey('edt0l').getText()).to.equal('latinrock!');
      expect(contentState.getBlockForKey('38im5').getText()).to.equal('m');
    });
    it('should replace text with empty text', () => {
      const B = [
        { key: '20s4l', text: '' },
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('20s4l').getText()).to.equal('');
    });
  });

  describe('remove block', () => {
    let rawContentState = {
      'entityMap': {},
      'blocks': [
          { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '23uc1', 'text': 'check1234e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '27d7a', 'text': '2211...sdsd222222', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '2fjd0', 'text': 'sdsd', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '36m6e', 'text': 'e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ao31r', 'text': 'sdsdsss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'edt0l', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ets13', 'text': 'kushanssss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b4v0e', 'text': 'random', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '5pe16', 'text': 'check', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '7jn6b', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b7b2b', 'text': 'line99', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'bq28v', 'text': 'randomness', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '38im5', 'text': 'kushanss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
      ],
    };
    let editorState = EditorState.createWithContent(convertFromRaw(rawContentState));

    it('should delete second row', () => {
        const B = [{ key: '23uc1', text: 'latinrocks' }];
        const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => null);

        expect(convertToRaw(contentState).blocks).to.deep.equal([
            { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '27d7a', 'text': '2211...sdsd222222', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '2fjd0', 'text': 'sdsd', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '36m6e', 'text': 'e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'ao31r', 'text': 'sdsdsss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'edt0l', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'ets13', 'text': 'kushanssss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'b4v0e', 'text': 'random', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '5pe16', 'text': 'check', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '7jn6b', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'b7b2b', 'text': 'line99', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': 'bq28v', 'text': 'randomness', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
            { 'key': '38im5', 'text': 'kushanss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
        ]);
    });
    it('should delete multiple rows', () => {
      const B = [
        { key: '23uc1', 'text': 'lolz' },
        { key: '27d7a', 'text': 'lolz' },
        { key: '2fjd0' },
        { key: '7jn6b' },
        { key: '38im5' },
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => null);
      expect(convertToRaw(contentState).blocks).to.deep.equal([
          { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '36m6e', 'text': 'e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ao31r', 'text': 'sdsdsss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'edt0l', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ets13', 'text': 'kushanssss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b4v0e', 'text': 'random', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '5pe16', 'text': 'check', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b7b2b', 'text': 'line99', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'bq28v', 'text': 'randomness', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
      ]);
    });
  });
  describe('insert a line', () => {
    let rawContentState = {
      'entityMap': {},
      'blocks': [
          { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '23uc1', 'text': 'check1234e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '27d7a', 'text': '2211...sdsd222222', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '2fjd0', 'text': 'sdsd', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '36m6e', 'text': 'e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ao31r', 'text': 'sdsdsss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'edt0l', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'ets13', 'text': 'kushanssss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b4v0e', 'text': 'random', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '5pe16', 'text': 'check', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '7jn6b', 'text': '', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'b7b2b', 'text': 'line99', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': 'bq28v', 'text': 'randomness', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '38im5', 'text': 'kushanss', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
      ],
    };
    const editorState = EditorState.createWithContent(convertFromRaw(rawContentState));
    it('should add a line', () => {
      const B =
        { key: 'rando', text: 'wtf' }
      ;
      const contentState = insertLine(B, ['20s4l', '23uc1', '27d7a', 'rando'], editorState.getCurrentContent());
      expect(contentState.getBlockForKey('rando').getText()).to.equal('wtf');
      expect(contentState.getBlockBefore('rando').getText()).to.equal('2211...sdsd222222');
      expect(contentState.getBlockAfter('rando').getText()).to.equal('sdsd');
    });
    it('should add a line center', () => {
      const B =
        { key: 'rando', text: 'wtf' }
      ;
      const contentState = insertLine(B, ['20s4l', 'rando', '27d7a'], editorState.getCurrentContent());
      expect(contentState.getBlockForKey('rando').getText()).to.equal('wtf');
      expect(contentState.getBlockBefore('rando').getText()).to.equal('lolz');
      expect(contentState.getBlockAfter('rando').getText()).to.equal('check1234e');
    });
    it('should add a line end', () => {
      const B =
        { key: 'rando', text: 'wtf' }
      ;
      const contentState = insertLine(B, ['wtf', 'rando', '27d7a'], editorState.getCurrentContent());
      expect(contentState.getBlockForKey('rando').getText()).to.equal('wtf');
      expect(contentState.getBlockBefore('rando').getKey()).to.equal('38im5');
    });
  });
  describe('add block', () => {
    let rawContentState = {
      'entityMap': {},
      'blocks': [
          { 'key': '20s4l', 'text': 'lolz', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '23uc1', 'text': 'check1234e', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
          { 'key': '27d7a', 'text': '2211...sdsd222222', 'type': 'unstyled', 'depth': 0, 'inlineStyleRanges': [], 'entityRanges': [], 'data': {} },
      ],
    };
    let editorState = EditorState.createWithContent(convertFromRaw(rawContentState));

    it('should add a line', () => {
      const B = [
        { key: '20s4l', text: 'latinrocks' },
        { key: '3obbd', text: 'inserted' }
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('3obbd').getText()).to.equal('inserted');
      expect(contentState.getBlockBefore('3obbd').getKey()).to.equal('20s4l');
      expect(contentState.getBlockBefore('3obbd').getText()).to.equal('latinrocks');

      expect(contentState.getBlockAfter('3obbd').getKey()).to.equal('23uc1');
      expect(contentState.getBlockAfter('3obbd').getText()).to.equal('check1234e');
    });
    it('should add a block', () => {
      const B = [
        { key: '20s4l', text: 'latinrocks' },
        { key: '3obbd', text: 'inserted' },
        { key: '2fjd0', text: 'oh boy' },
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('3obbd').getText()).to.equal('inserted');
      expect(contentState.getBlockBefore('3obbd').getKey()).to.equal('20s4l');
      expect(contentState.getBlockAfter('3obbd').getKey()).to.equal('2fjd0');
      expect(contentState.getBlockAfter('2fjd0').getKey()).to.equal('23uc1');
    });

    it('should add a line at end', () => {
      const B = [
        { key: 'z0s4l', text: 'latinrocks' },

        { key: 'z0s4l', text: 'latinrocks' },
        { key: '3obbd', text: 'inserted' }
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('3obbd').getText()).to.equal('inserted');
      expect(contentState.getBlockBefore('z0s4l').getKey()).to.equal('27d7a');
      expect(contentState.getBlockBefore('z0s4l').getText()).to.equal('2211...sdsd222222');
    });

    it('should add a line at end', () => {
      const B = [
        { key: '27d7a', text: 'latinrocks' },
        { key: '3obbd', text: 'inserted' }
      ];
      const contentState = mergeContent(editorState.getCurrentContent(), B, (a, b) => b);
      expect(contentState.getBlockForKey('3obbd').getText()).to.equal('inserted');
      expect(contentState.getBlockBefore('3obbd').getKey()).to.equal('27d7a');
      expect(contentState.getBlockBefore('3obbd').getText()).to.equal('latinrocks');
      expect(contentState.getBlockBefore('27d7a').getText()).to.equal('check1234e');
    });
  });
});
//
//   describe('insertToArray', () => {
//     it('should return correct array middle', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const item = { key: '7z' };
//       const key = '25';
//       insertToArray(item, key, array);
//       expect(array[1]).to.deep.equal({ key: '25' });
//       expect(array[2]).to.deep.equal({ key: '7z' });
//     });
//
//     it('should return correct array first item', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const item = { key: '7z' };
//       const key = '2a';
//       insertToArray(item, key, array);
//       expect(array[1]).to.deep.equal({ key: '7z' });
//       expect(array[0]).to.deep.equal({ key: '2a' });
//     });
//
//     it('should return correct array if key not in array', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const item = { key: '7z' };
//       const key = '2f';
//       insertToArray(item, key, array);
//       expect(array[array.length - 1]).to.deep.equal({ key: '7z' });
//     });
//
//     it('should return correct array last item', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const item = { key: '7z' };
//       const key = 'zz';
//       insertToArray(item, key, array);
//       expect(array[array.length - 1]).to.deep.equal({ key: '7z' });
//     });
//   });
//
//   describe('removeItem', () => {
//     it('should remove item', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const key = '2a';
//       removeItem(key, array);
//       expect(array.length).to.equal(3);
//       expect(array[0]).to.deep.equal({ key: '25' });
//     });
//     it('should not remove item', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const key = '2e';
//       removeItem(key, array);
//       expect(array.length).to.equal(4);
//       expect(array[0]).to.deep.equal({ key: '2a' });
//     });
//
//     it('should not remove item', () => {
//       const array = [{ key: '2a' }, { key: '25' }, { key: '4a' }, { key: 'zz' }];
//       const key = 'zz';
//       removeItem(key, array);
//       expect(array.length).to.equal(3);
//       expect(array[0]).to.deep.equal({ key: '2a' });
//       expect(array[2]).to.deep.equal({ key: '4a' });
//       expect(array[3]).to.equal(undefined);
//     });
//   });
//
//   describe('mergeArray', () => {
//     const foo = (a, b) => {
//       if (b.count === -1 && a.count !== -1) {
//         return -1;
//       }
//       return b.count > a.count ? b : a;
//     };
//
//
//     it('should work correctly remove the line 4f and change data of 7a', () => {
//       const A = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: 2 },
//         { key: '7a', count: 1, data: 'beck' },
//         { key: '9d', count: -1 },
//         { key: '3c', count: 2 },
//       ];
//       const B = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: -1 },
//         { key: '7a', count: 2, data: 'check' },
//         { key: '9d', count: -1 },
//         { key: '3c', count: 2 },
//       ];
//
//       const merged = mergeArray(A, B, foo);
//       expect(merged).to.deep.equal([
//         { key: '3a', count: 1 },
//         { key: '7a', count: 2, data: 'check' },
//         { key: '9d', count: -1 },
//         { key: '3c', count: 2 },
//       ]);
//     });
//
//     it('should update new lines added', () => {
//       const A = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: 2 },
//         { key: '7a', count: 1, data: 'beck' },
//         { key: '9d', count: -1 },
//         { key: '3c', count: 2 },
//       ];
//       const B = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: 2 },
//         { key: '3d', count: 1, data: 'beck' },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '5d', count: 1, data: '44beck' },
//         { key: '9d', count: -1 },
//         { key: '3c', count: 2 },
//       ];
//
//       const merged = mergeArray(A, B, foo);
//       expect(merged).to.deep.equal([
//          { key: '3a', count: 1 },
//           { key: '4f', count: 2 },
//           { key: '3d', count: 1, data: 'beck' },
//           { key: '4d', count: 1, data: '44beck' },
//           { key: '5d', count: 1, data: '44beck' },
//           { key: '7a', count: 1, data: 'beck' },
//           { key: '9d', count: -1 },
//           { key: '3c', count: 2 },
//       ]);
//     });
//
//     it.skip('should update new lines added if no common parent', () => {
//       const A = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: 2 },
//         { key: '7a', count: 1, data: 'beck' },
//       ];
//       const B = [
//         { key: '3d', count: 1, data: 'beck' },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '5d', count: 1, data: '44beck' },
//         // { key: '9d', count: -1 },
//         // { key: '3c', count: 2 },
//       ];
//
//       const merged = mergeArray(A, B, foo);
//       expect(merged).to.deep.equal([
//         { key: '3a', count: 1 },
//         { key: '4f', count: 2 },
//         { key: '7a', count: 1, data: 'beck' },
//         { key: '3d', count: 1, data: 'beck' },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '5d', count: 1, data: '44beck' },
//       ]);
//     });
//
//     it('should retain deleted lines', () => {
//       const A = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: -1 },
//         { key: '7a', count: -1 },
//       ];
//       const B = [
//         { key: '3a', count: 1 },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '5d', count: 1, data: '44beck' },
//       ];
//
//       const merged = mergeArray(A, B, foo);
//       expect(merged).to.deep.equal([
//         { key: '3a', count: 1 },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '5d', count: 1, data: '44beck' },
//         { key: '4f', count: -1 },
//         { key: '7a', count: -1 },
//       ]);
//     });
//
//     it('should retain deleted lines', () => {
//       const A = [
//         { key: '3a', count: 1 },
//         { key: '4f', count: -1 },
//         { key: '7a', count: 1 },
//       ];
//       const B = [
//         { key: '3a', count: 1 },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '7a', count: -1, data: '44beck' },
//       ];
//
//       const merged = mergeArray(A, B, foo);
//       console.log(merged);
//       expect(merged).to.deep.equal([
//         { key: '3a', count: 1 },
//         { key: '4d', count: 1, data: '44beck' },
//         { key: '4f', count: -1 },
//       ]);
//     });
//   });
// });
