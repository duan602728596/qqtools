const token = '';
const chatroomId = '';

const room = Chatroom.getInstance({
  debug: true,
  appKey: el,
  account: token,
  token,
  chatroomId,
  chatroomAddresses: ['chatweblink01.netease.im:443'],
  onconnect(event) {
    console.log('Chatroom onconnect', event);
  },
  onmsgs(event) {
    console.log('Chatroom onmsgs', event);
    console.log('Chatroom onmsgs json', JSON.parse(event[0].custom));

  },
  onerror(event) {
    console.log('Chatroom onerror', event);
  },
  ondisconnect(event) {
    console.log('Chatroom ondisconnect', event);
  }
});

const getChatroomMembersBtn = document.getElementById('getChatroomMembersBtn');

function getChatroomMembers(guest) {
  return new Promise((resolve, reject) => {
    room.getChatroomMembers({
      guest,
      done(err, arg1, arg2) {
        resolve(arg1);
      }
    });
  });
}

function getChatroomMembersInfo(accounts) {
  return new Promise((resolve, reject) => {
    room.getChatroomMembersInfo({
      accounts,
      done(err, arg1, arg2) {
        resolve(arg1);
      }
    });
  });
}

getChatroomMembersBtn.addEventListener('click', async function(event) {
  const members = await getChatroomMembers(true);
  const members2 = await getChatroomMembers(false);

  console.log('getChatroomMembers', members, members2);

  const membersArr = members.members.map((o) => o.account);
  const info = await getChatroomMembersInfo(membersArr);

  console.log('getChatroomMembersInfo', info);
}, false);