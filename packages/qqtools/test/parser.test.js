import parser from '../src/QQ/function/parser/index';
import { plain, image, atAll, at } from '../src/QQ/function/parser/mirai';

test('mirai template 1', function() {
  const result = parser('君不见黄河之水天上来，奔流到海不复回。');

  expect(result).toEqual([plain('君不见黄河之水天上来，奔流到海不复回。')]);
});

test('mirai template 2', function() {
  const result = parser('图文混排[CQ:image,file=1.jpg]');

  expect(result).toEqual([
    plain('图文混排'),
    image('1.jpg')
  ]);
});

test('mirai template 3', function() {
  const result = parser('<%= qqtools:atAll %>混排[CQ:image,file=2.jpg]');

  expect(result).toEqual([
    atAll(),
    plain('混排'),
    image('2.jpg')
  ]);
});

test('mirai template 4', function() {
  const result = parser('[CQ:at,qq=all]混排<%= qqtools:image, 3.png %>');

  expect(result).toEqual([
    atAll(),
    plain('混排'),
    image('3.png')
  ]);
});