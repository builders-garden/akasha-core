import { useState } from 'react';
import React from 'react';
import { initializeAkashaLit } from '../libs/akasha-lit';
// import { init } from '@akashaorg/core-sdk';

// const akashaSdk = init();
// console.log('connecting to Lit');
// await akashaSdk.services.common.lit.connect();
// console.log('connected to Lit');
// await akashaSdk.services.common.lit.createSession();
// console.log('created session');

const { sdk: akashaSdk, session } = await initializeAkashaLit();
console.log('akasha session:', session);

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
      <h1 className="text-4xl">Welcome to the Garden App</h1>
      <p>This is a simple app that is part of the Garden extension.</p>
      <div className="flex flex-col">
        <div className="flex flex-row my-2">
          <input
            type="text"
            placeholder="Enter text to encrypt"
            onChange={e => setTextToEncrypt(e.target.value)}
            className="py-[0.4em] px-[0.8em]"
          />
          <button
            className="py-[0.4em] px-[0.8em] bg-red-400 rounded-lg ml-[1em]"
            onClick={() => encryptUsingLit(textToEncrypt)}
          >
            Encrypt
          </button>
        </div>
        <div className="flex flex-col">
          <p className="my-4">Encrypted text:</p>
          <code className="p-4 bg-slate-600 my-[1em] rounded-lg min-h-60 w-full max-w-full text-wrap break-all">
            {encryptText || 'encrypted text will be displayed here'}
          </code>
        </div>
      </div>
      <hr className="my-4" />
      <div className="flex flex-col">
        <div className="flex flex-row my-2">
          <span>Click here to decrypt</span>
          <button
            className="py-[0.4em] px-[0.8em] bg-red-400 rounded-lg ml-[1em]"
            onClick={() => decryptUsingLit()}
          >
            Decrypt
          </button>
        </div>
        <div className="flex flex-col">
          <p className="my-4">Decrypted text:</p>
          <code className="p-4 bg-slate-600 my-[1em] rounded-lg min-h-60 max-w-full text-wrap break-words">
            {decryptText || 'decrypted text will be displayed here'}
          </code>
        </div>
      </div>
    </div>
  );
};

export default GardenApp;
