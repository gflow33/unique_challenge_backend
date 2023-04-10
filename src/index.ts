import { generateAccount, SignatureType } from '@unique-nft/accounts';
import express, { Express, Request, Response } from 'express';
import { Sdk } from '@unique-nft/sdk';
import { KeyringProvider } from '@unique-nft/accounts/keyring';
const { graphqlHTTP } = require('express-graphql');
const { buildSchema } = require('graphql');
//import { CreateTokenNewArguments } from '@unique-nft/substrate-client/tokens/types';
/*import {
    UniqueCollectionSchemaToCreate,
    COLLECTION_SCHEMA_NAME,
    AttributeType,
} from '@unique-nft/substrate-client/tokens';*/
import { TransferArguments } from '@unique-nft/substrate-client/tokens';
import {
  AttributeType,
  COLLECTION_SCHEMA_NAME,
  UniqueCollectionSchemaToCreate,
} from '@unique-nft/schemas'

const bareUrl = "https://rest.unique.network/opal/v1";

const bodyParser = require('body-parser');

const app: Express = express();
const axios = require('axios');
app.use(bodyParser.json());
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


const collectionSchema: UniqueCollectionSchemaToCreate = {
  schemaName: COLLECTION_SCHEMA_NAME.unique,
  schemaVersion: '1.0.0',
  image: {
    urlTemplate: 'https://ipfs.unique.network/ipfs/{infix}'
  },
  coverPicture: {
    ipfsCid: 'QmNiBHiAhsjBXj5cXShDUc5q1dX23CJYrqGGPBNjQCCSXQ',
  },

  attributesSchemaVersion: '1.0.0',
  attributesSchema: {
    0: {
      name: { _: 'safari text' },
      type: AttributeType.string,
      optional: true,
      isArray: false,
    },
    1: {
      name: { _: 'safari color' },
      type: AttributeType.string,
      optional: false,
      isArray: false,
      enumValues: {
        0: { _: 'safari attendee gold' },
        1: { _: 'safari attendee silver' },
      }
    },
    2: {
      name: { _: 'safari art' },
      type: AttributeType.string,
      optional: true,
      isArray: true,
      enumValues: {
        0: { _: 'art 1' },
        1: { _: 'art 2' },
        2: { _: 'art 3' }
      }
    }
  },
}






app.get('/', (req: Request, res: Response) => {
  res.send('Hello, this is Express + TypeScript');
});

app.listen(port, () => {
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




app.post('/make-nft', async (req, res) => {
  const { collection_id, ipfscid } = req.body;
  console.log(`Received collection ID: ${collection_id}`);
  console.log(`Received IPFS CID: ${ipfscid}`);


  res.setHeader('Content-Type', 'application/json');
  //res.send(JSON.stringify(account));
  const signer = await KeyringProvider.fromMnemonic("lobster copper ghost tube public follow symptom attitude figure sense dizzy miss");
  const address = signer.instance.address;

  const sdk = createSdk(signer);

  const createTokenArgs: any = {
    address: address,
    collectionId: collection_id,
    data: {
      encodedAttributes: {
        '1': 0
      },
      image: {
        ipfsCid: ipfscid,
      },
    },
  };

  const result = await sdk.tokens.create.submitWaitResult(createTokenArgs);
  const { collectionId, tokenId } = result.parsed;

  const token = await sdk.tokens.get({ collectionId, tokenId });

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(token));

});


app.post('/create-collection', async (req, res) => {
  // old
  // const mnemonic: any = req.query.mnemonic
  // const signer = await KeyringProvider.fromMnemonic(mnemonic);
  // const address = signer.instance.address;

  // const sdk = createSdk(signer);

  // const collection = await createCollection(sdk, address);
  // console.log('Сollection was created. ID: ', collection);



  //NEW
  const account = await KeyringProvider.fromMnemonic('lobster copper ghost tube public follow symptom attitude figure sense dizzy miss')

  const sdk = new Sdk({
    baseUrl: 'https://rest.unique.network/opal/v1',
    signer: account,
  });

  const { collection_name, description, token_prefix } = req.body;
  console.log(`Received collection ID: ${collection_name}`);
  console.log(`Received IPFS CID: ${description}`);
  console.log(`Received IPFS CID: ${token_prefix}`);


  const collectionResult = await sdk.collections.creation.submitWaitResult({
    address: account.getAddress(),
    name: collection_name,
    description: description,
    tokenPrefix: token_prefix,
    schema: collectionSchema,
    tokenPropertyPermissions: [
      {
        key: 'a.0',
        permission: {
          mutable: true,
          tokenOwner: true,
          collectionAdmin: true,
        }
      }
    ]
  })

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(collectionResult.parsed));

});


app.post('/create-token', async (req, res) => {
  console.log("ewer")

  //const collection_id = req.params.collection_id;
  //const ipfscid = req.params.ipfscid;

  const collection_id = "", ipfscid = "";
  console.log("" + " " + collection_id + " " + ipfscid)

  const signer = await KeyringProvider.fromMnemonic("lobster copper ghost tube public follow symptom attitude figure sense dizzy miss");
  const address = signer.instance.address;

  const sdk = createSdk(signer);

  const createTokenArgs: any = {
    address: address,
    collectionId: collection_id,
    data: {
      encodedAttributes: {
        '0': 0,
        '1': 0,
        '2': [0, 1],
      },
      image: {
        ipfsCid: ipfscid,
      },
    },
  };

  const result = await sdk.tokens.create.submitWaitResult(createTokenArgs);
  const { collectionId, tokenId } = result.parsed;

  const token = await sdk.tokens.get({ collectionId, tokenId });

  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(token));
});

app.post('/transfer-token', async (req, res) => {
 
  console.log("transfer"+ req.body.mnemonic);

  const mnemonic = req.body.mnemonic;
  const collection_id = req.body.collection_id;
  const my_address = req.body.my_address;
  const sender_address = req.body.sender_address;
  var token_id = "";

    const args = {
      address: sender_address,
      to: my_address,
      collectionId: collection_id,
      tokenId: 3,
    };

    const signer = await KeyringProvider.fromMnemonic(mnemonic);
    const sdk = createSdk(signer);
    const result = await sdk.tokens.transfer.submitWaitResult(args);
    console.log("transfer  "+ JSON.stringify(result.parsed));
   
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(result.parsed));
  
});
