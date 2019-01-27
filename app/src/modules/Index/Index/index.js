/* 软件首页 */
import React, { useState } from 'react';
import { Icon, Switch } from 'antd';
import style from './style.sass';
import '../../../components/indexedDB/indexedDB-init';
import { handleOpenBrowser } from '../../../utils';
import Navs from './Navs';

function Index(props: Object): React.Element{
  const upgradeReminder: string = localStorage.getItem('upgradeReminder');
  const [isUpgradeReminder, setUpgradeReminder]: [boolean, Function] = useState(
    upgradeReminder === 'true' || !upgradeReminder
  );

  // 状态变化
  function handleUpgradeReminderChange(event: Event): void{
    localStorage.setItem('upgradeReminder', String(!isUpgradeReminder));

    setUpgradeReminder(!isUpgradeReminder);
  }

  return (
    <div className={ style.body }>
      <h1 className={ style.title }>QQ群工具</h1>
      <p className={ style.text }>
        本软件遵循
        <b>GNU General Public License v3.0</b>
        许可证，非商用，如有问题请发送到邮箱duanhaochen@126.com。
      </p>
      <p className={ style.text }>
        源代码托管地址：
        <Icon type="github" theme="filled" />
        <a className={ style.url }
          onClick={ handleOpenBrowser.bind(this, 'https://github.com/duan602728596/qqtools') }
        >
          https://github.com/duan602728596/qqtools
        </a>
        。
      </p>
      <p className={ style.text }>
        酷Q下载地址：
        <Icon type="qq" theme="outlined" />
        <a className={ style.url }
          onClick={ handleOpenBrowser.bind(this, 'https://cqp.cc/') }
        >
          https://cqp.cc/
        </a>
        。
      </p>
      <p className={ style.text }>
        coolq-http-api：
        <Icon type="build" theme="filled" />
        <a className={ style.url }
          onClick={ handleOpenBrowser.bind(this, 'https://github.com/richardchien/coolq-http-api/releases') }
        >
          https://github.com/richardchien/coolq-http-api/releases
        </a>
        。
      </p>
      <div className={ style.update }>
        <Switch checked={ isUpgradeReminder } onChange={ handleUpgradeReminderChange } />
        <label className={ style.updateLabel }>软件升级提醒</label>
      </div>
      <Navs />
    </div>
  );
}

export default Index;