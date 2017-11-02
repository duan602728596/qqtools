import { message } from 'antd';

/**
 * 复制指定区域文本
 */
export function copy(id: string, event: Object): void{
  const range = document.createRange();
  range.selectNode(document.getElementById(id));

  const selection = window.getSelection();
  if(selection.rangeCount > 0) selection.removeAllRanges();
  selection.addRange(range);
  document.execCommand('copy');

  message.info('复制到剪贴板。');
}