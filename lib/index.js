const fs = require('fs');
const axios = require('axios');
const friends = require('./friends');

const token = '';

function sleep(num){
  return new Promise((resolve, reject)=>{
    setTimeout(()=>{
      resolve();
    }, num);
  });
}

function writeFile(data){
  return new Promise((resolve, reject)=>{
    fs.writeFile('./infor.txt', data, {
      flag: 'a'
    }, (err)=>{
      if(err){
        reject(err);
      }else{
        resolve();
      }
    });
  });
}

(async function(){
  try{
    const result = [];

    for(let i = 0; i < friends.length; i++){
      const item = {};
      item.memberId = friends[i];

      const { data } = await axios({
        url: 'https://puser.48.cn/usersystem/api/user/member/v1/fans/room',
        method: 'POST',
        headers: {
          os: 'android',
          IMEI: 864394020888895,
          version: '5.0.0',
          Connection: 'Keep-Alive',
          'Content-Type': 'application/json'
        },
        data: {
          'memberId': friends[i]
        }
      });

      if(data && 'content' in data && 'roomInfo' in data.content){
        const { roomInfo } = data.content;
        item.roomId = roomInfo.roomId;
        item.memberName = roomInfo.memberName;
        result.push(item);

        let txt = `memberName: ${ item.memberName }\n`
                + `memberId  : ${ item.memberId }\n`
                + `roomId    : ${ item.roomId }\n\n`;
        
        await writeFile(txt);
      }

      await sleep(7000);
    }
  }catch(err){
    console.error(err);
  }
  
})();