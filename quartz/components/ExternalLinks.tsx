import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExternalLinks: QuartzComponent = () => {
  const links = [
    { name: "The Double Helix", url: "/essays/static/bmc-helix/bmc-helix.html" },
    { name: "The Network", url: "/essays/static/bmc-network/bmc-verified-network.html" },
    { name: "The Chronology", url: "https://rbmirc.github.io/bmc-chronology/" },
    { name: "The Dining Hall", url: "https://retconblackmountain.info/" },
    { name: "The Library", url: "https://thelibrary.retconblackmountain.info/" },
    { name: "🌱", url: "https://www.couzinetjacques.com" },
  ]

  return (
    <div class="external-links">
      <h3>Related</h3>
      <ul>
        {links.map((link) => {
          const isExternal = link.url.startsWith('http')
          const isStatic = link.url.includes('/static/')
          const openNewTab = isExternal || isStatic
          return (
            <li>
              <a
                href={link.url}
                target={openNewTab ? "_blank" : undefined}
                rel={openNewTab ? "noopener noreferrer" : undefined}
              >
                {link.name}
              </a>
            </li>
          )
        })}
      </ul>
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

.external-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.external-links li {
  margin-bottom: 0.3rem;
}

.external-links a {
  font-size: 0.85rem;
  color: var(--darkgray);
  text-decoration: none;

  &:hover {
    color: var(--secondary);
  }
}
`

export default (() => ExternalLinks) satisfies QuartzComponentConstructor
