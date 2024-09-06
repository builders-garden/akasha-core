import { useState } from 'react';
import React from 'react';
import { init } from '@akashaorg/core-sdk';

const akashaSdk = init();
console.log('connecting to Lit');
await akashaSdk.services.common.lit.connect();
console.log('connected to Lit');
await akashaSdk.services.common.lit.createSession();
console.log('created session');

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const GardenApp = props => {
  const [encryptText, setEncryptText] = useState('');
  const [encryptHash, setEncryptHash] = useState('');
  const [decryptText, setDecryptText] = useState('');
  const [textToEncrypt, setTextToEncrypt] = useState('');

  const encryptUsingLit = async (msg: string) => {
    const { ciphertext, dataToEncryptHash } = await akashaSdk.services.common.lit.encryptText(msg);
    console.log('Encrypted text:', ciphertext, dataToEncryptHash);
    setEncryptText(ciphertext);
    setEncryptHash(dataToEncryptHash);
  };

  const decryptUsingLit = async () => {
    const decryptedText = await akashaSdk.services.common.lit.decryptText(encryptText, encryptHash);
    console.log('Decrypted text:', decryptedText);
    setDecryptText(decryptedText.data);
  };

  return (
    <div className="text-white">
      <h1>Welcome to the Garden App</h1>
      <p>This is a simple app that is part of the Garden extension.</p>
      <input
        type="text"
        placeholder="Enter text to encrypt"
        onChange={e => setTextToEncrypt(e.target.value)}
      />
      <button className="btn btn-primary" onClick={() => encryptUsingLit(textToEncrypt)}>
        Encrypt
      </button>
      <br />
      <p>Encrypted text: {encryptText}</p>

      <p>Decrypted text:</p>
      <button className="btn btn-primary" onClick={() => decryptUsingLit()}>
        Decrypt
      </button>
      <br />
      <code>{decryptText}</code>
    </div>
  );
};

export default GardenApp;
