import { notification } from 'antd';
import packageJson from '../../../package.json';
const request: Function = global.require('request');

/* 软件升级检测 */
const { version }: { version: string } = packageJson;
const uri: string = 'https://raw.githubusercontent.com/duan602728596/qqtools/master/app/package.json';
const isUpgradeReminder: string = localStorage.getItem('upgradeReminder');

function update(): void{
  request({ uri }, function(err: Error, response: Object, body: string): void{
    const newPackageJson: Object = JSON.parse(body);

    if(version !== newPackageJson.version){
      notification.warn({
        message: '软件版本已更新',
        description: (
          <div>
            <p>当前版本：{ version }</p>
            <p>最新版本：{ newPackageJson.version }</p>
          </div>
        )
      });
    }
  });
}

if(isUpgradeReminder === 'true' || !isUpgradeReminder) update();