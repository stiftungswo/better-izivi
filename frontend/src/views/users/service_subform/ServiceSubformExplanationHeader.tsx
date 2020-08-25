import * as React from 'react';
import { FormattedMessage } from 'react-intl';

export const ServiceSubformExplanationHeader = () => (
  <>
    <h3>
      <FormattedMessage
        id="views.users.serviceSubformExplanationHeader.service_planning"
        defaultMessage="Einsatzplanung"
      />
    </h3>
    <p>
      <FormattedMessage
        id="views.users.serviceSubformExplanationHeader.info1"
        defaultMessage="Um eine Einsatzplanung zu erfassen, klicke unten auf 'Neue Einsatzplanung hinzufügen', wähle ein Pflichtenheft aus und trage Start- und Enddatum ein."
      />
      <br />
      <FormattedMessage
        id="views.users.serviceSubformExplanationHeader.info2"
        defaultMessage="Klicke nach dem Erstellen der Einsatzplanung auf 'Drucken', um ein PDF zu generieren. Dieses kannst du dann an den Einsatzbetrieb schicken."
      />
    </p>
    <p>
      <b>
        <FormattedMessage
          id="views.users.serviceSubformExplanationHeader.note"
          defaultMessage="Beachte"
        />
  : </b>
      <FormattedMessage
        id="views.users.serviceSubformExplanationHeader.info3"
        defaultMessage="Zivi-Einsätze im Naturschutz müssen an einem Montag beginnen und an einem Freitag enden, ausser es handelt sich um
      deinen letzten Zivi Einsatz und du leistest nur noch die verbleibenden Resttage."
      />
    </p>
  </>
);
