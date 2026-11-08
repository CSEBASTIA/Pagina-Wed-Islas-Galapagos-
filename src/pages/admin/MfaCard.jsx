import React, { useState } from 'react';

// Pantalla del segundo paso: configurar la app de autenticación (la primera vez)
// o escribir el código de 6 dígitos (las siguientes).
export default function MfaCard({ email, mfa, busy, message, onStart, onVerify, onLogout }) {
  const [code, setCode] = useState('');
  const [copied, setCopied] = useState(false);
  const enrolling = mfa.step === 'enroll';
  const ready = !enrolling || Boolean(mfa.qr);

  async function copySecret() {
    try {
      await navigator.clipboard.writeText(mfa.secret);
      setCopied(true);
    } catch {
      setCopied(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    onVerify(code);
  }

  return <section className="login-card mfa-card">
    <p className="eyebrow">VERIFICACIÓN EN DOS PASOS</p>
    <h1>{enrolling ? 'Protege tu cuenta' : 'Escribe tu código'}</h1>

    {enrolling && !mfa.qr && <>
      <p>Para entrar al panel, la cuenta {email} necesita un segundo paso: un código que cambia cada 30 segundos en tu teléfono. Solo se configura una vez.</p>
      <ol className="mfa-steps">
        <li>Instala en tu teléfono <strong>Google Authenticator</strong>, <strong>Microsoft Authenticator</strong> u otra app de códigos.</li>
        <li>Pulsa el botón y escanea con la app el código QR que aparecerá.</li>
        <li>Escribe el código de 6 dígitos que te muestre la app.</li>
      </ol>
      <button type="button" className="button button--dark" disabled={busy} onClick={onStart}>{busy ? 'Preparando…' : 'Configurar ahora'}</button>
    </>}

    {enrolling && mfa.qr && <>
      <p>Escanea este código con tu app de autenticación. Si estás en el mismo teléfono, usa «Abrir en mi app» o copia la clave y pégala en la app.</p>
      <img className="mfa-qr" src={mfa.qr} alt="Código QR para la app de autenticación" />
      <div className="mfa-phone">
        {mfa.uri?.startsWith('otpauth://') && <a className="button button--dark" href={mfa.uri}>Abrir en mi app</a>}
        <button type="button" className="plain-button" onClick={copySecret}>{copied ? 'Clave copiada' : 'Copiar clave'}</button>
      </div>
      <p className="mfa-secret"><small>Clave manual</small><code>{mfa.secret}</code></p>
    </>}

    {!enrolling && <p>Abre tu app de autenticación y escribe el código de 6 dígitos de «Golden Ray I» para la cuenta {email}.</p>}

    {ready && <form onSubmit={submit}>
      <label htmlFor="mfa-code">Código de 6 dígitos</label>
      <input id="mfa-code" inputMode="numeric" autoComplete="one-time-code" maxLength="7" pattern="[0-9 ]{6,7}" autoFocus
        value={code} onChange={(event) => setCode(event.target.value)} required />
      <button className="button button--dark" disabled={busy} type="submit">{busy ? 'Verificando…' : enrolling ? 'Activar y entrar' : 'Verificar'}</button>
    </form>}

    {message}
    <button type="button" className="plain-button mfa-logout" onClick={onLogout}>Cerrar sesión</button>
  </section>;
}
