/* 获取等级对应的积分 */
function getLevelPoint(cards) {
  const levelPoint = {};

  for (const card of cards) {
    levelPoint[card.level] = card.point || 0;
  }

  return levelPoint;
}

export default getLevelPoint;