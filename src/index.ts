import { generateAccount, SignatureType } from '@unique-nft/accounts';
import express, {Express, Request, Response} from 'express';
import { Sdk } from '@unique-nft/sdk';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
//import { CreateTokenNewArguments } from '@unique-nft/substrate-client/tokens/types';
/*import {
    UniqueCollectionSchemaToCreate,
    COLLECTION_SCHEMA_NAME,
    AttributeType,
} from '@unique-nft/substrate-client/tokens';*/
import { TransferArguments } from '@unique-nft/substrate-client/tokens';

const bareUrl = "https://rest.unique.network/opal/v1";


const app: Express = express();
const port = 3000;
function createSdk(account) {
  const options = {
    baseUrl: bareUrl,
    signer: account,
  }
  return new Sdk(options);
}
export async function createCollection(sdk, address) {
  const { parsed, error } = await sdk.collections.creation.submitWaitResult({
    address,
    name: 'Test collection',
    description: 'My test collection',
    tokenPrefix: 'TST',
  });

  if (error) {
    console.log('Error occurred while creating a collection. ', error);
    process.exit();
  }

  const { collectionId } = parsed;

  return sdk.collections.get({ collectionId });
}

export async function createToken(sdk, address, collectionId) {
  const { parsed, error } = await sdk.tokens.create.submitWaitResult({
    address,
    collectionId,
  });

  if (error) {
    console.log('create token error', error);
    process.exit();
  }

  const { tokenId } = parsed;

  return sdk.tokens.get({ collectionId, tokenId });
}

app.get('/', (req: Request, res: Response)=>{
    res.send('Hello, this is Express + TypeScript');
});

app.listen(port, ()=> {
console.log(`[Server]: I am running at https://localhost:${port}`);
});



app.get('/create-account', async (req, res) => {
    
    const account = await generateAccount({
      pairType: SignatureType.Sr25519,
      meta: {
        name: 'my_unique_account'
      }
    })
    
    console.log(account);
 
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(account));

 
});
app.get('/create-collection', async (req, res) => {
  const mnemonic: any = req.query.mnemonic
  const signer = await KeyringProvider.fromMnemonic(mnemonic);
  const address = signer.instance.address;

  const sdk = createSdk(signer);

  const collection = await createCollection(sdk, address);
  console.log('Сollection was created. ID: ', collection);
});

app.get('/create-token', async (req, res) => {
  const mnemonic: any = req.query.mnemonic
  const signer = await KeyringProvider.fromMnemonic(mnemonic);
  const address = signer.instance.address;

  const sdk = createSdk(signer);

  const collection = await createCollection(sdk, address);
  console.log('collection', collection);

  const token = await createToken(sdk, address, collection.id);
  console.log('token', token);
});

app.get('/transfer-token', async (req, res) => {
  const args: TransferArguments = {
    address: '<address>',
    to: '<address>',
    collectionId: 1,
    tokenId: 1,
  };
  const mnemonic: any = req.query.mnemonic
  const signer = await KeyringProvider.fromMnemonic(mnemonic);
  const sdk = createSdk(signer);
  const result = await sdk.tokens.transfer.submitWaitResult(args);
  
  console.log(result.parsed);
})