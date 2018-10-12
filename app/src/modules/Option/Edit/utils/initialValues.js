/* 初始化的值 */
export const modianUrlTemplate: string = '摩点：{{ modianname }}\nhttps://m.modian.com/project/{{ modianid }}.html';

export const modianTemplate: string = '@{{ id }} 刚刚在【{{ modianname }}】打赏了{{ money }}元，'
  + '感谢这位聚聚！\n摩点项目地址：https://m.modian.com/project/{{ modianid }}.html\n'
  + '当前进度：￥{{ alreadyraised }} / ￥{{ goal }}\n'
  + '相差金额：￥{{ amountdifference }}\n'
  + '集资参与人数：{{ backercount }}人\n'
  + '项目截止时间：{{ endtime }}\n'
  + '距离项目截止还有：{{ timedifference }}';

export const welcomeNewGroupMember: string = '欢迎{{ nickname }}加入。';