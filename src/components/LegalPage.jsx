import React from 'react';
import { Link, usePageTitle } from '../router.jsx';
import { PageHero } from './Layout.jsx';

// Página legal con índice lateral. Cada párrafo de una sección puede ser texto,
// JSX o { rows: [[dato, plazo], ...], head: [..] } para mostrar una tabla.
export default function LegalPage({ title, lead, path, prefix, updated, sections }) {
  usePageTitle(title);
  return <>
    <PageHero eyebrow="INFORMACIÓN LEGAL" title={title} lead={lead} />
    <section className="terms-section section">
      <div className="container terms__grid">
        <nav className="terms__toc" aria-label="Contenido">
          <p className="eyebrow">CONTENIDO</p>
          <ol>{sections.map((section) => <li key={section.id}><Link to={`${path}#${prefix}-${section.id}`}>{section.title}</Link></li>)}</ol>
        </nav>
        <article className="terms__body">
          <p className="terms__updated">Última actualización: {updated}</p>
          {sections.map((section, index) => <section id={`${prefix}-${section.id}`} key={section.id}>
            <h2><span>{String(index + 1).padStart(2, '0')}</span>{section.title}</h2>
            {section.body.map((item, itemIndex) => (item?.rows
              ? <div className="terms__table" key={itemIndex}><table>
                <thead><tr>{item.head.map((cell) => <th scope="col" key={cell}>{cell}</th>)}</tr></thead>
                <tbody>{item.rows.map(([first, second]) => <tr key={first}><th scope="row">{first}</th><td>{second}</td></tr>)}</tbody>
              </table></div>
              : <p key={itemIndex}>{item}</p>))}
          </section>)}
        </article>
      </div>
    </section>
  </>;
}
