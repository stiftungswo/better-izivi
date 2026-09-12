import { observer } from 'mobx-react';
import * as React from 'react';
import * as ReactDOM from 'react-dom';

/*
 * Regression test for a CodeRabbit finding on PR #600 (ticket MAN541), which we determined
 * was a false positive: it claimed ServiceOverview's getNrWeeks() -> calculateServiceRows()
 * sequence in loadServices() (both called synchronously, one after another, inside a
 * Promise.then()) could read a stale `totalWeeks` because `setState` is "asynchronous", so a
 * 53-week year could render with only 52 weeks.
 *
 * That assumes React batches setState calls made outside a React-managed event handler, which
 * is only true from React 18's automatic batching onward. This app is on react ^16.8.4, and the
 * real call site is a native Promise callback (serviceStore.fetchByYear(...).then(...)), not a
 * React event handler - exactly the case where pre-18 React applies setState *synchronously*.
 *
 * This test pins that assumption down directly (mirroring the real class's @observer decorator,
 * since mobx-react could in principle alter batching) rather than asserting it via ServiceOverview
 * itself, which would require mocking its full store dependencies. If this app ever upgrades
 * React (or something else changes this), this test fails and the getNrWeeks/calculateServiceRows
 * ordering in ServiceOverview.tsx needs a real fix, not just a rejected finding.
 */

@observer
class SetStateOrderingProbe extends React.Component<{}, { value: string }> {
  valueImmediatelyAfterSetState: string | null = null;

  constructor(props: {}) {
    super(props);
    this.state = { value: 'initial' };
  }

  setValue(): void {
    this.setState({ value: 'updated' });
  }

  captureValueImmediatelyAfter(): void {
    // Mirrors calculateServiceRows() running on the very next line after getNrWeeks(),
    // both inside the same Promise.then() callback with no await/setState-callback between them.
    this.valueImmediatelyAfterSetState = this.state.value;
  }

  render() {
    return null;
  }
}

it('applies setState synchronously when called from a Promise.then() callback (not a React event handler)', async () => {
  const div = document.createElement('div');
  let probe: SetStateOrderingProbe | null = null;

  ReactDOM.render(
    React.createElement(SetStateOrderingProbe, {
      ref: (instance: SetStateOrderingProbe | null) => {
        probe = instance;
      },
    }),
    div,
  );

  await Promise.resolve().then(() => {
    probe!.setValue();
    probe!.captureValueImmediatelyAfter();
  });

  expect(probe!.valueImmediatelyAfterSetState).toBe('updated');

  ReactDOM.unmountComponentAtNode(div);
});
