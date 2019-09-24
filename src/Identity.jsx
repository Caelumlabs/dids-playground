import React, { useEffect, useState } from "react";
import {zenroom} from 'zenroom'
import { Modal, Button, Image, Header, Form, Input, Card, Icon, Container } from "semantic-ui-react";
const { mnemonicGenerate, mnemonicToSeed, mnemonicValidate, naclKeypairFromSeed } = require('@polkadot/util-crypto');
const { encodeAddress, decodeAddress } = require('@polkadot/keyring');

export default function Identity(props) {
  const { api, is_open } = props;
  const [open, setOpen] = useState(is_open);
  const [id_name, setName] = useState('');
  const [id_ready, setIdReady] = useState(false);
  const [id_handler, setIdHandler] = useState(null);
  const [keyring, setKeyring] = useState({mnemonic:'', publicKey: '', secretKey: ''});

  useEffect(() => {
    const idName = localStorage.getItem('idName');
    setIdReady( idName !== null );
    setIdHandler(idName);
    console.log(idName);
  });

  const openModal = () =>  {
    const mnemonic = mnemonicGenerate();
    const seed = mnemonicToSeed(mnemonic);
    // Generate new public/secret keypair for Alice from the supplied seed
    const { secretKey, publicKey } = naclKeypairFromSeed(seed);
    setKeyring({
      mnemonic,
      secretKey,
      publicKey,
      address: encodeAddress(publicKey)
    });
    setOpen( true );

  }
  const saveIdentity = () => {
    localStorage.setItem('idName', id_name);
    setOpen( false );
    setIdReady(true);
    setIdHandler(id_name);
  }

  const conditional = () => {
    if (id_ready) {
      return (
        <Card.Content>handler: @{id_handler}<br/>
        Address: {keyring.address} </Card.Content>
      )
    }
    else {
      return (
        <Card.Content description="No identity has been created. Create One" />
      )
    }
  }
  
  return (
      <Card fluid>
        <Card.Content header="Radices Identity" />
        {conditional()}
        <Card.Content>
          <a href="#" onClick={() => openModal()}>Add Identity</a><br/>
          <a href="#" onClick={() => openModal()}>Clear all Identities</a>
          <Modal
        open={open}
        centered={false}
      >
    <Modal.Header>Add a new Identity</Modal.Header>
    <Modal.Content image>
      <Image wrapped size='medium' src='/logo.png' />
      <Modal.Description>
        <Header>Name your identity</Header>
        <p>
          This is your seed : {keyring.mnemonic}
        </p>
        <Form>
        <Form.Field>
          <Input
            onChange={(_, data) => {setName(data.value)}}
            label="Name"
            fluid
            placeholder="identity"
            state="id_name"
            type="text"
          />
        </Form.Field>
        <Form.Field>
            <Button
                primary
                type="submit"
                disabled={id_name.length<3}
                onClick={() => saveIdentity()}
            >
                Add
            </Button>
        </Form.Field>
      </Form>
        
      </Modal.Description>
    </Modal.Content>
  </Modal>          
        </Card.Content>
      </Card>
);
}



