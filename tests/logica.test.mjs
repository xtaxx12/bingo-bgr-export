// Pruebas de la lógica pura del sorteo. Lee el bloque <script id="bingo-logic"> de index.html,
// así se prueba exactamente el código que corre en el navegador. Ejecutar: npm test
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';

const html = readFileSync(new URL('../index.html', import.meta.url), 'utf8');
const bloque = html.match(/<script id="bingo-logic">([\s\S]*?)<\/script>/);
assert.ok(bloque, 'index.html debe contener <script id="bingo-logic">');
const contexto = { module: { exports: {} } };
vm.createContext(contexto);
vm.runInContext(bloque[1], contexto);
const B = contexto.module.exports;

// Los arrays creados dentro del vm pertenecen a otro "realm": se copian para compararlos.
const plano = x => JSON.parse(JSON.stringify(x));
const nuevo = () => ({ orden: [], tiempos: [], ganadores: [] });
const secuencia = valores => { let i = 0; return () => valores[i++ % valores.length]; };

test('cada número pertenece a su letra y rango', () => {
  for (let n = 1; n <= 75; n++) {
    const L = B.letraDe(n);
    const [min, max] = B.RANGOS[L];
    assert.ok(n >= min && n <= max, `${n} debería estar en ${L} (${min}-${max})`);
  }
  assert.deepEqual(plano(B.RANGOS), { B: [1, 15], I: [16, 30], N: [31, 45], G: [46, 60], O: [61, 75] });
});

test('parseEntrada acepta los formatos del operador', () => {
  for (const t of ['34', 'N34', 'n34', 'N-34', 'N 34', '  n - 34 ']) {
    assert.deepEqual(plano(B.parseEntrada(t)), { num: 34, letra: 'N' }, t);
  }
});

test('parseEntrada rechaza fuera de rango, letra equivocada y texto libre', () => {
  for (const t of ['', '0', '76', '120', 'B20', 'O3', 'X5', 'treinta', '3.5']) {
    assert.ok(B.parseEntrada(t).error, `"${t}" debería dar error`);
  }
});

test('registrar no duplica y mantiene la hora en paralelo', () => {
  const e = nuevo();
  assert.equal(B.registrar(e, 'N34', 1000).ok, true);
  const dup = B.registrar(e, '34', 2000);
  assert.equal(dup.ok, false);
  assert.match(dup.error, /ya fue cantada/);
  assert.deepEqual(plano(e.orden), [34]);
  assert.deepEqual(plano(e.tiempos), [1000]);
});

test('sortear saca las 75 bolas sin repetir y luego se niega', () => {
  const e = nuevo();
  const vistos = new Set();
  for (let i = 0; i < 75; i++) {
    const r = B.sortear(e, Math.random, i);
    assert.equal(r.ok, true);
    assert.equal(r.letra, B.letraDe(r.num));
    assert.ok(!vistos.has(r.num), `${r.num} salió dos veces`);
    vistos.add(r.num);
  }
  assert.equal(vistos.size, 75);
  assert.equal(e.tiempos.length, 75);
  const fin = B.sortear(e, Math.random);
  assert.equal(fin.ok, false);
  assert.equal(e.orden.length, 75);
});

test('sortear solo elige entre las pendientes, incluso con azar en los extremos', () => {
  const e = nuevo();
  for (let n = 1; n <= 74; n++) B.registrar(e, String(n));
  assert.deepEqual(plano(B.pendientes(e)), [75]);
  assert.equal(B.sortear(e, () => 0.9999999).num, 75);
  const e2 = nuevo();
  B.registrar(e2, '1');
  assert.equal(B.sortear(e2, () => 0).num, 2);
  // Un generador defectuoso (NaN, 1, negativo) no rompe el sorteo ni repite
  const e3 = nuevo();
  const r = [NaN, 1, -0.5].map(x => B.sortear(e3, () => x).num);
  assert.equal(new Set(r).size, 3);
});

test('sortear reparte de forma uniforme entre las pendientes', () => {
  const e = nuevo();
  for (let n = 1; n <= 70; n++) B.registrar(e, String(n)); // quedan 71..75
  const conteo = {};
  const azar = secuencia([0, 0.2, 0.4, 0.6, 0.8]);
  for (let i = 0; i < 5; i++) {
    const copia = { orden: e.orden.slice(), tiempos: e.tiempos.slice() };
    const n = B.sortear(copia, azar).num;
    conteo[n] = (conteo[n] || 0) + 1;
  }
  assert.deepEqual(Object.keys(conteo).map(Number).sort((a, b) => a - b), [71, 72, 73, 74, 75]);
});

test('deshacer revierte exactamente la última extracción', () => {
  const e = nuevo();
  B.registrar(e, '5', 10); B.registrar(e, '20', 20); B.registrar(e, '61', 30);
  assert.equal(B.deshacer(e), 61);
  assert.deepEqual(plano(e.orden), [5, 20]);
  assert.deepEqual(plano(e.tiempos), [10, 20]);
  assert.equal(B.deshacer(e), 20);
  assert.equal(B.deshacer(e), 5);
  assert.equal(B.deshacer(e), null);
  assert.deepEqual(plano(e), { orden: [], tiempos: [], ganadores: [] });
});

test('quitar un número intermedio conserva la hora de los demás', () => {
  const e = nuevo();
  B.registrar(e, '5', 10); B.registrar(e, '20', 20); B.registrar(e, '61', 30);
  assert.equal(B.quitar(e, 20), true);
  assert.equal(B.quitar(e, 20), false);
  assert.deepEqual(plano(e.orden), [5, 61]);
  assert.deepEqual(plano(e.tiempos), [10, 30]);
});

test('progreso y estado de la partida', () => {
  const e = nuevo();
  assert.equal(B.estadoPartida(e), 'sin-iniciar');
  for (let n = 1; n <= 12; n++) B.registrar(e, String(n));
  assert.deepEqual(plano(B.progreso(e)), { cantadas: 12, restantes: 63, porcentaje: 16 });
  assert.equal(B.estadoPartida(e), 'en-curso');
  e.ganadores.push({ ts: 1, bolas: 12 });
  assert.equal(B.estadoPartida(e), 'ganador');
  const lleno = nuevo();
  for (let n = 1; n <= 75; n++) B.registrar(lleno, String(n));
  assert.equal(B.estadoPartida(lleno), 'completa');
});

test('validarGuardado rechaza datos corruptos', () => {
  for (const d of [null, 'x', {}, { orden: 'x' }, { orden: [1, 1] }, { orden: [0] }, { orden: [76] }, { orden: [2.5] }, { orden: ['3'] }]) {
    assert.equal(B.validarGuardado(d), null, JSON.stringify(d));
  }
});

test('validarGuardado recupera datos antiguos y normaliza preferencias', () => {
  const v = plano(B.validarGuardado({ ronda: 3, orden: [7, 22, 41], prefs: { voz: false, volumen: 140, intensidad: 'loca', tema: 'contraste' } }));
  assert.equal(v.ronda, 3);
  assert.deepEqual(v.orden, [7, 22, 41]);
  assert.deepEqual(v.tiempos, [null, null, null]);
  assert.deepEqual(v.ganadores, []);
  assert.equal(v.prefs.voz, false);
  assert.equal(v.prefs.volumen, 90);
  assert.equal(v.prefs.intensidad, 'alta');
  assert.equal(v.prefs.tema, 'contraste');
  assert.equal(v.prefs.logoTV, true);
  assert.equal(v.prefs.vistaTablero, 'estandar');
  assert.equal(v.prefs.modo, 'operador');
  const g = plano(B.validarGuardado({ orden: [1], tiempos: [123], ganadores: [{ ts: 5, bolas: 1 }, { ts: 'x' }, { bolas: 99, ts: 1 }] }));
  assert.deepEqual(g.tiempos, [123]);
  assert.deepEqual(g.ganadores, [{ ts: 5, bolas: 1 }]);
});

test('números en palabras para la voz', () => {
  const casos = { 1: 'uno', 10: 'diez', 15: 'quince', 16: 'dieciseis', 21: 'veintiuno', 30: 'treinta', 34: 'treinta y cuatro', 60: 'sesenta', 75: 'setenta y cinco' };
  for (const [n, txt] of Object.entries(casos)) assert.equal(B.numeroEnPalabras(Number(n)), txt);
});
