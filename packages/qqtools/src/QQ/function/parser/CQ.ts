/**
 * 创建CQ码
 */

export function image(file: string, type: 'file' | 'url' = 'file'): string {
  return `[CQ:image,${ type }=${ file }]`;
}

export function at(id: number): string {
  return `[CQ:at,qq=${ id }]`;
}

export function atAll(): string {
  return '[CQ:at,qq=all]';
}

export function record(file: string, type: 'file' | 'url' = 'file'): string {
  return `[CQ:record,${ type }=${ file }]`;
}