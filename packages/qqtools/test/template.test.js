import { plain, image, atAll, at } from '../src/QQ/parser/mirai';
import { miraiTemplate } from '../src/QQ/utils/qqUtils';

test('plain template', function() {
  const result = miraiTemplate('君不见黄河之水天上来，奔流到海不复回。');

  expect(result).toEqual([plain('君不见黄河之水天上来，奔流到海不复回。')]);
});

test('image template', function() {
  const result = miraiTemplate('这张图片好看吗？<%= qqtools:image, https://img.com/1.jpg %>太好看了。');

  expect(result).toEqual([
    plain('这张图片好看吗？'),
    image('https://img.com/1.jpg'),
    plain('太好看了。')
  ]);
});

test('at template', function() {
  const result = miraiTemplate('欢迎<%= qqtools:at %>来到直播间。', {
    qqNumber: 222222
  });

  expect(result).toEqual([
    plain('欢迎'),
    at(222222),
    plain('来到直播间。')
  ]);
});

test('atAll template', function() {
  const result = miraiTemplate('<%= qqtools:atAll %>大家要踊跃发言啊！');

  expect(result).toEqual([
    atAll(),
    plain('大家要踊跃发言啊！')
  ]);
});

test('mixing template 1', function() {
  const result = miraiTemplate(`<%= qqtools:at %>刚刚打赏了10元，恭喜他抽到了
<%= qqtools:image, 1.jpg %><%= qqtools:image, 2.jpg %><%= qqtools:image, 3.jpg %><%= qqtools:image, 4.jpg %>`, {
    qqNumber: 222222
  });

  expect(result).toEqual([
    at(222222),
    plain('刚刚打赏了10元，恭喜他抽到了\n'),
    image('1.jpg'),
    image('2.jpg'),
    image('3.jpg'),
    image('4.jpg')
  ]);
});

test('mixing template 2', function() {
  const result = miraiTemplate('<%= qqtools:atAll %>刚刚发布了微博，快去看看吧。<%= qqtools:image, https://img.com/1.jpg %>');

  expect(result).toEqual([
    atAll(),
    plain('刚刚发布了微博，快去看看吧。'),
    image('https://img.com/1.jpg')
  ]);
});