import { isLikelyContactSpam } from '@/lib/contact/spam';

test.each([
  'Quiero información sobre cursos y costos.',
  'Este es nuestro primer mensaje. Les deseamos mucho éxito en la asociación.',
  '¿Me ayudan con el acceso? https://example.com/curso',
  'Ganamos un premio educativo. Esta es la convocatoria https://example.com/premio',
  'Solicito un curso de seguridad para identificar ganancias garantizadas y fraudes.',
  'Material de referencia: https://example.com/uno https://example.com/dos https://example.com/tres https://example.com/cuatro',
])('keeps ordinary or educational content in the inbox: %s', message => {
  expect(isLikelyContactSpam({ subject: 'Consulta', message })).toBe(false);
});
test.each([
  'Ganaste un premio. Reclama ahora, haz clic https://example.com/prize',
  'Guaranteed profits! Click now https://example.com/get-rich',
  'https://one.example/a https://two.example/b https://three.example/c https://four.example/d',
  Array(6).fill('https://example.com/buy').join(' '),
])('flags suspicious content: %s', message => {
  expect(isLikelyContactSpam({ subject: 'Promoción', message })).toBe(true);
});
test('does not interpret malformed links alone as spam', () => {
  expect(isLikelyContactSpam({ subject: 'Ayuda', message: 'La liga https:// no funciona' })).toBe(false);
});
