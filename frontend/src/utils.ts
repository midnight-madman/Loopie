import { NewsCategoriesEnum } from './const'

export const getEmojiForCategory = (category: NewsCategoriesEnum) => {
  switch (category) {
    case NewsCategoriesEnum.AI:
      return '🤖'
    case NewsCategoriesEnum.DAO:
      return '🏛️'
    case NewsCategoriesEnum.NFT:
      return '🖼️'
    case NewsCategoriesEnum.BITCOIN:
      return '₿'
    case NewsCategoriesEnum.VIDEO:
      return '📺'
    case NewsCategoriesEnum.PODCAST:
      return '🎙'
    case NewsCategoriesEnum.ZK:
      return '🧲'
    default:
      return '📰'
  }
}
