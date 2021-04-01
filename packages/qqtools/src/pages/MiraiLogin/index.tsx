import type { ReactElement } from 'react';
import style from './index.sass';
import Header from './Header/Header';
import LoginModal from './LoginModal';

/* 启动mirai */
function Index(props: {}): ReactElement {
  return (
    <div className={ style.content }>
      <Header />
      <LoginModal />
    </div>
  );
}

export default Index;