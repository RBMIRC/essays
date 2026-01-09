import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExternalLinks: QuartzComponent = () => {
  const links = [
    { name: "The Dining Hall", url: "https://retconblackmountain.info/" },
    { name: "The Library", url: "https://thelibrary.retconblackmountain.info/" },
  ]

  return (
    <div class="external-links">
      <h3>Related</h3>
      <ul>
        {links.map((link) => (
          <li>
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              {link.name}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

ExternalLinks.css = `
.external-links {
  margin-top: 1.5rem;
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
