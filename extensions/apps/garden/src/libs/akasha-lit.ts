import { init } from '@akashaorg/core-sdk';

export async function initializeAkashaLit() {
  const akashaSdk = init();
  console.log('connecting to Lit');
  await akashaSdk.services.common.lit.connect();
  console.log('connected to Lit');
  const session = await akashaSdk.services.common.lit.createSession();
  console.log('created session');
  return {
    sdk: akashaSdk,
    session,
  };
}
