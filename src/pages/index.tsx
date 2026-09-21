import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Heading from '@theme/Heading';
import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/docs/intro">
            Guides
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/api/read/afribox-api">
            API reference
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  return (
    <Layout title="Afribox API" description="Afribox backend API documentation">
      <HomepageHeader />
      <main className="container margin-vert--lg">
        <div className="row">
          <div className="col col--6">
            <h2>Reference</h2>
            <p>
              Explore every endpoint with schemas generated from the backend source. The
              interactive console is enabled for read-only endpoints only.
            </p>
            <Link to="/docs/api/read/afribox-api">Interactive API (read-only) →</Link>
            <br />
            <Link to="/docs/api/write/afribox-api">Write operations (reference) →</Link>
          </div>
          <div className="col col--6">
            <h2>Guides</h2>
            <ul>
              <li>
                <Link to="/docs/authentication">Authentication</Link>
              </li>
              <li>
                <Link to="/docs/response-and-errors">Responses &amp; errors</Link>
              </li>
              <li>
                <Link to="/docs/guides/paystack-b2b">Paystack — B2B</Link>
              </li>
              <li>
                <Link to="/docs/guides/paystack-b2c">Paystack — B2C</Link>
              </li>
              <li>
                <Link to="/docs/guides/webhook">Paystack webhook</Link>
              </li>
            </ul>
          </div>
        </div>
      </main>
    </Layout>
  );
}
