import { QuartzComponent, QuartzComponentConstructor } from "./types"

// Icons
const diningHallIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2"/><path d="M7 2v20"/><path d="M21 15V2v0a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Zm0 0v7"/></svg>`
const libraryIcon = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20"/></svg>`

const ExternalLinks: QuartzComponent = () => {
  const links = [
    { name: "Dining Hall", url: "https://retconblackmountain.info/", icon: diningHallIcon },
    { name: "Library", url: "https://thelibrary.retconblackmountain.info/", icon: libraryIcon },
  ]

  return (
    <div class="external-links-compact">
      {links.map((link) => (
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          title={link.name}
          dangerouslySetInnerHTML={{ __html: link.icon }}
        />
      ))}
    </div>
  )
}

ExternalLinks.css = `
.external-links-compact {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.external-links-compact a {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.4rem;
  color: var(--darkgray);
  background: transparent;
  border-radius: 4px;
  transition: color 0.2s ease, background 0.2s ease;
}

.external-links-compact a:hover {
  color: var(--dark);
  background: var(--lightgray);
}

.external-links-compact svg {
  width: 18px;
  height: 18px;
}

/* Dark mode */
:root[saved-theme="dark"] .external-links-compact a:hover {
  background: var(--lightgray);
}
`

export default (() => ExternalLinks) satisfies QuartzComponentConstructor
