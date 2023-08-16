import type { ReactElement } from 'react';
import License from './License';
import Software from './Software/Software';
import ButtonLink from '../../../components/ButtonLink/ButtonLink';

/* License and open source software */
function Credits(props: {}): ReactElement {
  return (
    <div className="p-[16px]">
      <header className="mb-[8px]">
        <ButtonLink linkProps={{ to: '/Agreement/Agreement' }} buttonProps={{ type: 'primary', danger: true }}>返回</ButtonLink>
      </header>
      <License />
      <Software />
    </div>
  );
}

export default Credits;