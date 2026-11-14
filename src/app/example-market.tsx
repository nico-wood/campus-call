"use client";

import { useEffect, useRef, useState } from "react";
import type { ExampleForecast } from "./example-forecasts";
import { ForecastIcon } from "./forecast-icon";
import { ForecastChart } from "./forecast-chart";
import { ExampleConfirmButton } from "./example-confirm-button";

export function ExampleMarket({ example }: { example: ExampleForecast }) {
  const [selected, setSelected] = useState(example.outcomes[0].id);
  const [amount, setAmount] = useState("25");
  const panel = useRef<HTMLElement>(null);
  useEffect(() => {
    const element = panel.current;
    const header = document.querySelector<HTMLElement>(".topbar");
    if (!element || !header) return;
    function updateScrollMode() {
      if (!element || !header) return;
      const headerPinned = getComputedStyle(header).position === "sticky";
      const inset = headerPinned ? header.getBoundingClientRect().height + 16 : 16;
      element.style.setProperty("--ticket-top", `${inset}px`);
      // The enclosing forecast section bounds the sticky panel before related examples.
      element.dataset.scrollMode = headerPinned ? "sticky" : "flow";
    }
    const observer = new ResizeObserver(updateScrollMode);
    observer.observe(element);
    observer.observe(header);
    window.addEventListener("resize", updateScrollMode);
    updateScrollMode();
    return () => { observer.disconnect(); window.removeEventListener("resize", updateScrollMode); };
  }, []);
  const outcome = example.outcomes.find(item => item.id === selected) ?? example.outcomes[0];
  return (
    <div className="example-market-content">
      <div className="example-overview">
        <div className="event-heading-meta"><span className="card-category"><ForecastIcon category={example.category} />{example.category}</span><span className="example-label">Example</span></div>
        <h1 className="event-question">{example.question}</h1>
        <p className="forecast-close">Closes {example.closeLabel}</p>
        <section className="market-history" aria-label="Market probability">
          <div className="market-history-heading"><h2>Market probability</h2><span>Example snapshot</span></div>
          <ForecastChart example={example} />
        </section>
        <div className="market-outcome-list" aria-label="Choose an outcome">
          {example.outcomes.map(item => <button key={item.id} type="button" className="market-outcome-row" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span className="selection-indicator" aria-hidden="true" /><span>{item.label}</span><strong>{item.percent}%</strong><span className="outcome-row-action">{selected === item.id ? "Selected" : "Select"}</span></button>)}
        </div>
        <p className="written-note">We wrote this example. It is not a live forecast.</p>
      </div>
      <div className="example-ticket-column">
      <aside ref={panel} id="example-ticket" className="example-ticket position-widget" tabIndex={-1} aria-labelledby="example-ticket-title">
        <div className="position-widget-heading"><h2 id="example-ticket-title">Your position</h2><span className="position-widget-icon" aria-hidden="true">↗</span></div>
        <p className="position-question">{example.question}</p>
        <div className="position-choices" aria-label="Position outcome">
          {example.outcomes.map(item => <button key={item.id} type="button" aria-pressed={selected === item.id} onClick={() => setSelected(item.id)}><span>{item.label}</span><strong>{item.percent}%</strong></button>)}
        </div>
        <label className="position-amount" htmlFor="position-amount"><span>Virtual credits</span><input id="position-amount" type="text" inputMode="numeric" value={amount} onChange={event => setAmount(event.target.value.replace(/[^0-9]/g, "").slice(0, 7))} /></label>
        <div className="quick-amounts" aria-label="Choose virtual credits">{[25, 50, 100].map(value => <button key={value} type="button" onClick={() => setAmount(String(value))}>{value}</button>)}</div>
        <div className="position-selection"><span>Selected outcome</span><strong>{outcome.label}</strong></div>
        <ExampleConfirmButton key={selected} />
      </aside>
      </div>
    </div>
  );
}
