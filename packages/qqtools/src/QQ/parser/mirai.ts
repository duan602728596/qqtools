/**
 * 发送的信息类型
 * 类型文档：https://github.com/project-mirai/mirai-api-http/blob/master/docs/MessageType.md
 */
export interface PlainProps {
  type: 'Plain';
  text: string;
}

export interface FaceProps {
  type: 'Face';
  faceId: number;
  name?: string;
}

export interface DiceProps {
  type: 'Dice';
  value: number;
}

export interface ImageUrlProps {
  type: 'Image';
  url: string;
}

export interface ImagePathProps {
  type: 'Image';
  path: string;
}

export interface AtProps {
  type: 'At';
  target: number;
  display: 'name';
}

export interface AtAllProps {
  type: 'AtAll';
  target: 0;
}

export interface VoiceCodeProps {
  type: 'Voice';
  base64: string | null;
  length: number | null;
  path: string | null;
  url: string | null;
  voiceId: string | null;
}

export interface MiraiCodeProps {
  type: 'MiraiCode';
  code: string;
}

export type MiraiMessageProps = PlainProps
  | FaceProps
  | DiceProps
  | ImageUrlProps
  | ImagePathProps
  | AtProps
  | AtAllProps
  | VoiceCodeProps
  | MiraiCodeProps;

/**
 * 发送文字
 * @param { string } text: 文字
 */
export function plain(text: string): PlainProps {
  return { type: 'Plain', text };
}

/**
 * 发送表情
 * @param { number } id: 表情ID
 * @param { string } name: 表情名称
 */
export function face(id: number, name?: string): FaceProps {
  return { type: 'Face', faceId: id, name };
}

/* 魔法表情 */
export function dice(value: number): DiceProps {
  return { type: 'Dice', value };
}

/**
 * 发送图片
 * @param { string } url: 图片地址或本地地址
 */
export function image(url: string): ImageUrlProps | ImagePathProps {
  if (/^https?:\/\//.test(url)) {
    return { type: 'Image', url };
  } else {
    return { type: 'Image', path: url };
  }
}

/**
 * 圈人
 * @param { number } target: QQ号
 */
export function at(target: number): AtProps {
  return { type: 'At', target, display: 'name' };
}

/* 圈所有成员 */
export function atAll(): AtAllProps {
  return { type: 'AtAll', target: 0 };
}

/* 语音 */
export function voice(url: string, seconds?: number): VoiceCodeProps {
  const isHttp: boolean = /^https?:\/\//.test(url);

  return {
    type: 'Voice',
    base64: null,
    length: seconds ?? null,
    path: isHttp ? null : url,
    url: isHttp ? url : null,
    voiceId: null
  };
}

export function miraiCode(code: string): MiraiCodeProps {
  return { type: 'MiraiCode', code };
}