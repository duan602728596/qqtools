/* 获取小红书列表 */
interface UserPostedObject {
  readonly userId: string;
  readonly response: string;
}

export type _UserPostedObject = UserPostedObject;

export function userPostedTemplate(type: string, fn: string, data: string): string {
  const json: UserPostedObject = JSON.parse(data);

  return `
   title: 获取小红书的用户列表
    type: ${ type }
function: ${ fn }
  userId: ${ json.userId }


${ json.response }
`;
}

/* 获取小红书的feed */
interface FeedObject {
  userId: string;
  readonly sourceNoteId: string;
  readonly response: string;
}

export type _FeedObject = FeedObject;

export function feedTemplate(type: string, fn: string, data: string): string {
  const json: FeedObject = JSON.parse(data);

  return `
       title: 小红书的详细信息
        type: ${ type }
    function: ${ fn }
      userId: ${ json.userId }
sourceNoteId: ${ json.sourceNoteId }


${ json.response }
`;
}