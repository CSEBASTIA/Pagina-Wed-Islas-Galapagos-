import assert from 'node:assert/strict';
import { test } from 'node:test';
import { departureTitle, matchTour, parseTurnos, resolveStops, splitStops } from './turnos.js';

const tours = [{ id: 'punta-cormorant', title: 'Punta Cormorant' }, { id: 'los-tuneles', title: 'Los Túneles' }];

test('lee cada fecha de la lista pegada como una sola salida con sus tours', () => {
  const { turnos, unread } = parseTurnos('4 de diciembre \nCormorant. Tuneles. Finado \n9 de diciembre \nCaleta iguana. Tuneles. Finado', '2026-11-12');
  assert.deepEqual(unread, []);
  assert.deepEqual(turnos, [
    { date: '2026-12-04', names: ['Cormorant', 'Tuneles', 'Finado'] },
    { date: '2026-12-09', names: ['Caleta iguana', 'Tuneles', 'Finado'] },
  ]);
});

test('pasa al año siguiente las fechas que ya pasaron y respeta el año escrito', () => {
  assert.equal(parseTurnos('5 de enero\nTuneles', '2026-11-12').turnos[0].date, '2027-01-05');
  assert.equal(parseTurnos('12 de noviembre\nTuneles', '2026-11-12').turnos[0].date, '2026-11-12');
  assert.equal(parseTurnos('3 de marzo de 2028\nTuneles', '2026-11-12').turnos[0].date, '2028-03-03');
  assert.equal(parseTurnos('18 dic\nTuneles', '2026-11-12').turnos[0].date, '2026-12-18');
});

test('avisa de las líneas que no entiende', () => {
  const { turnos, unread } = parseTurnos('Tuneles\n31 de febrero\nCormorant\n4 de diciembre\nTuneles', '2026-11-12');
  assert.deepEqual(unread, ['Tuneles', '31 de febrero', 'Cormorant']);
  assert.deepEqual(turnos, [{ date: '2026-12-04', names: ['Tuneles'] }]);
});

test('reconoce el tour aunque el nombre venga abreviado o sin tildes', () => {
  assert.equal(matchTour('Cormorant', tours).id, 'punta-cormorant');
  assert.equal(matchTour('tuneles', tours).id, 'los-tuneles');
  assert.equal(matchTour('Finado', tours), null);
  const renamed = [{ id: 'punta-cormorant', title: 'Playa de los Cormoranes' }, { id: 'el-finado', title: 'El Finado' }, { id: 'caleta-iguana', title: 'Caleta Iguana' }];
  assert.equal(matchTour('Cormorant', renamed).id, 'punta-cormorant');
  assert.equal(matchTour('Caleta iguana', renamed).id, 'caleta-iguana');
  assert.equal(matchTour('Finado', renamed).id, 'el-finado');
  assert.equal(matchTour('Tintoreras', renamed), null);
});

test('arma una salida de varios tours o de uno solo', () => {
  assert.deepEqual(resolveStops(splitStops('Caleta iguana. Tuneles. Finado. tuneles'), tours), {
    tourId: 'los-tuneles', stops: ['Caleta iguana', 'Los Túneles', 'Finado'],
    title: 'Caleta iguana · Los Túneles · Finado', unknown: ['Caleta iguana', 'Finado'],
  });
  assert.deepEqual(resolveStops(['Cormorant'], tours), { tourId: 'punta-cormorant', stops: [], title: 'Punta Cormorant', unknown: [] });
  assert.equal(resolveStops(['Finado'], tours).tourId, '');
});

test('titula la salida con todos sus tours', () => {
  assert.equal(departureTitle({ tourId: 'los-tuneles', stops: ['Punta Cormorant', 'Los Túneles'] }, tours), 'Punta Cormorant · Los Túneles');
  assert.equal(departureTitle({ tourId: 'los-tuneles', stops: [] }, tours), 'Los Túneles');
  assert.equal(departureTitle({ tourId: 'x', stops: [] }, tours), 'Tour eliminado');
});
