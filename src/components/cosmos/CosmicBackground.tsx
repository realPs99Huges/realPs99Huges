import { Starfield } from './Starfield';
import './CosmicBackground.css';

/** Fixed, layered sky: nebula washes, canvas starfield, pointer light and film grain. */
export function CosmicBackground() {
  return (
    <div className="cosmos" aria-hidden="true">
      <div className="cosmos__nebula cosmos__nebula--violet" />
      <div className="cosmos__nebula cosmos__nebula--blue" />
      <div className="cosmos__nebula cosmos__nebula--gold" />
      <Starfield />
      <div className="cosmos__light" />
      <div className="cosmos__vignette" />
      <div className="cosmos__grain" />
    </div>
  );
}
