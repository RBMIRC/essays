import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExternalLinks: QuartzComponent = () => {
  const visualizations = [
    { name: "The Double Helix", url: "/essays/static/bmc-helix/bmc-helix.html" },
    { name: "The Network", url: "/essays/static/bmc-network/bmc-verified-network.html" },
  ]

  const platforms = [
    { name: "The Dining Hall", url: "https://retconblackmountain.info/", desc: "Collaborative annotation and discussion platform for BMC archives" },
    { name: "The Library", url: "https://thelibrary.retconblackmountain.info/", desc: "Archive repository of annotated pdfs" },
    { name: "The Chronology", url: "https://rbmirc.github.io/bmc-chronology/", desc: "Interactive day-by-day timeline of BMC (1933-1957)" },
  ]

  return (
    <div class="external-links">
      <h3>Related</h3>
      <ul>
        {visualizations.map((link) => {
          const isStatic = link.url.includes('/static/')
          return (
            <li>
              <a
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
              >
                {link.name}
              </a>
            </li>
          )
        })}
      </ul>

      <h3 class="platforms-title">Related Platforms</h3>
      <ul class="platforms-list">
        {platforms.map((link) => (
          <li>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
            </a>
            <span class="platform-desc">{link.desc}</span>
          </li>
        ))}
      </ul>

      <div class="personal-link">
        <a href="https://www.couzinetjacques.com" target="_blank" rel="noopener noreferrer">🌱</a>
      </div>
    </div>
  )
}

ExternalLinks.css = `
.external-links {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--lightgray);
}

.external-links h3 {
  font-size: 0.75rem;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: var(--gray);
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.external-links .platforms-title {
  margin-top: 1rem;
}

.external-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.external-links li {
  margin-bottom: 0.3rem;
}

.external-links .platforms-list li {
  margin-bottom: 0.6rem;
}

.external-links a {
  font-size: 0.85rem;
  color: var(--darkgray);
  text-decoration: none;

  &:hover {
    color: var(--secondary);
  }
}

.external-links .platform-desc {
  display: block;
  font-size: 0.7rem;
  color: var(--gray);
  line-height: 1.4;
  margin-top: 0.1rem;
}

.external-links .personal-link {
  margin-top: 1rem;
  padding-top: 0.5rem;
  border-top: 1px solid var(--lightgray);
}
`

export default (() => ExternalLinks) satisfies QuartzComponentConstructor
