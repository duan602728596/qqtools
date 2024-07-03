export interface NoteItem {
  id: string;
  noteCard: {
    type: 'normal' | 'video';
    noteId: string;
    cover: {
      urlDefault: string;
      urlPre: string;
    };
    displayTitle: string;
    user: {
      avatar: string;
      nickName: string;
      nickname: string;
      userId: string;
    };
    xsec_token: string;
  };
}

export interface XiaohongshuInitialState {
  user: {
    notes: Array<Array<NoteItem>>;
  };
}

/* 解析小红书的html并获取window.__INITIAL_STATE__的值 */
export function parseHtml(html: string): XiaohongshuInitialState | undefined {
  const parseDocument: Document = new DOMParser().parseFromString(html, 'text/html');
  const scripts: NodeListOf<HTMLScriptElement> = parseDocument.querySelectorAll('script');
  let initialState: XiaohongshuInitialState | undefined = undefined;

  for (const script of scripts) {
    const scriptStr: string = script.innerHTML;

    if (/^window\._{2}INITIAL_STATE_{2}\s*=\s*.+$/.test(scriptStr)) {
      const str: string = scriptStr
        .replace(/window\._{2}INITIAL_STATE_{2}\s*=\s*/, ''); // 剔除"="前面的字符串

      // eslint-disable-next-line no-eval
      initialState = eval(`(${ str })`);
      break;
    }
  }

  return initialState;
}