/* 获取抖音用户列表 */
interface FeedSpaceObject {
  readonly id: string;
  readonly response: string;
}

export type _FeedSpaceObject = FeedSpaceObject;

export function feedSpaceTemplate(type: string, fn: string, data: string): string {
  const json: FeedSpaceObject = JSON.parse(data);

  return `
   title: 获取B站用户动态
    type: ${ type }
function: ${ fn }
  userId: ${ json.id }


${ json.response }
`;
}