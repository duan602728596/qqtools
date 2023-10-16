/* 获取抖音用户列表 */
interface AwemePostObject {
  readonly userId: string;
  readonly response: string;
}

export type _AwemePostObject = AwemePostObject;

export function awemePostTemplate(type: string, fn: string, data: string): string {
  const json: AwemePostObject = JSON.parse(data);

  return `
   title: 获取抖音的用户列表
    type: ${ type }
function: ${ fn }
  userId: ${ json.userId }


${ json.response }
`;
}