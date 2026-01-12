import { QuartzComponent, QuartzComponentConstructor } from "./types"

const ExternalLinks: QuartzComponent = () => {
  const links = [
    { name: "The Double Helix", url: "/essays/static/bmc-helix/bmc-helix.html", desc: "3D temporal visualization of BMC events and climate data" },
    { name: "The Network", url: "/essays/static/bmc-network/bmc-verified-network.html", desc: "Interactive network graph of BMC people connections" },
    { name: "The Chronology", url: "https://rbmirc.github.io/bmc-chronology/", desc: "Interactive day-by-day timeline of BMC (1933-1957)" },
    { name: "The Dining Hall", url: "https://retconblackmountain.info/", desc: "Collaborative annotation and discussion platform for BMC archives" },
    { name: "The Library", url: "https://thelibrary.retconblackmountain.info/", desc: "Archive repository of annotated pdfs" },
  ]

  return (
    <div class="external-links">
      <h3>Related</h3>
      <ul class="links-list">
        {links.map((link) => (
          <li>
            <a
              href={link.url}
              target="_blank"
              rel="noopener noreferrer"
            >
              {link.name}
            </a>
            <span class="link-desc">{link.desc}</span>
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

.external-links ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.external-links .links-list li {
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

.external-links .link-desc {
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
