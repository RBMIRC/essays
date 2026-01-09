import { QuartzComponent, QuartzComponentConstructor, QuartzComponentProps } from "./types"

interface NewsItem {
  date: string
  text: string
  link?: string
}

interface Options {
  title?: string
  titleFr?: string
  limit?: number
}

const defaultOptions: Options = {
  title: "News",
  titleFr: "Actualites",
  limit: 3,
}

export default ((userOpts?: Partial<Options>) => {
  const opts = { ...defaultOptions, ...userOpts }

  const News: QuartzComponent = ({ fileData }: QuartzComponentProps) => {
    // News items - edit this array to update news
    const newsItems: NewsItem[] = [
      {
        date: "2025-01-09",
        text: "Nouvel essai: Retcon Black Mountain",
        link: "/en/black-mountain-college/retcon-black-mountain",
      },
      {
        date: "2025-01-05",
        text: "Mise a jour du Lexicon",
        link: "/en/lexicon",
      },
    ]

    const lang = fileData.frontmatter?.lang || "en"
    const title = lang === "fr" ? opts.titleFr : opts.title
    const displayItems = newsItems.slice(0, opts.limit)

    if (displayItems.length === 0) {
      return null
    }

    return (
      <div class="sidebar-news">
        <h3>{title}</h3>
        <ul>
          {displayItems.map((item) => (
            <li>
              <span class="news-date">{item.date}</span>
              {item.link ? (
                <a href={item.link} class="news-text">
                  {item.text}
                </a>
              ) : (
                <span class="news-text">{item.text}</span>
              )}
            </li>
          ))}
        </ul>
      </div>
    )
  }

  News.css = `
.sidebar-news {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--lightgray);
}

.sidebar-news h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.sidebar-news ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-news li {
  margin-bottom: 0.6rem;
}

.sidebar-news .news-date {
  display: block;
  font-size: 0.7rem;
  color: var(--gray);
  margin-bottom: 0.1rem;
}

.sidebar-news .news-text {
  font-size: 0.8rem;
  color: var(--darkgray);
  text-decoration: none;
  line-height: 1.3;
}

.sidebar-news a.news-text:hover {
  color: var(--secondary);
}
`

  return News
}) satisfies QuartzComponentConstructor
