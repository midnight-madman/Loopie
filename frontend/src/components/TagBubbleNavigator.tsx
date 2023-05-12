import { NewsCategoriesEnum } from '../const'
import { useRouter } from 'next/router'
import Link from 'next/link'
import clsx from 'clsx'
import { includes, map, take, values } from 'lodash'
import { getEmojiForCategory } from '../utils'

// Number of items to show in the nav bar, between 1 and length of NewsCategoriesEnum
const NAV_ITEM_COUNT = 5

function NavItem ({
  href,
  children
}: { href: string, children: any }) {
  const isActive = useRouter().asPath === href

  return (
    <li>
      <Link
        href={href}
        className={clsx(
          'relative block px-2 sm:px-3 py-1.5 sm:py-2 transition',
          isActive
            ? 'text-slate-900 dark:text-slate-900 font-bold'
            : 'text-slate-600 hover:text-slate-300 dark:hover:text-slate-300'
        )}
      >
        <span className="flex whitespace-nowrap">{children}</span>
        {isActive && (
          <span
            className="absolute inset-x-1 -bottom-px h-px bg-gradient-to-r from-pink-500/0  via-pink-500/40 to-pink-500/0 dark:from-slate-400/0 dark:via-slate-400/40 dark:to-slate-400/0"/>
        )}
      </Link>
    </li>
  )
}

export const TagBubbleNavigator = () => {
  const tagsWithCustomPage = [NewsCategoriesEnum.VIDEO, NewsCategoriesEnum.PODCAST]

  const getHrefForTag = (tag: NewsCategoriesEnum) => includes(tagsWithCustomPage, tag) ? `/${tag.toLowerCase()}` : `/news/${tag}`

  return <nav>
    <ul
      className="flex rounded-full bg-white/90 px-1 sm:px-3 text-sm font-medium text-slate-800 shadow-lg shadow-slate-800/5 ring-1 ring-slate-900/5 backdrop-blur dark:bg-slate-800/90 dark:text-slate-200 dark:ring-white/10">
      {map(take(values(NewsCategoriesEnum), NAV_ITEM_COUNT), (tag: NewsCategoriesEnum) =>
        <NavItem href={getHrefForTag(tag)} key={tag}>
          {tag} {getEmojiForCategory(tag)}
        </NavItem>
      )}
    </ul>
  </nav>
}
